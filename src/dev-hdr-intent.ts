/** Tracks unsignaled node edits across compiler retries within one dev session. */
export const createDevHdrIntentTracker = () => {
  let latestRelevantEditRevision = 0;
  let signaledRevision = 0;
  const revisionByCompilation = new WeakMap<object, number>();

  return {
    capture(compilation: object, hasRelevantChanges: boolean): void {
      if (hasRelevantChanges) {
        latestRelevantEditRevision += 1;
      }
      revisionByCompilation.set(compilation, latestRelevantEditRevision);
    },

    signalCommitted(compilation: object, signal: () => void): void {
      const compilationRevision = revisionByCompilation.get(compilation);
      if (
        compilationRevision === undefined ||
        compilationRevision <= signaledRevision
      ) {
        return;
      }
      signal();
      signaledRevision = Math.max(signaledRevision, compilationRevision);
    },
  };
};
