import type { Rspack } from '@rsbuild/core';
import type {
  DevCompilationIdentity,
  DevGraphChanges,
  DevGraphIdentity,
} from './dev-runtime-artifacts.js';

export type DevCompilerPair = {
  web: Rspack.Compiler;
  node: Rspack.Compiler;
  settledCompilations: WeakSet<Rspack.Compilation>;
  pendingAttempt?: PendingDevCompilation;
  latestCompletedWebIdentity?: DevCompilationIdentity;
  latestWebStart?: CompilationStart;
  latestNodeStart?: CompilationStart;
};

export type PendingDevCompilation = {
  stats: Rspack.Stats | Rspack.MultiStats;
  changes: DevGraphChanges;
  identity: DevGraphIdentity;
  webCompilation: Rspack.Compilation;
  nodeCompilation: Rspack.Compilation;
};

export type CompilationStart =
  | { status: 'pending' }
  | { status: 'started'; identity: DevCompilationIdentity };

export const isLatestStartedCompilation = (
  identity: DevCompilationIdentity | undefined,
  start: CompilationStart | undefined
): boolean =>
  !identity || (start?.status === 'started' && start.identity === identity);

export const hasPendingCompilation = (pair: DevCompilerPair): boolean =>
  pair.latestWebStart?.status === 'pending' ||
  pair.latestNodeStart?.status === 'pending';

export type CompilationIdentityTracker = {
  getCompilationIdentity(
    compilation: Rspack.Compilation
  ): DevCompilationIdentity;
  getWebIdentityForNodeCompilation(
    compilation: Rspack.Compilation
  ): DevCompilationIdentity | undefined;
  setWebIdentityForNodeCompilation(
    compilation: Rspack.Compilation,
    identity: DevCompilationIdentity
  ): void;
};

export const createCompilationIdentityTracker =
  (): CompilationIdentityTracker => {
    const identityByCompilation = new WeakMap<
      Rspack.Compilation,
      DevCompilationIdentity
    >();
    const webIdentityByNodeCompilation = new WeakMap<
      Rspack.Compilation,
      DevCompilationIdentity
    >();

    return {
      getCompilationIdentity(
        compilation: Rspack.Compilation
      ): DevCompilationIdentity {
        const existing = identityByCompilation.get(compilation);
        if (existing) {
          return existing;
        }
        const identity = Symbol();
        // Keep compact lineage tokens in committed state without retaining entire
        // Rspack compilation graphs across failed rebuilds.
        identityByCompilation.set(compilation, identity);
        return identity;
      },

      getWebIdentityForNodeCompilation(
        compilation: Rspack.Compilation
      ): DevCompilationIdentity | undefined {
        return webIdentityByNodeCompilation.get(compilation);
      },

      setWebIdentityForNodeCompilation(
        compilation: Rspack.Compilation,
        identity: DevCompilationIdentity
      ): void {
        webIdentityByNodeCompilation.set(compilation, identity);
      },
    };
  };
