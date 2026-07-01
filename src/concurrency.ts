import { availableParallelism, cpus } from 'node:os';

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
