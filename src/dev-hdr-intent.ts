/** Tracks unsignaled node edits across compiler retries within one dev session. */
export const createDevHdrIntentTracker = () => {
  let latestRevision = 0;
  let signaledRevision = 0;
  const revisionByCompilation = new WeakMap<object, number>();

  return {
    capture(compilation: object, hasRelevantChanges: boolean): void {
      if (hasRelevantChanges) {
        latestRevision += 1;
      }
      // An empty retry still contains the changes of its preceding attempt.
      revisionByCompilation.set(compilation, latestRevision);
    },

    signalCommitted(compilation: object, signal: () => void): void {
      const revision = revisionByCompilation.get(compilation);
      if (revision === undefined || revision <= signaledRevision) {
        return;
      }
      signal();
      // A newer compilation may have started while this one was evaluating.
      // Acknowledge only the revision owned by the committed compilation.
      signaledRevision = Math.max(signaledRevision, revision);
    },
  };
};
