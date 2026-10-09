import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Rspack } from '@rsbuild/core';
import type { ReactRouterServerBuilds } from './dev-runtime-artifacts.js';
import { resolveServerBuildModule } from './server-build-resolution.js';
import {
  NODE_LAZY_REGISTRY,
  NODE_LAZY_SIDECAR,
  type NodeLazyBridge,
  type NodeLazyClientOptions,
  type NodeLazyHotRuntime,
  type NodeLazyRegistration,
} from './dev-node-lazy-protocol.js';

export type RebuildOrigin = NonNullable<Rspack.Compilation['rebuildOrigin']>;
export type WatchInvalidation = RebuildOrigin['causes'][number];

const failure = (message: string): Error =>
  new Error(`[rsbuild-plugin-react-router] ${message}`);
const asError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));

type ModuleFact = {
  id: string | number | null;
  hashes: string;
  edges: ReadonlySet<string>;
  lazyTargets: ReadonlySet<string>;
};
type NodeSnapshot = {
  hash: string;
  files: ReadonlyMap<string, Uint8Array>;
  entries: ReadonlyMap<string, string>;
  modules: ReadonlyMap<string, ModuleFact>;
  origin: RebuildOrigin;
  esm: boolean;
  root: string;
};
type Gate = {
  nativeReady: boolean;
  value?: unknown;
  resolve(value: unknown): void;
  reject(error: Error): void;
};
type RuntimeSlot = {
  hot: NodeLazyHotRuntime;
  gates: Set<Gate>;
  demands: Map<string, Set<(error: Error) => void>>;
};
type SourceRuntime = {
  id: string;
  directory: string;
  phase:
    | 'bootstrap'
    | 'serving'
    | 'applying'
    | 'awaiting-publication'
    | 'retired'
    | 'quarantined'
    | 'closed';
  slots: Set<RuntimeSlot>;
  snapshot: NodeSnapshot;
  builds: ReactRouterServerBuilds;
  error?: Error;
  activationError?: Error;
  recover?: Candidate['recover'];
};

type Candidate = {
  compilation: Rspack.Compilation;
  reuse?: boolean;
  isCurrent(): boolean;
  recover(builds: ReactRouterServerBuilds): void;
};
export type DevNodeLazyOwner = {
  observeInvalidation(event: WatchInvalidation): void;
  capture(compilation: Rspack.Compilation): void;
  isActivation(compilation: Rspack.Compilation): Promise<boolean>;
  evaluateAndPublish(
    candidate: Candidate,
    publish: (builds: ReactRouterServerBuilds) => boolean
  ): Promise<boolean>;
  fail(error: Error): void;
  ready(): Promise<void>;
  close(error: Error): Promise<void>;
};

const registry = (): Map<string, NodeLazyRegistration> => {
  const key = Symbol.for(NODE_LAZY_REGISTRY);
  let value = Reflect.get(globalThis, key) as
    | Map<string, NodeLazyRegistration>
    | undefined;
  if (!value) {
    value = new Map();
    Reflect.set(globalThis, key, value);
  }
  return value;
};

const snapshot = (
  compilation: Rspack.Compilation,
  entryNames: readonly string[]
): NodeSnapshot => {
  const origin = compilation.rebuildOrigin;
  if (!origin)
    throw failure('The Node compilation did not provide rebuildOrigin.');
  if (!compilation.hash)
    throw failure('The Node compilation did not provide a runtime hash.');
  const modules = new Map<string, ModuleFact>();
  for (const module of compilation.modules) {
    const hashes = new Map<string, string>();
    for (const chunk of compilation.chunkGraph.getModuleChunksIterable(
      module
    )) {
      const runtime = new Set(chunk.runtime);
      const hash = compilation.chunkGraph.getModuleHash(module, runtime);
      if (!hash)
        throw failure(
          `No runtime hash is available for ${module.identifier()}.`
        );
      hashes.set([...runtime].sort().join('\0'), hash);
    }
    const edges = new Set<string>();
    const lazyTargets = new Set<string>();
    for (const connection of compilation.moduleGraph.getOutgoingConnections(
      module
    )) {
      if (!connection.module) continue;
      const identifier = connection.module.identifier();
      edges.add(identifier);
      if (connection.dependency?.type === 'lazy import()')
        lazyTargets.add(identifier);
    }
    modules.set(module.identifier(), {
      id: compilation.chunkGraph.getModuleId(module),
      hashes: JSON.stringify(
        [...hashes].sort(([a], [b]) => a.localeCompare(b))
      ),
      edges,
      lazyTargets,
    });
  }
  const files = new Map<string, Uint8Array>();
  for (const asset of compilation.getAssets()) {
    const bytes = asset.source?.buffer();
    if (!bytes) throw failure(`The Node asset ${asset.name} is unavailable.`);
    files.set(asset.name, Buffer.from(bytes));
  }
  const entries = new Map<string, string>();
  for (const entryName of entryNames) {
    const files = [
      ...(compilation.entrypoints.get(entryName)?.getEntrypointChunk().files ??
        []),
    ].filter(
      file =>
        /\.[cm]?js$/.test(file) &&
        !compilation.getAsset(file)?.info.hotModuleReplacement
    );
    if (!files || files.length !== 1)
      throw failure(
        `Server lazy compilation requires one native file for entry ${entryName}.`
      );
    entries.set(entryName, files[0]);
  }
  return {
    hash: compilation.hash,
    files,
    entries,
    modules,
    origin,
    esm: !!compilation.outputOptions.module,
    root: compilation.compiler.context,
  };
};

const equalSet = (
  left: ReadonlySet<string>,
  right: ReadonlySet<string>
): boolean =>
  left.size === right.size && [...left].every(value => right.has(value));

const proveActivation = (
  previous: NodeSnapshot,
  next: NodeSnapshot,
  demands: ReadonlySet<string>
): Set<string | number> => {
  const { origin } = next;
  if (
    origin.watchId !== previous.origin.watchId ||
    origin.throughRevision <= previous.origin.throughRevision ||
    !origin.causes.length ||
    !origin.consumedLazyKeys.length
  ) {
    throw failure('The Node lazy activation has no complete watch origin.');
  }
  const keys = new Set(origin.consumedLazyKeys);
  const caused = new Set<string>();
  let revision = previous.origin.throughRevision;
  for (const event of origin.causes) {
    if (
      event.watchId !== origin.watchId ||
      event.revision !== ++revision ||
      event.revision > origin.throughRevision ||
      event.cause.kind !== 'lazy'
    ) {
      throw failure(
        'A source or unknown invalidation superseded the Node lazy activation.'
      );
    }
    for (const key of event.cause.keys) caused.add(key);
  }
  if (
    revision !== origin.throughRevision ||
    !equalSet(keys, caused) ||
    [...keys].some(key => !demands.has(key))
  )
    throw failure(
      'The Node lazy activation does not match its pending import keys.'
    );
  const allowed = new Set<string | number>();
  const reachable = new Set<string>();
  const visit = (identifier: string): void => {
    if (reachable.has(identifier)) return;
    reachable.add(identifier);
    for (const edge of next.modules.get(identifier)?.edges ?? []) visit(edge);
  };
  for (const key of keys) {
    const before = previous.modules.get(key);
    const after = next.modules.get(key);
    if (
      !before ||
      !after ||
      before.lazyTargets.size ||
      !after.lazyTargets.size ||
      after.id === null
    )
      throw failure(`The lazy proxy ${key} did not acquire its import edge.`);
    allowed.add(after.id);
    for (const target of after.lazyTargets) visit(target);
  }
  for (const [identifier, before] of previous.modules) {
    const after = next.modules.get(identifier);
    if (!after || before.id !== after.id)
      throw failure(
        `Node lazy activation removed or renumbered ${identifier}.`
      );
    if (
      !keys.has(identifier) &&
      (before.hashes !== after.hashes || !equalSet(before.edges, after.edges))
    )
      throw failure(
        `Node lazy activation changed an existing module ${identifier}.`
      );
  }
  for (const [identifier, module] of next.modules) {
    if (previous.modules.has(identifier)) continue;
    if (!reachable.has(identifier))
      throw failure(
        `Node lazy activation introduced an unrelated module ${identifier}.`
      );
    if (module.id !== null) allowed.add(module.id);
  }
  return allowed;
};

const allDemands = (runtime: SourceRuntime): Set<string> =>
  new Set([...runtime.slots].flatMap(slot => [...slot.demands.keys()]));

const rejectPending = (runtime: SourceRuntime, error: Error): void => {
  for (const slot of runtime.slots) {
    for (const gate of slot.gates) gate.reject(error);
    slot.gates.clear();
    for (const callbacks of slot.demands.values())
      for (const callback of callbacks) callback(error);
    slot.demands.clear();
  }
};

const release = (runtime: SourceRuntime): void => {
  if (runtime.phase !== 'serving' || allDemands(runtime).size) return;
  for (const slot of runtime.slots) {
    for (const gate of slot.gates) {
      if (!gate.nativeReady) continue;
      slot.gates.delete(gate);
      gate.resolve(gate.value);
    }
  }
};

// Native chunk caches use file paths, so each entry needs its own factories.
const entryDirectory = (runtime: SourceRuntime, entryName: string): string =>
  join(runtime.directory, createHash('sha256').update(entryName).digest('hex'));

const writeSnapshot = async (
  runtime: SourceRuntime,
  files: ReadonlyMap<string, Uint8Array>
): Promise<void> => {
  for (const entryName of runtime.snapshot.entries.keys()) {
    const directory = entryDirectory(runtime, entryName);
    const directories = new Set<string>([directory]);
    for (const [name, bytes] of files) {
      const path = resolve(directory, name);
      const relativePath = relative(directory, path);
      if (
        isAbsolute(relativePath) ||
        relativePath === '..' ||
        relativePath.startsWith(`..${sep}`)
      )
        throw failure(
          `Node output asset escapes its runtime directory: ${name}.`
        );
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, bytes);
      directories.add(dirname(path));
    }
    await writeFile(
      join(directory, 'package.json'),
      JSON.stringify({ type: runtime.snapshot.esm ? 'module' : 'commonjs' })
    );
    for (const outputDirectory of directories) {
      await writeFile(
        join(outputDirectory, NODE_LAZY_SIDECAR),
        `module.exports = globalThis[Symbol.for(${JSON.stringify(NODE_LAZY_REGISTRY)})].get(${JSON.stringify(runtime.id)});\n`
      );
    }
  }
};

export const createDevNodeLazyOwner = (
  entryNames: readonly string[]
): DevNodeLazyOwner => {
  const snapshots = new WeakMap<Rspack.Compilation, NodeSnapshot>();
  const journal: NodeSnapshot[] = [];
  const runtimes = new Set<SourceRuntime>();
  let current: SourceRuntime | undefined;
  let closed: Error | undefined;
  let recovery: Promise<void> = Promise.resolve();
  let activationSettled: Promise<void> = Promise.resolve();
  let latest: WatchInvalidation | undefined;
  let epoch = 0;
  const operations = new Set<Promise<unknown>>();
  let cleanup: Promise<void> | undefined;
  let rejectClosed!: (error: Error) => void;
  const closedPromise = new Promise<never>((_, reject) => {
    rejectClosed = reject;
  });
  void closedPromise.catch(() => undefined);
  const interruptible = <T>(promise: Promise<T>): Promise<T> =>
    Promise.race([promise, closedPromise]);
  const activatedBackendKeys = new Set<string>();

  const open = async (accepted: NodeSnapshot): Promise<SourceRuntime> => {
    if (closed) throw closed;
    const directory = join(
      accepted.root,
      'node_modules/.cache/react-router/runtimes'
    );
    await mkdir(directory, { recursive: true });
    const runtime: SourceRuntime = {
      id: randomUUID(),
      directory: await mkdtemp(join(directory, 'source-')),
      phase: 'bootstrap',
      slots: new Set(),
      snapshot: accepted,
      builds: {},
    };
    runtimes.add(runtime);
    registry().set(runtime.id, {
      register(hot) {
        const slot: RuntimeSlot = { hot, gates: new Set(), demands: new Map() };
        runtime.slots.add(slot);
        const bridge: NodeLazyBridge = {
          gate<T>(native: Promise<T>): Promise<T> {
            const result = new Promise<T>((resolve, reject) => {
              const gate: Gate = {
                nativeReady: false,
                resolve: value => resolve(value as T),
                reject,
              };
              slot.gates.add(gate);
              Promise.resolve(native).then(
                value => {
                  gate.nativeReady = true;
                  gate.value = value;
                  if (runtime.error || runtime.phase === 'retired') {
                    slot.gates.delete(gate);
                    reject(
                      runtime.error ??
                        failure('The server source generation was superseded.')
                    );
                  } else if (
                    runtime.phase === 'bootstrap' &&
                    !allDemands(runtime).size
                  ) {
                    slot.gates.delete(gate);
                    resolve(value);
                  } else release(runtime);
                },
                error => {
                  slot.gates.delete(gate);
                  reject(error);
                }
              );
              if (runtime.error) {
                slot.gates.delete(gate);
                reject(runtime.error);
              }
            });
            void result.catch(() => undefined);
            return result;
          },
          demand(options: NodeLazyClientOptions, endpoint: string): () => void {
            if (options.active) return () => undefined;
            if (runtime.activationError) {
              options.onError(runtime.activationError);
              return () => undefined;
            }
            if (runtime.phase === 'bootstrap') {
              runtime.error = failure(
                'A server lazy import cannot activate before initial publication. Move this import out of module initialization or compile it eagerly.'
              );
            } else if (
              activatedBackendKeys.has(options.data) &&
              !allDemands(runtime).has(options.data) &&
              !runtime.snapshot.modules.get(options.data)?.lazyTargets.size
            ) {
              runtime.error = failure(
                'This server import was activated in a failed or superseded generation. Edit its source to rebuild before retrying.'
              );
            } else if (runtime.phase === 'retired') {
              runtime.error = failure(
                'A lazy import belongs to a superseded server source generation.'
              );
            }
            if (runtime.error) {
              options.onError(runtime.error);
              rejectPending(runtime, runtime.error);
              return () => undefined;
            }
            let callbacks = slot.demands.get(options.data);
            if (!callbacks) {
              callbacks = new Set();
              slot.demands.set(options.data, callbacks);
              void fetch(endpoint, { method: 'POST', body: options.data })
                .then(response => {
                  if (!response.ok)
                    throw failure(
                      `The Node lazy endpoint returned HTTP ${response.status}.`
                    );
                })
                .catch(cause => {
                  const error = asError(cause);
                  rejectPending(runtime, error);
                });
            }
            callbacks.add(options.onError);
            return () => callbacks.delete(options.onError);
          },
        };
        return bridge;
      },
    });
    try {
      if (closed) throw closed;
      await writeSnapshot(runtime, accepted.files);
      if (closed) throw closed;
      const builds: Record<
        string,
        Awaited<ReturnType<typeof resolveServerBuildModule>>
      > = {};
      for (const [entryName, file] of accepted.entries) {
        const path = join(entryDirectory(runtime, entryName), file);
        const build = await interruptible(
          accepted.esm
            ? import(pathToFileURL(path).href)
            : Promise.resolve().then(() => createRequire(path)(path))
        );
        builds[entryName] = await interruptible(
          resolveServerBuildModule(build, `Server entry ${entryName}`)
        );
      }
      if (runtime.error) throw runtime.error;
      if (
        runtime.slots.size === 0 ||
        [...runtime.slots].some(slot => slot.hot.hash() !== accepted.hash)
      )
        throw failure(
          'The native server entry did not register the accepted Node runtime hash.'
        );
      runtime.builds = builds;
      return runtime;
    } catch (cause) {
      runtime.phase = 'quarantined';
      runtime.error = asError(cause);
      rejectPending(runtime, runtime.error);
      throw runtime.error;
    }
  };

  const pathTo = (
    compilation: Rspack.Compilation
  ): {
    next: NodeSnapshot;
    chain: NodeSnapshot[];
    allowed: Set<string | number>;
  } => {
    if (
      !current ||
      (current.phase !== 'serving' && current.phase !== 'awaiting-publication')
    )
      throw failure(
        'No accepted server runtime can receive a lazy activation.'
      );
    const next = snapshots.get(compilation);
    if (!next)
      throw failure(
        'The Node compilation has no successful artifact snapshot.'
      );
    if (
      latest &&
      (latest.watchId !== next.origin.watchId ||
        latest.revision > next.origin.throughRevision)
    )
      throw failure(
        'The lazy compilation was superseded by another watch event.'
      );
    const chain = journal.filter(
      item =>
        item.origin.watchId === next.origin.watchId &&
        item.origin.throughRevision >
          current!.snapshot.origin.throughRevision &&
        item.origin.throughRevision <= next.origin.throughRevision
    );
    if (chain.at(-1) !== next)
      throw failure('The Node lazy update chain is incomplete.');
    const allowed = new Set<string | number>();
    const demands = allDemands(current);
    let previous = current.snapshot;
    for (const item of chain) {
      for (const id of proveActivation(previous, item, demands))
        allowed.add(id);
      previous = item;
    }
    return { next, chain, allowed };
  };

  const restore = (runtime: SourceRuntime, error: Error): Promise<void> => {
    runtime.phase = 'quarantined';
    runtime.error = error;
    rejectPending(runtime, error);
    recovery = (async () => {
      if (closed || current !== runtime) return;
      const restored = await open(runtime.snapshot);
      if (closed || current !== runtime) {
        restored.phase = 'retired';
        return;
      }
      restored.activationError = failure(
        'Server lazy activation is unavailable after a failed native update. Edit a server source file to rebuild before requesting an inactive import.'
      );
      current = restored;
      restored.phase = 'serving';
      runtime.recover?.(restored.builds);
      release(restored);
    })();
    void recovery.catch(() => undefined);
    return recovery;
  };

  const evaluateAndPublish = async (
    candidate: Candidate,
    publish: (builds: ReactRouterServerBuilds) => boolean
  ): Promise<boolean> => {
    await interruptible(recovery);
    if (closed) throw closed;
    const next = snapshots.get(candidate.compilation);
    if (!next)
      throw failure('The successful Node compilation has no runtime snapshot.');
    if (
      candidate.reuse &&
      current?.phase === 'serving' &&
      [...current.slots].every(slot => slot.hot.hash() === next.hash)
    ) {
      if (!candidate.isCurrent() || !publish(current.builds)) return false;
      current.snapshot = next;
      journal.splice(0, journal.indexOf(next) + 1);
      return true;
    }
    const activation =
      current &&
      next.origin.causes.length > 0 &&
      next.origin.causes.every(event => event.cause.kind === 'lazy')
        ? pathTo(candidate.compilation)
        : undefined;
    if (!activation) {
      const fresh = await open(next);
      let published = false;
      try {
        published = !closed && candidate.isCurrent() && publish(fresh.builds);
      } catch (cause) {
        fresh.phase = 'quarantined';
        fresh.error = asError(cause);
        rejectPending(fresh, fresh.error);
        throw fresh.error;
      }
      if (!published) {
        fresh.phase = 'retired';
        rejectPending(
          fresh,
          closed ?? failure('The server candidate was superseded.')
        );
        return false;
      }
      if (current) {
        current.phase = 'retired';
        rejectPending(
          current,
          failure('The server source generation was superseded.')
        );
      }
      current = fresh;
      fresh.phase = 'serving';
      release(fresh);
      journal.splice(0, journal.indexOf(next) + 1);
      return true;
    }
    const runtime = current!;
    const accepted = runtime.snapshot;
    const observedEpoch = epoch;
    runtime.recover = candidate.recover;
    runtime.phase = 'applying';
    let finishActivation!: () => void;
    activationSettled = new Promise(resolve => {
      finishActivation = resolve;
    });
    const assertCurrent = (): void => {
      if (closed || epoch !== observedEpoch || current !== runtime)
        throw (
          closed ??
          failure(
            'The server lazy activation was superseded before publication.'
          )
        );
    };
    try {
      const files = new Map(accepted.files);
      for (const item of activation.chain)
        for (const [name, bytes] of item.files) files.set(name, bytes);
      await writeSnapshot(runtime, files);
      assertCurrent();
      for (const slot of runtime.slots) {
        const seen = new Set<string>();
        while (slot.hot.hash() !== next.hash) {
          const hash = slot.hot.hash();
          if (seen.has(hash))
            throw failure(
              'The Node HMR runtime did not advance toward the accepted hash.'
            );
          seen.add(hash);
          const ids = await interruptible(slot.hot.check());
          assertCurrent();
          if (!ids)
            throw failure(
              `The Node runtime has no hot update from ${hash} to accepted hash ${next.hash}.`
            );
          const unexpected = ids.filter(id => !activation.allowed.has(id));
          if (unexpected.length)
            throw failure(
              `The Node hot update contains modules outside the proven lazy activation: ${JSON.stringify(unexpected)}.`
            );
          await interruptible(slot.hot.apply());
          assertCurrent();
        }
      }
      if (!candidate.isCurrent()) {
        runtime.phase = 'awaiting-publication';
        return false;
      }
      if (!publish(runtime.builds))
        throw failure(
          'The server lazy activation was superseded before publication.'
        );
      runtime.snapshot = { ...next, files };
      for (const item of activation.chain)
        for (const key of item.origin.consumedLazyKeys)
          for (const slot of runtime.slots) slot.demands.delete(key);
      runtime.phase = 'serving';
      runtime.recover = undefined;
      journal.splice(0, journal.indexOf(next) + 1);
      release(runtime);
      return true;
    } catch (cause) {
      const error = asError(cause);
      await restore(runtime, error);
      throw error;
    } finally {
      finishActivation();
    }
  };

  return {
    observeInvalidation(event) {
      latest = event;
      if (event.cause.kind === 'lazy') {
        for (const key of event.cause.keys) activatedBackendKeys.add(key);
        return;
      }
      if (event.cause.kind === 'initial') return;
      epoch++;
      if (current)
        rejectPending(
          current,
          failure(
            'A source or unknown invalidation superseded the pending server import.'
          )
        );
      journal.length = 0;
    },
    capture(compilation) {
      if (snapshots.has(compilation)) return;
      const captured = snapshot(compilation, entryNames);
      snapshots.set(compilation, captured);
      journal.push(captured);
    },
    async isActivation(compilation) {
      try {
        if (
          compilation.rebuildOrigin?.causes.every(
            event => event.cause.kind === 'lazy'
          )
        )
          await interruptible(activationSettled);
        pathTo(compilation);
        return true;
      } catch {
        return false;
      }
    },
    evaluateAndPublish(candidate, publish) {
      const operation = evaluateAndPublish(candidate, publish);
      operations.add(operation);
      void operation
        .finally(() => operations.delete(operation))
        .catch(() => undefined);
      return operation;
    },

    fail(error) {
      epoch++;
      if (current?.phase === 'awaiting-publication')
        void restore(current, error);
      else if (current) rejectPending(current, error);
    },
    ready() {
      return recovery;
    },
    close(error) {
      if (cleanup) return cleanup;
      closed = error;
      rejectClosed(error);
      epoch++;
      for (const runtime of runtimes) {
        runtime.phase = 'closed';
        runtime.error = error;
        rejectPending(runtime, error);
      }
      cleanup = (async () => {
        await Promise.allSettled([...operations, recovery]);
        for (const runtime of runtimes) {
          registry().delete(runtime.id);
          const require = createRequire(
            join(runtime.directory, 'package.json')
          );
          for (const key of Object.keys(require.cache))
            if (key.startsWith(`${runtime.directory}${sep}`))
              delete require.cache[key];
          await rm(runtime.directory, { recursive: true, force: true });
        }
      })();
      return cleanup;
    },
  };
};
