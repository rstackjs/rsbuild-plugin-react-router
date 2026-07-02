import type { Rspack } from '@rsbuild/core';
import type {
  DevCompileAttemptIdentity,
  DevCompilationIdentity,
  DevRuntimeStats,
  DevGraphChanges,
  DevGraphIdentity,
} from './dev-runtime-artifacts.js';

export type DevCompilerPair = {
  web: Rspack.Compiler;
  node: Rspack.Compiler;
  settledCompilations: WeakSet<Rspack.Compilation>;
  pendingAttempt?: PendingDevCompilation;
  currentAttemptIdentity?: DevCompileAttemptIdentity;
  latestCompletedWebIdentity?: DevCompilationIdentity;
  latestCompletedWebStats?: Rspack.Stats;
  latestCompletedNodeStats?: Rspack.Stats;
  latestWebStart?: CompilationStart;
  latestNodeStart?: CompilationStart;
};

export type PendingDevCompilation = {
  stats: DevRuntimeStats;
  changes: DevGraphChanges;
  identity: DevGraphIdentity;
  webCompilation: Rspack.Compilation;
  nodeCompilation: Rspack.Compilation;
};

export type CompilationStart =
  | { status: 'pending' }
  | { status: 'started'; identity: DevCompilationIdentity };

type CompilerPairStartSide = 'latestWebStart' | 'latestNodeStart';

export const createDevCompilerPair = ({
  web,
  node,
}: {
  web: Rspack.Compiler;
  node: Rspack.Compiler;
}): DevCompilerPair => ({
  web,
  node,
  settledCompilations: new WeakSet(),
});

export const resetDevCompilerPair = (pair: DevCompilerPair): void => {
  pair.pendingAttempt = undefined;
  pair.currentAttemptIdentity = undefined;
  pair.latestCompletedWebIdentity = undefined;
  pair.latestCompletedWebStats = undefined;
  pair.latestCompletedNodeStats = undefined;
  pair.latestWebStart = undefined;
  pair.latestNodeStart = undefined;
};

export const isLatestStartedCompilation = (
  identity: DevCompilationIdentity | undefined,
  start: CompilationStart | undefined
): boolean =>
  !identity || (start?.status === 'started' && start.identity === identity);

export const hasPendingCompilation = (pair: DevCompilerPair): boolean =>
  pair.latestWebStart?.status === 'pending' ||
  pair.latestNodeStart?.status === 'pending';

export const beginDevCompilerAttempt = (pair: DevCompilerPair): void => {
  pair.pendingAttempt = undefined;
  pair.currentAttemptIdentity = Symbol();
};

export const markDevCompilerPending = (
  pair: DevCompilerPair,
  side: CompilerPairStartSide
): boolean => {
  const attemptAlreadyPending = hasPendingCompilation(pair);
  pair[side] = { status: 'pending' };
  pair.pendingAttempt = undefined;
  if (!attemptAlreadyPending) {
    pair.currentAttemptIdentity = Symbol();
  }
  return !attemptAlreadyPending;
};

export const clearDevCompilerStart = (
  pair: DevCompilerPair,
  side: CompilerPairStartSide
): void => {
  pair[side] = undefined;
  pair.pendingAttempt = undefined;
};

export type CompilationIdentityTracker = {
  getCompilationIdentity(
    compilation: Rspack.Compilation
  ): DevCompilationIdentity;
  getWebIdentityForNodeCompilation(
    compilation: Rspack.Compilation
  ): DevCompilationIdentity | undefined;
  getAttemptIdentityForCompilation(
    compilation: Rspack.Compilation
  ): DevCompileAttemptIdentity | undefined;
  setAttemptIdentityForCompilation(
    compilation: Rspack.Compilation,
    identity: DevCompileAttemptIdentity
  ): void;
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
    const attemptIdentityByCompilation = new WeakMap<
      Rspack.Compilation,
      DevCompileAttemptIdentity
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

      getAttemptIdentityForCompilation(
        compilation: Rspack.Compilation
      ): DevCompileAttemptIdentity | undefined {
        return attemptIdentityByCompilation.get(compilation);
      },

      setAttemptIdentityForCompilation(
        compilation: Rspack.Compilation,
        identity: DevCompileAttemptIdentity
      ): void {
        attemptIdentityByCompilation.set(compilation, identity);
      },

      setWebIdentityForNodeCompilation(
        compilation: Rspack.Compilation,
        identity: DevCompilationIdentity
      ): void {
        webIdentityByNodeCompilation.set(compilation, identity);
      },
    };
  };
