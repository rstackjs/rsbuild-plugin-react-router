type OperationTiming = {
  count: number;
  totalMs: number;
  maxMs: number;
  slowest: Array<{
    durationMs: number;
    resource: string;
  }>;
};

type EnvironmentTimings = Map<string, OperationTiming>;

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
    environment: string,
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
  ): OperationTiming => {
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
      };
      timings.set(operation, timing);
    }
    return timing;
  };

  const recordDuration = (
    environment: string,
    operation: string,
    resource: string,
    durationMs: number
  ) => {
    const roundedDuration = Math.round(durationMs * 10) / 10;
    const timing = getOperationTiming(environment, operation);
    timing.count += 1;
    timing.totalMs = Math.round((timing.totalMs + roundedDuration) * 10) / 10;
    timing.maxMs = Math.max(timing.maxMs, roundedDuration);
    timing.slowest.push({ durationMs: roundedDuration, resource });
    for (let index = timing.slowest.length - 1; index > 0; index -= 1) {
      if (
        timing.slowest[index].durationMs <= timing.slowest[index - 1].durationMs
      ) {
        break;
      }
      [timing.slowest[index - 1], timing.slowest[index]] = [
        timing.slowest[index],
        timing.slowest[index - 1],
      ];
    }
    if (timing.slowest.length > 5) {
      timing.slowest.pop();
    }
  };

  return {
    async record(environment, operation, resource, callback) {
      if (!enabled) {
        return callback();
      }

      const start = performance.now();
      try {
        return await callback();
      } finally {
        recordDuration(
          environment ?? 'unknown',
          operation,
          resource,
          performance.now() - start
        );
      }
    },
    recordSync(environment, operation, resource, callback) {
      if (!enabled) {
        return callback();
      }

      const start = performance.now();
      try {
        return callback();
      } finally {
        recordDuration(
          environment ?? 'unknown',
          operation,
          resource,
          performance.now() - start
        );
      }
    },
    flush(environment, details = {}) {
      if (!enabled) {
        return;
      }

      const timings = timingsByEnvironment.get(environment);
      if (!timings || timings.size === 0) {
        return;
      }

      const operations = Object.fromEntries(timings.entries());
      const report: ReactRouterPerformanceReport = {
        environment,
        ...details,
        operations,
      };
      log(`[react-router:performance] ${JSON.stringify(report)}`);
    },
  };
};
