import { availableParallelism, cpus } from 'node:os';

const DEFAULT_RESERVED_CORES = 2;

export const getAvailableCpuCount = (): number =>
  typeof availableParallelism === 'function'
    ? availableParallelism()
    : cpus().length;

export const getDefaultConcurrency = (
  cpuCount: number = getAvailableCpuCount()
): number => Math.max(0, Math.floor(cpuCount) - DEFAULT_RESERVED_CORES);

export const mapWithConcurrency = async <Item, Result>(
  items: readonly Item[],
  concurrency: number,
  worker: (item: Item, index: number) => Promise<Result>
): Promise<Result[]> => {
  const results = new Array<Result>(items.length);
  let nextIndex = 0;
  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const index = nextIndex++;
        if (index >= items.length) {
          return;
        }
        results[index] = await worker(items[index], index);
      }
    })
  );
  return results;
};
