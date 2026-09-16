import { describe, expect, it, rstest } from '@rstest/core';
import { createDevHdrIntentTracker } from '../src/dev-hdr-intent';

describe('createDevHdrIntentTracker', () => {
  it('retains edit intent across an empty retry compilation', () => {
    const tracker = createDevHdrIntentTracker();
    const signal = rstest.fn();
    const withEdit = {};
    const emptyRetry = {};

    tracker.capture(withEdit, true);
    tracker.capture(emptyRetry, false);
    tracker.signalCommitted(emptyRetry, signal);

    expect(signal).toHaveBeenCalledOnce();
    tracker.signalCommitted(emptyRetry, signal);
    expect(signal).toHaveBeenCalledOnce();
  });

  it('acknowledges only the committed compilation revision when a newer edit is pending', () => {
    const tracker = createDevHdrIntentTracker();
    const signal = rstest.fn();
    const earlier = {};
    const later = {};

    tracker.capture(earlier, true);
    tracker.capture(later, true);
    tracker.signalCommitted(earlier, signal);

    expect(signal).toHaveBeenCalledOnce();
    tracker.signalCommitted(earlier, signal);
    expect(signal).toHaveBeenCalledOnce();

    tracker.signalCommitted(later, signal);
    expect(signal).toHaveBeenCalledTimes(2);
  });

  it('does not signal when no relevant node edit was captured', () => {
    const tracker = createDevHdrIntentTracker();
    const signal = rstest.fn();
    const compilation = {};

    tracker.capture(compilation, false);
    tracker.signalCommitted(compilation, signal);

    expect(signal).not.toHaveBeenCalled();
  });
});
