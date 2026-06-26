import { isAbsolute, relative } from 'node:path';
import type { RsbuildDevServer, Rspack } from '@rsbuild/core';
import type { ServerBuild } from 'react-router';
import type { ReactRouterManifestForDev } from './manifest.js';
import { resolveServerBuildModule } from './server-utils.js';

export type ReactRouterDevManifest = ReactRouterManifestForDev;

export type ReactRouterDevBuildPlan = {
  defaultEntryName: string;
  entryNames: readonly string[];
};

export type ReactRouterDevManifestSet = Readonly<
  Record<string, ReactRouterDevManifest>
>;

export type ReactRouterServerBuilds = Readonly<Record<string, ServerBuild>>;

export type DependencySnapshot = {
  files: ReadonlySet<string>;
  contexts: ReadonlySet<string>;
  missing: ReadonlySet<string>;
};

export type DevChangedFiles = {
  known: boolean;
  files: ReadonlySet<string>;
};

export type DevGraphChanges = {
  web: DevChangedFiles;
  node: DevChangedFiles;
};

export type DevCompilationIdentity = symbol;
export type DevCompileAttemptIdentity = symbol;

export type DevGraphIdentity = {
  web: DevCompilationIdentity | undefined;
  node: DevCompilationIdentity | undefined;
  nodeWeb: DevCompilationIdentity | undefined;
  webAttempt: DevCompileAttemptIdentity | undefined;
  nodeAttempt: DevCompileAttemptIdentity | undefined;
};

export type WebArtifact = {
  manifestsByEntryName: ReactRouterDevManifestSet;
  dependencies: DependencySnapshot;
};

export const snapshotDevChangedFiles = (
  compiler: Pick<Rspack.Compiler, 'modifiedFiles' | 'removedFiles'> | undefined
): DevChangedFiles => {
  if (!compiler) {
    return { known: false, files: new Set() };
  }
  return {
    known:
      compiler.modifiedFiles !== undefined ||
      compiler.removedFiles !== undefined,
    files: new Set([
      ...(compiler.modifiedFiles ?? []),
      ...(compiler.removedFiles ?? []),
    ]),
  };
};

export const snapshotDependencies = (
  compilation: Rspack.Compilation
): DependencySnapshot => ({
  files: new Set([
    ...compilation.fileDependencies,
    ...(compilation.buildDependencies ?? []),
  ]),
  contexts: new Set(compilation.contextDependencies),
  missing: new Set(compilation.missingDependencies),
});

const isWithinDirectory = (directory: string, file: string): boolean => {
  const relativePath = relative(directory, file);
  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !isAbsolute(relativePath))
  );
};

export const isSafeOneSidedChange = (
  changes: DevChangedFiles,
  dependencies: DependencySnapshot
): boolean => {
  if (!changes.known || changes.files.size === 0) {
    return false;
  }
  for (const file of changes.files) {
    if (dependencies.files.has(file) || dependencies.missing.has(file)) {
      return false;
    }
    for (const directory of dependencies.contexts) {
      if (isWithinDirectory(directory, file)) {
        return false;
      }
    }
  }
  return true;
};

export const getEnvironmentStats = (
  stats: Rspack.Stats | Rspack.MultiStats,
  name: 'web' | 'node'
): Rspack.Stats | undefined => {
  const children = Array.isArray((stats as Rspack.MultiStats).stats)
    ? (stats as Rspack.MultiStats).stats
    : [stats as Rspack.Stats];
  return children.find(child => {
    const compilation = child.compilation;
    return compilation.name === name || compilation.compiler?.name === name;
  });
};

const evaluateServerBuild = async (
  server: RsbuildDevServer,
  entryName: string
): Promise<ServerBuild> => {
  const loaded = await server.environments.node.loadBundle(entryName);
  return resolveServerBuildModule(
    loaded,
    `Server entry ${JSON.stringify(entryName)}`
  );
};

export const evaluateServerBuilds = async (
  server: RsbuildDevServer,
  entryNames: readonly string[]
): Promise<ReactRouterServerBuilds> => {
  const evaluated = await Promise.all(
    entryNames.map(async entryName => [
      entryName,
      await evaluateServerBuild(server, entryName),
    ])
  );
  return Object.fromEntries(evaluated) as Record<string, ServerBuild>;
};

const assertBuildMatchesManifest = (
  entryName: string,
  build: ServerBuild,
  manifest: ReactRouterDevManifest
): void => {
  for (const [routeId, manifestRoute] of Object.entries(manifest.routes)) {
    const routeModule = build.routes[routeId]?.module;
    if (!routeModule) {
      throw new Error(
        `[rsbuild-plugin-react-router] Server build ${JSON.stringify(entryName)} route ${JSON.stringify(routeId)} is missing from the evaluated server build.`
      );
    }
    if (
      Boolean(manifestRoute.hasLoader) !==
      (typeof routeModule.loader === 'function')
    ) {
      throw new Error(
        `[rsbuild-plugin-react-router] Server build ${JSON.stringify(entryName)} route ${JSON.stringify(routeId)} loader export does not match its web manifest.`
      );
    }
    if (
      Boolean(manifestRoute.hasAction) !==
      (typeof routeModule.action === 'function')
    ) {
      throw new Error(
        `[rsbuild-plugin-react-router] Server build ${JSON.stringify(entryName)} route ${JSON.stringify(routeId)} action export does not match its web manifest.`
      );
    }
  }
};

const pinBuildToManifest = (
  entryName: string,
  build: ServerBuild,
  manifest: ReactRouterDevManifest
): ServerBuild => {
  assertBuildMatchesManifest(entryName, build, manifest);
  return {
    ...build,
    assets: structuredClone(manifest) as ServerBuild['assets'],
  };
};

export const pinServerBuildsToManifests = (
  builds: ReactRouterServerBuilds,
  entryNames: readonly string[],
  manifestsByEntryName: ReactRouterDevManifestSet
): ReactRouterServerBuilds => {
  const pinned: Record<string, ServerBuild> = {};
  for (const entryName of entryNames) {
    const build = builds[entryName];
    if (!build) {
      throw new Error(
        `[rsbuild-plugin-react-router] Expected server build ${JSON.stringify(entryName)} was not evaluated.`
      );
    }
    const manifest = manifestsByEntryName[entryName];
    if (!manifest) {
      throw new Error(
        `[rsbuild-plugin-react-router] Server build ${JSON.stringify(entryName)} has no matching web manifest.`
      );
    }
    pinned[entryName] = pinBuildToManifest(entryName, build, manifest);
  }
  return pinned;
};
