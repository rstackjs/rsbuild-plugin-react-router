import { availableParallelism, cpus } from 'node:os';

const DEFAULT_RESERVED_CORES = 2;

const getAvailableCpuCount = (): number =>
  typeof availableParallelism === 'function'
    ? availableParallelism()
    : cpus().length;

export const getDefaultConcurrency = (
  cpuCount: number = getAvailableCpuCount()
): number => Math.max(0, Math.floor(cpuCount) - DEFAULT_RESERVED_CORES);
