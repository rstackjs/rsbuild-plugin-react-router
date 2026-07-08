import QuickLRU from '@alloc/quick-lru';
import {
  compile,
  env,
  Instrumentation,
  normalizePath,
  optimize,
} from '@tailwindcss/node';
import { clearRequireCache } from '@tailwindcss/node/require-cache';
import { Scanner, type ChangedContent } from '@tailwindcss/oxide';
import fs from 'node:fs';
import path from 'node:path';

const DEBUG = env.DEBUG;
const TAILWIND_FEATURES = {
  None: 0,
  AtApply: 1,
  JsPluginCompat: 4,
  ThemeFunction: 8,
  Utilities: 16,
} as const;
const TAILWIND_POLYFILLS = {
  All: 3,
  AtProperty: 1,
} as const;

export interface TailwindLoaderOptions {
  /**
   * The base directory to scan for class candidates.
   *
   * Defaults to the current working directory.
   */
  base?: string;

  /**
   * Optimize and minify the output CSS.
   */
  optimize?: boolean | { minify?: boolean };
}

type LoaderCallback = (err?: Error | null, content?: string | Buffer) => void;

type LoaderCompiler = {
  modifiedFiles?: ReadonlySet<string>;
  removedFiles?: ReadonlySet<string>;
};

type TailwindLoaderContext = {
  resource: string;
  resourcePath: string;
  async(): LoaderCallback;
  getOptions(): TailwindLoaderOptions | undefined;
  addDependency(file: string): void;
  addContextDependency(context: string): void;
  _compiler?: LoaderCompiler;
};

type TailwindCompiler = Awaited<ReturnType<typeof compile>>;

interface CacheEntry {
  mtimes: Map<string, number>;
  compiler: null | TailwindCompiler;
  scanner: null | Scanner;
  candidates: Set<string>;
  fileCandidates: Map<string, Set<string>>;
  fullRebuildPaths: string[];
  result: string | null;
}

type CandidateUpdate = {
  file: string;
  nextCandidates: Set<string>;
};

type CandidateUpdateResult =
  | { type: 'unknown' }
  | { type: 'unchanged'; updates: CandidateUpdate[] }
  | { type: 'additive'; updates: CandidateUpdate[] }
  | { type: 'requires-full-scan' };

const cache = new QuickLRU<string, CacheEntry>({ maxSize: 50 });

const getCacheKey = (resourceId: string, opts: TailwindLoaderOptions): string =>
  `${resourceId}:${opts.base ?? ''}:${JSON.stringify(opts.optimize)}`;

const getContextFromCache = (
  resourceId: string,
  opts: TailwindLoaderOptions
): CacheEntry => {
  const key = getCacheKey(resourceId, opts);
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const entry: CacheEntry = {
    mtimes: new Map<string, number>(),
    compiler: null,
    scanner: null,
    candidates: new Set<string>(),
    fileCandidates: new Map<string, Set<string>>(),
    fullRebuildPaths: [],
    result: null,
  };
  cache.set(key, entry);
  return entry;
};

const setsEqual = (left: Set<string>, right: Set<string>): boolean => {
  if (left.size !== right.size) {
    return false;
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }

  return true;
};

const scanFileCandidates = (scanner: Scanner, file: string): Set<string> => {
  const input: ChangedContent = {
    file,
    content: fs.readFileSync(file, 'utf8'),
    extension: path.extname(file).slice(1),
  };

  return new Set(scanner.scanFiles([input]));
};

const getModifiedFiles = (
  loaderContext: TailwindLoaderContext,
  inputFile: string,
  fullRebuildPaths: string[]
): string[] | null => {
  const { modifiedFiles, removedFiles } = loaderContext._compiler ?? {};

  if (removedFiles && removedFiles.size > 0) {
    return null;
  }

  if (!modifiedFiles || modifiedFiles.size === 0) {
    return null;
  }

  const fullRebuildPathSet = new Set(
    [inputFile, ...fullRebuildPaths].map(file => path.resolve(file))
  );
  const changedFiles = [...modifiedFiles].map(file => path.resolve(file));

  if (changedFiles.some(file => fullRebuildPathSet.has(file))) {
    return null;
  }

  return changedFiles.filter(file => {
    try {
      return fs.statSync(file).isFile();
    } catch {
      return false;
    }
  });
};

const applyCandidateUpdates = (
  context: CacheEntry,
  updates: CandidateUpdate[]
): void => {
  for (const update of updates) {
    for (const candidate of update.nextCandidates) {
      context.candidates.add(candidate);
    }
    context.fileCandidates.set(update.file, update.nextCandidates);
  }
};

const rememberFileCandidates = (
  context: CacheEntry,
  files: string[] | null
): void => {
  if (!context.scanner || !files) {
    return;
  }

  for (const file of files) {
    try {
      context.fileCandidates.set(
        path.resolve(file),
        scanFileCandidates(context.scanner, file)
      );
    } catch {
      context.fileCandidates.delete(path.resolve(file));
    }
  }
};

const registerDependencies = (
  loaderContext: TailwindLoaderContext,
  context: CacheEntry,
  compiler: TailwindCompiler,
  base: string,
  inputFile: string
): void => {
  for (const file of context.fullRebuildPaths) {
    loaderContext.addDependency(path.resolve(file));
  }

  if (!context.scanner) {
    return;
  }

  const resolvedInputFile = path.resolve(base, inputFile);
  for (const file of context.scanner.files) {
    const absolutePath = path.resolve(file);
    if (absolutePath !== resolvedInputFile) {
      loaderContext.addDependency(absolutePath);
    }
  }

  for (const glob of context.scanner.globs) {
    if (glob.pattern[0] === '!') {
      continue;
    }
    if (glob.pattern === '*' && base === glob.base) {
      continue;
    }

    loaderContext.addContextDependency(path.resolve(glob.base));
  }

  const root = compiler.root;
  if (root === 'none' || root === null) {
    return;
  }

  const basePath = normalizePath(path.resolve(root.base, root.pattern));
  try {
    const stats = fs.statSync(basePath);
    if (!stats.isDirectory()) {
      throw new Error(
        `The path given to \`source(…)\` must be a directory but got \`source(${basePath})\` instead.`
      );
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
};

const getCandidateUpdate = (
  context: CacheEntry,
  modifiedFiles: string[] | null
): CandidateUpdateResult => {
  if (!context.scanner) {
    return { type: 'unknown' };
  }

  if (!modifiedFiles || modifiedFiles.length === 0) {
    return { type: 'unknown' };
  }

  let hasChangedCandidates = false;
  let hasRemovedCandidates = false;
  const updates: CandidateUpdate[] = [];

  for (const file of modifiedFiles) {
    const resolvedFile = path.resolve(file);
    const previousCandidates = context.fileCandidates.get(resolvedFile);
    if (!previousCandidates) {
      return { type: 'unknown' };
    }

    const nextCandidates = scanFileCandidates(context.scanner, file);
    updates.push({
      file: resolvedFile,
      nextCandidates,
    });

    if (setsEqual(previousCandidates, nextCandidates)) {
      continue;
    }

    hasChangedCandidates = true;
    for (const candidate of previousCandidates) {
      if (!nextCandidates.has(candidate)) {
        hasRemovedCandidates = true;
        break;
      }
    }
  }

  if (!hasChangedCandidates) {
    return { type: 'unchanged', updates };
  }

  if (hasRemovedCandidates) {
    return { type: 'requires-full-scan' };
  }

  return { type: 'additive', updates };
};

export default async function tailwindLoader(
  this: TailwindLoaderContext,
  source: string
): Promise<void> {
  const callback = this.async();
  const options = this.getOptions() ?? {};
  const inputFile = this.resourcePath;
  const resourceId = this.resource;
  const base = options.base ?? process.cwd();
  const shouldOptimize =
    options.optimize ?? process.env.NODE_ENV === 'production';
  const isCSSModuleFile = inputFile.endsWith('.module.css');
  const instrumentation = new Instrumentation();

  DEBUG &&
    instrumentation.start(
      `[@tailwindcss/webpack] ${path.relative(base, inputFile)}`
    );

  if (
    !/@(import|reference|theme|variant|config|plugin|apply|tailwind)\b/.test(
      source
    )
  ) {
    DEBUG &&
      instrumentation.end(
        `[@tailwindcss/webpack] ${path.relative(base, inputFile)}`
      );
    callback(null, source);
    return;
  }

  try {
    const context = getContextFromCache(resourceId, options);
    const inputBasePath = path.dirname(path.resolve(inputFile));
    const isInitialBuild = context.compiler === null;

    const createCompiler = async (): Promise<TailwindCompiler> => {
      if (context.fullRebuildPaths.length > 0 && !isInitialBuild) {
        clearRequireCache(context.fullRebuildPaths);
      }

      context.fullRebuildPaths = [];

      const polyfills = (
        isCSSModuleFile
          ? TAILWIND_POLYFILLS.All ^ TAILWIND_POLYFILLS.AtProperty
          : TAILWIND_POLYFILLS.All
      ) as Parameters<typeof compile>[1]['polyfills'];

      return compile(source, {
        from: inputFile,
        base: inputBasePath,
        shouldRewriteUrls: true,
        onDependency: depPath => context.fullRebuildPaths.push(depPath),
        polyfills,
      });
    };

    context.compiler ??= await createCompiler();

    if (context.compiler.features === TAILWIND_FEATURES.None) {
      DEBUG &&
        instrumentation.end(
          `[@tailwindcss/webpack] ${path.relative(base, inputFile)}`
        );
      callback(null, source);
      return;
    }

    let rebuildStrategy: 'full' | 'incremental' = 'incremental';

    for (const file of [...context.fullRebuildPaths, inputFile]) {
      let changedTime: number | null = null;
      try {
        changedTime = fs.statSync(file)?.mtimeMs ?? null;
      } catch {
        // File might not exist.
      }

      if (changedTime === null) {
        if (file === inputFile) {
          rebuildStrategy = 'full';
        }
        continue;
      }

      const prevTime = context.mtimes.get(file);
      if (prevTime === changedTime) {
        continue;
      }

      rebuildStrategy = 'full';
      context.mtimes.set(file, changedTime);
    }

    if (rebuildStrategy === 'full' && !isInitialBuild) {
      context.compiler = await createCompiler();
    }

    const compiler = context.compiler;

    if (
      !(
        compiler.features &
        (TAILWIND_FEATURES.AtApply |
          TAILWIND_FEATURES.JsPluginCompat |
          TAILWIND_FEATURES.ThemeFunction |
          TAILWIND_FEATURES.Utilities)
      )
    ) {
      DEBUG &&
        instrumentation.end(
          `[@tailwindcss/webpack] ${path.relative(base, inputFile)}`
        );
      callback(null, source);
      return;
    }

    if (context.scanner === null || rebuildStrategy === 'full') {
      const sources = (() => {
        if (compiler.root === 'none') {
          return [];
        }
        if (compiler.root === null) {
          return [{ base, pattern: '**/*', negated: false }];
        }
        return [{ ...compiler.root, negated: false }];
      })().concat(compiler.sources);

      context.scanner = new Scanner({ sources });
      context.fileCandidates.clear();
    }

    if (compiler.features & TAILWIND_FEATURES.Utilities) {
      const modifiedFiles = getModifiedFiles(
        this,
        inputFile,
        context.fullRebuildPaths
      );
      const candidateUpdate =
        !isInitialBuild && rebuildStrategy === 'incremental'
          ? getCandidateUpdate(context, modifiedFiles)
          : { type: 'unknown' as const };

      if (candidateUpdate.type === 'unchanged' && context.result !== null) {
        applyCandidateUpdates(context, candidateUpdate.updates);
        registerDependencies(this, context, compiler, base, inputFile);
        DEBUG &&
          instrumentation.end(
            `[@tailwindcss/webpack] ${path.relative(base, inputFile)}`
          );
        callback(null, context.result!);
        return;
      }

      if (candidateUpdate.type === 'additive') {
        applyCandidateUpdates(context, candidateUpdate.updates);
      } else {
        context.candidates.clear();
        for (const candidate of context.scanner.scan()) {
          context.candidates.add(candidate);
        }

        rememberFileCandidates(context, modifiedFiles);
      }

      registerDependencies(this, context, compiler, base, inputFile);
    }

    let result = compiler.build([...context.candidates]);
    if (shouldOptimize) {
      result = optimize(result, {
        minify:
          typeof shouldOptimize === 'object' ? shouldOptimize.minify : true,
      }).code;
    }

    context.result = result;

    DEBUG &&
      instrumentation.end(
        `[@tailwindcss/webpack] ${path.relative(base, inputFile)}`
      );
    callback(null, result);
  } catch (error) {
    const key = getCacheKey(resourceId, options);
    cache.delete(key);

    DEBUG &&
      instrumentation.end(
        `[@tailwindcss/webpack] ${path.relative(base, inputFile)}`
      );
    callback(error as Error);
  }
}
