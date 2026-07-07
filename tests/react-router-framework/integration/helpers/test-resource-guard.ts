import { cpus } from "node:os";
import { spawnSync } from "node:child_process";
import { readFileSync, readlinkSync } from "node:fs";
import path from "node:path";

type WorkerLimitOptions = {
  argv?: string[];
  cpuCount?: number;
  env?: Record<string, string | undefined>;
};

type WorkerLimit = {
  cap: number;
  requested?: number;
  workers: number;
};

type ResourceCounts = {
  browsers: number;
  installs: number;
  workers: number;
};

type ProcessInfo = {
  args: string;
  pid: number;
};

type ProcessFilterOptions = {
  includeStale?: boolean;
  isOwnedPid?: (pid: number) => boolean;
  isProcessCwdUnder?: (pid: number, parentPath: string) => boolean;
  runId?: string;
};

type ProcessRef = {
  killed?: boolean;
  pid?: number;
};

const DEFAULT_MAX_WORKERS = 6;
const DEFAULT_MAX_INSTALLS = 0;
const DEFAULT_MAX_BROWSERS_PER_WORKER = 2;
const PROCESS_GROUP_KILL_DELAY_MS = 2_000;
const TEST_RUN_ID_ENV = "RR_FRAMEWORK_TEST_RUN_ID";
const frameworkTmpPath = path.join(
  process.cwd(),
  "tests/react-router-framework/.tmp/integration",
);
const CRASH_REPORT_ENV = {
  APPORT_DISABLE: "1",
};

const parsePositiveInt = (value: string | undefined): number | undefined => {
  if (!value || !/^\d+$/.test(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return parsed > 0 ? parsed : undefined;
};

const parseNonNegativeInt = (value: string | undefined): number | undefined => {
  if (!value || !/^\d+$/.test(value)) {
    return undefined;
  }
  return Number(value);
};

const readRequestedWorkers = (argv: string[]): number | undefined => {
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--workers" || arg === "-j") {
      return parsePositiveInt(argv[index + 1]);
    }
    const match = arg.match(/^(?:--workers|-j)=(\d+)$/);
    if (match) {
      return parsePositiveInt(match[1]);
    }
  }
  return undefined;
};

export const resolveFrameworkWorkerLimit = ({
  argv = process.argv,
  cpuCount = cpus().length,
  env = process.env,
}: WorkerLimitOptions = {}): WorkerLimit => {
  const configuredCap = parsePositiveInt(env.RR_FRAMEWORK_MAX_WORKERS);
  const cap = configuredCap ?? Math.min(DEFAULT_MAX_WORKERS, Math.max(1, cpuCount));
  const requested = readRequestedWorkers(argv);
  return {
    cap,
    requested,
    workers: Math.min(requested ?? cap, cap),
  };
};

export const assertFrameworkWorkerLimit = (limit: WorkerLimit): void => {
  if (limit.requested !== undefined && limit.requested > limit.cap) {
    throw new Error(
      `Refusing to run ${limit.requested} React Router framework workers; cap is ${limit.cap}. ` +
        `Set RR_FRAMEWORK_MAX_WORKERS to override intentionally.`
    );
  }
};

const listProcesses = (): ProcessInfo[] => {
  const result = spawnSync("ps", ["-eo", "pid=,args="], {
    encoding: "utf8",
  });
  if (result.error || result.status !== 0) {
    return [];
  }
  return result.stdout
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .flatMap(line => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      return match ? [{ pid: Number(match[1]), args: match[2] }] : [];
    });
};

export const ensureFrameworkTestRunId = (): string => {
  process.env[TEST_RUN_ID_ENV] ??= `${process.pid}-${Date.now().toString(36)}`;
  return process.env[TEST_RUN_ID_ENV];
};

export const getFrameworkCacheEnv = (
  repoRoot = process.cwd(),
): Record<string, string> => {
  const cacheRoot = path.join(repoRoot, "node_modules", ".cache");
  return {
    ...CRASH_REPORT_ENV,
    PLAYWRIGHT_BROWSERS_PATH: path.join(cacheRoot, "ms-playwright"),
    PNPM_HOME: path.join(cacheRoot, "pnpm-home"),
    PNPM_STORE_DIR: path.join(repoRoot, "node_modules", ".pnpm-store"),
    npm_config_store_dir: path.join(repoRoot, "node_modules", ".pnpm-store"),
  };
};

export const withFrameworkTestRunEnv = <
  T extends Record<string, string | undefined>,
>(
  env: T,
): T => ({
  ...getFrameworkCacheEnv(),
  ...env,
  [TEST_RUN_ID_ENV]: ensureFrameworkTestRunId(),
});

const processEnvIncludes = (pid: number, name: string, value: string): boolean => {
  if (process.platform === "win32") {
    return false;
  }
  try {
    return readFileSync(`/proc/${pid}/environ`)
      .toString("utf8")
      .includes(`${name}=${value}`);
  } catch {
    return false;
  }
};

const defaultProcessCwdIsUnder = (pid: number, parentPath: string): boolean => {
  if (process.platform === "win32") {
    return false;
  }
  try {
    const cwd = path.resolve(readlinkSync(`/proc/${pid}/cwd`));
    return cwd === parentPath || cwd.startsWith(`${parentPath}${path.sep}`);
  } catch {
    return false;
  }
};

const isFrameworkTestProcess = (args: string): boolean =>
  args.includes("chrome-headless-shell") ||
  args.includes("chromium") ||
  args.includes("playwright/lib/worker/workerProcessEntry.js") ||
  (/\bpnpm(?:\.cjs)?\b/.test(args) && /\binstall\b/.test(args)) ||
  args.includes("tests/react-router-framework/.tmp/integration/");

export const filterFrameworkTestProcesses = (
  processes: ProcessInfo[],
  {
    includeStale = false,
    isOwnedPid = defaultIsOwnedPid,
    isProcessCwdUnder = defaultProcessCwdIsUnder,
    runId = process.env[TEST_RUN_ID_ENV],
  }: ProcessFilterOptions = {},
): ProcessInfo[] =>
  processes.filter(
    ({ args, pid }) =>
      isOwnedPid(pid) ||
      (runId !== undefined && args.includes(runId)) ||
      (includeStale &&
        isFrameworkTestProcess(args) &&
        isProcessCwdUnder(pid, frameworkTmpPath)),
  );

export const countFrameworkTestResources = (
  processes: ProcessInfo[],
  options: ProcessFilterOptions = {},
): ResourceCounts => {
  const counts: ResourceCounts = { browsers: 0, installs: 0, workers: 0 };
  for (const processInfo of filterFrameworkTestProcesses(processes, options)) {
    if (
      processInfo.args.includes("chrome-headless-shell") ||
      processInfo.args.includes("chromium")
    ) {
      counts.browsers++;
    }
    if (
      /\bpnpm(?:\.cjs)?\b/.test(processInfo.args) &&
      /\binstall\b/.test(processInfo.args)
    ) {
      counts.installs++;
    }
    if (processInfo.args.includes("playwright/lib/worker/workerProcessEntry.js")) {
      counts.workers++;
    }
  }
  return counts;
};

const defaultIsOwnedPid = (pid: number): boolean => {
  const runId = process.env[TEST_RUN_ID_ENV];
  return runId !== undefined && processEnvIncludes(pid, TEST_RUN_ID_ENV, runId);
};

export const getActiveResourceCounts = (): ResourceCounts => {
  return countFrameworkTestResources(listProcesses());
};

export const assertResourceGuardrail = ({
  counts = getActiveResourceCounts(),
  env = process.env,
}: {
  counts?: ResourceCounts;
  env?: Record<string, string | undefined>;
} = {}): void => {
  const { cap } = resolveFrameworkWorkerLimit({ env });
  const maxInstalls = resolveFrameworkInstallLimit(env);
  const maxBrowsers =
    parsePositiveInt(env.RR_FRAMEWORK_MAX_BROWSERS) ??
    cap * DEFAULT_MAX_BROWSERS_PER_WORKER;
  if (
    counts.installs > maxInstalls ||
    counts.browsers > maxBrowsers ||
    counts.workers > cap
  ) {
    throw new Error(
      `Refusing to continue runaway React Router framework test load: ` +
        `workers=${counts.workers}/${cap}, browsers=${counts.browsers}/${maxBrowsers}, ` +
        `installs=${counts.installs}/${maxInstalls}.`
    );
  }
};

export const resolveFrameworkInstallLimit = (
  env: Record<string, string | undefined> = process.env,
): number => parseNonNegativeInt(env.RR_FRAMEWORK_MAX_INSTALLS) ?? DEFAULT_MAX_INSTALLS;

const killTargets = (pid: number): number[] =>
  process.platform === "win32" ? [pid] : [-pid, pid];

export const killProcessGroup = (child: ProcessRef | undefined): void => {
  if (!child?.pid || child.killed) {
    return;
  }
  for (const target of killTargets(child.pid)) {
    try {
      process.kill(target, "SIGTERM");
    } catch {}
  }
  setTimeout(() => {
    for (const target of killTargets(child.pid!)) {
      try {
        process.kill(target, "SIGKILL");
      } catch {}
    }
  }, PROCESS_GROUP_KILL_DELAY_MS).unref();
};

export const cleanupOrphanedTestProcesses = (): void => {
  const candidates = filterFrameworkTestProcesses(listProcesses(), {
    includeStale: true,
  });
  for (const signal of ["SIGTERM", "SIGKILL"] as const) {
    for (const { pid } of candidates) {
      for (const target of killTargets(pid)) {
        try {
          process.kill(target, signal);
        } catch {}
      }
    }
  }
};
