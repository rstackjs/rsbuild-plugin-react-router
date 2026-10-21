import { mkdir, rename, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RsbuildDevServer, Rspack } from '@rsbuild/core';
import { createRequestListener } from '@remix-run/node-fetch-server';
import { applicationRequire } from './config.js';
import type { Remix2AssetsManifest, Remix2ServerBuild } from './types.js';

export interface Remix2Generation {
  build: Remix2ServerBuild;
  manifest: Remix2AssetsManifest;
}

export class Remix2DevAssets {
  private current: ReadonlyMap<string, Buffer> = new Map();
  private readonly immutable = new Map<string, Buffer>();

  publish(
    compilation: Rspack.Compilation,
    assets: ReadonlyMap<string, Buffer>
  ): void {
    for (const { name, info } of compilation.getAssets()) {
      if (info.immutable) this.immutable.set(name, assets.get(name)!);
    }
    this.current = assets;
  }

  get(name: string): Buffer | undefined {
    return this.current.get(name) ?? this.immutable.get(name);
  }

  clear(): void {
    this.current = new Map();
    this.immutable.clear();
  }
}

export type Remix2DevState =
  | { kind: 'starting' }
  | { kind: 'ready'; generation: Remix2Generation }
  | { kind: 'closed'; error: Error };

export interface Remix2ReloadChannel {
  middleware(req: IncomingMessage, res: ServerResponse, next: () => void): void;
  publish(): void;
  close(): void;
}

export function createRemix2ReloadChannel(): Remix2ReloadChannel {
  const clients = new Set<ServerResponse>();
  return {
    middleware(req, res, next) {
      if (req.url !== '/__remix2/events') {
        next();
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
      });
      res.write(': connected\n\n');
      clients.add(res);
      req.on('close', () => {
        clients.delete(res);
      });
    },
    publish() {
      for (const client of clients) client.write('data: reload\n\n');
    },
    close() {
      for (const client of clients) client.end();
      clients.clear();
    },
  };
}

const registryKey = Symbol.for(
  'rsbuild-plugin-react-router.remix2.generations'
);
const registries = globalThis as typeof globalThis & {
  [registryKey]?: WeakMap<RsbuildDevServer, () => Promise<Remix2ServerBuild>>;
};
const registry = (registries[registryKey] ??= new WeakMap());

export function registerRemix2DevServer(
  server: RsbuildDevServer,
  load: () => Promise<Remix2ServerBuild>
): () => void {
  registry.set(server, load);
  return () => {
    registry.delete(server);
  };
}

export function loadRemix2ServerBuild(
  server: RsbuildDevServer
): Promise<Remix2ServerBuild> {
  const load = registry.get(server);
  return load
    ? load()
    : Promise.reject(
        new Error(
          '[remix2] This dev server is not registered with pluginRemix2.'
        )
      );
}

export function snapshotRemix2Assets(
  compilation: Rspack.Compilation
): Map<string, Buffer> {
  return new Map(
    compilation
      .getAssets()
      .map(({ name, source }) => [name, Buffer.from(source.buffer())])
  );
}

export function remix2AssetsMiddleware(
  publicPath: string,
  assets: Remix2DevAssets
): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
  const prefix = new URL(publicPath, 'http://remix2.local').pathname;
  return (req, res, next) => {
    const path = new URL(req.url || '/', 'http://remix2.local').pathname;
    const asset = path.startsWith(prefix)
      ? assets.get(decodeURIComponent(path.slice(prefix.length)))
      : undefined;
    if (!asset) {
      next();
      return;
    }
    res.setHeader(
      'Content-Type',
      path.endsWith('.css')
        ? 'text/css'
        : path.endsWith('.js')
          ? 'text/javascript'
          : 'application/octet-stream'
    );
    res.setHeader('Cache-Control', 'no-store');
    res.end(req.method === 'HEAD' ? undefined : asset);
  };
}

export async function remix2RequestMiddleware(
  root: string,
  load: () => Promise<Remix2ServerBuild>
): Promise<
  (
    req: IncomingMessage,
    res: ServerResponse,
    next: (error?: unknown) => void
  ) => Promise<void>
> {
  const require = applicationRequire(root);
  const node = await import(
    pathToFileURL(require.resolve('@remix-run/node')).href
  );
  const handler = node.createRequestHandler(load, 'development');
  const listener = createRequestListener(async request => {
    const response: Response = await handler(request);
    const type = response.headers.get('Content-Type');
    if (type?.startsWith('text/') && !type.includes('charset=')) {
      response.headers.set('Content-Type', `${type}; charset=utf-8`);
    }
    return response;
  });
  return async (req, res, next) => {
    try {
      await listener(req, res);
    } catch (error) {
      next(error);
    }
  };
}

export async function publishRemix2Disk(
  browserRoot: string,
  serverPath: string,
  browserAssets: ReadonlyMap<string, Buffer>,
  serverAssets: ReadonlyMap<string, Buffer>,
  esm: boolean
): Promise<void> {
  const write = async (file: string, bytes: Buffer | string) => {
    await mkdir(dirname(file), { recursive: true });
    const temporary = `${file}.remix2-${process.pid}.tmp`;
    await writeFile(temporary, bytes);
    await rename(temporary, file);
  };
  for (const [name, bytes] of browserAssets)
    await write(resolve(browserRoot, name), bytes);
  const serverRoot = dirname(serverPath);
  await write(
    resolve(serverRoot, 'package.json'),
    JSON.stringify({ type: esm ? 'module' : 'commonjs' })
  );
  // The entry is the publication signal. Its chunks and browser files must exist first.
  const entry = serverPath.slice(serverRoot.length + 1);
  for (const [name, bytes] of serverAssets) {
    if (name !== entry) await write(resolve(serverRoot, name), bytes);
  }
  const bytes = serverAssets.get(entry);
  if (!bytes) throw new Error(`[remix2] Missing server entry ${entry}`);
  await write(serverPath, bytes);
}
