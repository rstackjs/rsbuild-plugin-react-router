import { availableParallelism, cpus } from 'node:os';
import * as Effect from 'effect/Effect';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';

const DEFAULT_RESERVED_CORES = 2;

export const getAvailableCpuCount = (): number =>
  typeof availableParallelism === 'function'
    ? availableParallelism()
    : cpus().length;

export const getDefaultConcurrency = (
  cpuCount: number = getAvailableCpuCount()
): number => Math.max(0, Math.floor(cpuCount) - DEFAULT_RESERVED_CORES);

export const getCappedPluginConcurrency = (cap = 16): number =>
  Math.max(1, Math.min(cap, getDefaultConcurrency() || 1));

export const mapWithConcurrency = async <Item, Result>(
  items: readonly Item[],
  concurrency: number,
  worker: (item: Item, index: number) => Promise<Result>
): Promise<Result[]> => {
  const workerCount = Math.max(1, Math.min(concurrency, items.length));

  return runPluginEffect(
    Effect.forEach(
      items.map((item, index) => ({ item, index })),
      ({ item, index }) => tryPluginPromise(() => worker(item, index)),
      { concurrency: workerCount }
    )
  );
};
