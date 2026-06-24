type OperationTiming = {
  count: number;
  // Total sums every recorded duration, so parallel work can make it larger
  // than elapsed wall-clock time. Use wallMs for non-overlapping elapsed time.
  totalMs: number;
  wallMs: number;
  maxMs: number;
  slowest: Array<{
    durationMs: number;
    resource: string;
  }>;
};

type OperationInterval = { startMs: number; endMs: number };

type MutableOperationTiming = Omit<OperationTiming, 'wallMs' | 'slowest'> & {
  slowest: Array<{
    durationMs: number;
    resource: string;
  }>;
  intervals: OperationInterval[];
};

type EnvironmentTimings = Map<string, MutableOperationTiming>;

const MAX_SLOWEST_ENTRIES = 5;

const insertSlowestEntry = (
  slowest: MutableOperationTiming['slowest'],
  entry: MutableOperationTiming['slowest'][number]
) => {
  if (
    slowest.length === MAX_SLOWEST_ENTRIES &&
    entry.durationMs <= slowest[slowest.length - 1].durationMs
  ) {
    return;
  }

  let insertIndex = slowest.length;
  while (
    insertIndex > 0 &&
    entry.durationMs > slowest[insertIndex - 1].durationMs
  ) {
    insertIndex -= 1;
  }
  slowest.splice(insertIndex, 0, entry);
  if (slowest.length > MAX_SLOWEST_ENTRIES) {
    slowest.pop();
  }
};

export const roundMs = (value: number): number => Math.round(value * 10) / 10;

export type ReactRouterPerformanceReport = {
  environment: string;
  compilerLifecycleMs?: number;
  operations: Record<string, OperationTiming>;
};

export type ReactRouterPerformanceProfiler = {
  record<T>(
    environment: string | undefined,
    operation: string,
    resource: string,
    callback: () => Promise<T>
  ): Promise<T>;
  recordSync<T>(
    environment: string | undefined,
    operation: string,
    resource: string,
    callback: () => T
  ): T;
  flush(
    environment: string | undefined,
    details?: Pick<ReactRouterPerformanceReport, 'compilerLifecycleMs'>
  ): void;
};

export const createReactRouterPerformanceProfiler = ({
  enabled,
  log,
}: {
  enabled: boolean;
  log: (message: string) => void;
}): ReactRouterPerformanceProfiler => {
  const timingsByEnvironment = new Map<string, EnvironmentTimings>();

  const getOperationTiming = (
    environment: string,
    operation: string
  ): MutableOperationTiming => {
    let timings = timingsByEnvironment.get(environment);
    if (!timings) {
      timings = new Map();
      timingsByEnvironment.set(environment, timings);
    }

    let timing = timings.get(operation);
    if (!timing) {
      timing = {
        count: 0,
        totalMs: 0,
        maxMs: 0,
        slowest: [],
        intervals: [],
      };
      timings.set(operation, timing);
    }
    return timing;
  };

  const computeWallMs = (intervals: OperationInterval[]) => {
    if (intervals.length === 0) {
      return 0;
    }

    const sortedIntervals = [...intervals].sort(
      (a, b) => a.startMs - b.startMs || a.endMs - b.endMs
    );
    let mergedStart = sortedIntervals[0].startMs;
    let mergedEnd = sortedIntervals[0].endMs;
    let wallMs = 0;

    for (const interval of sortedIntervals.slice(1)) {
      if (interval.startMs <= mergedEnd) {
        mergedEnd = Math.max(mergedEnd, interval.endMs);
        continue;
      }

      wallMs += mergedEnd - mergedStart;
      mergedStart = interval.startMs;
      mergedEnd = interval.endMs;
    }

    wallMs += mergedEnd - mergedStart;
    return roundMs(wallMs);
  };

  const toOperationTiming = (
    timing: MutableOperationTiming
  ): OperationTiming => ({
    count: timing.count,
    totalMs: roundMs(timing.totalMs),
    wallMs: computeWallMs(timing.intervals),
    maxMs: roundMs(timing.maxMs),
    slowest: timing.slowest.map(entry => ({
      durationMs: roundMs(entry.durationMs),
      resource: entry.resource,
    })),
  });

  const recordDuration = (
    environment: string,
    operation: string,
    resource: string,
    startMs: number,
    endMs: number
  ) => {
    const duration = endMs - startMs;
    const timing = getOperationTiming(environment, operation);
    timing.count += 1;
    timing.totalMs += duration;
    timing.maxMs = Math.max(timing.maxMs, duration);
    timing.intervals.push({ startMs, endMs });
    insertSlowestEntry(timing.slowest, {
      durationMs: duration,
      resource,
    });
  };

  return {
    record(environment, operation, resource, callback) {
      if (!enabled) {
        try {
          return Promise.resolve(callback());
        } catch (error) {
          return Promise.reject(error);
        }
      }

      const resolvedEnvironment = environment ?? 'unknown';
      const start = performance.now();
      try {
        return callback().then(
          result => {
            const end = performance.now();
            recordDuration(
              resolvedEnvironment,
              operation,
              resource,
              start,
              end
            );
            return result;
          },
          error => {
            const end = performance.now();
            recordDuration(
              resolvedEnvironment,
              operation,
              resource,
              start,
              end
            );
            throw error;
          }
        );
      } catch (error) {
        const end = performance.now();
        recordDuration(resolvedEnvironment, operation, resource, start, end);
        return Promise.reject(error);
      }
    },
    recordSync(environment, operation, resource, callback) {
      if (!enabled) {
        return callback();
      }

      const resolvedEnvironment = environment ?? 'unknown';
      const start = performance.now();
      try {
        return callback();
      } finally {
        const end = performance.now();
        recordDuration(resolvedEnvironment, operation, resource, start, end);
      }
    },
    flush(environment, details = {}) {
      if (!enabled) {
        return;
      }

      const resolvedEnvironment = environment ?? 'unknown';
      const timings = timingsByEnvironment.get(resolvedEnvironment);
      if (!timings || timings.size === 0) {
        return;
      }

      const operations = Object.fromEntries(
        [...timings.entries()].map(([operation, timing]) => [
          operation,
          toOperationTiming(timing),
        ])
      );
      const report: ReactRouterPerformanceReport = {
        environment: resolvedEnvironment,
        ...details,
        operations,
      };
      log(`[react-router:performance] ${JSON.stringify(report)}`);
      timingsByEnvironment.delete(resolvedEnvironment);
    },
  };
};
