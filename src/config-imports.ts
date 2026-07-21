import type { JitiOptions, ModuleCache, TransformOptions } from 'jiti';
import { createJiti } from 'jiti';
import { resolve } from 'pathe';
import { parse } from './yuku.js';

export type ConfigImporter = Pick<ReturnType<typeof createJiti>, 'import'>;

type ConfigImportOptions = {
  define?: Record<string, unknown>;
  moduleCache?: boolean;
};

const normalizePath = (filePath: string): string => resolve(filePath);

const isNodeModulePath = (filePath: string): boolean =>
  filePath.split(/[\\/]/).includes('node_modules');

type AstNode = {
  type?: string;
  start?: number;
  end?: number;
  object?: AstNode;
  property?: AstNode;
  meta?: AstNode;
  name?: string;
  value?: unknown;
  computed?: boolean;
};

const normalizeDefineValue = (value: unknown): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
};

const getMemberExpressionName = (node: AstNode | undefined): string | null => {
  if (!node) {
    return null;
  }
  if (node.type === 'Identifier') {
    return node.name ?? null;
  }
  if (node.type === 'MetaProperty') {
    const meta = getMemberExpressionName(node.meta);
    const property = getMemberExpressionName(node.property);
    return meta && property ? `${meta}.${property}` : null;
  }
  if (node.type !== 'MemberExpression') {
    return null;
  }
  const object = getMemberExpressionName(node.object);
  const property =
    node.computed && typeof node.property?.value === 'string'
      ? node.property.value
      : getMemberExpressionName(node.property);
  return object && property ? `${object}.${property}` : null;
};

const collectDefineReplacements = (
  node: unknown,
  define: ReadonlyMap<string, string>,
  replacements: Array<{ start: number; end: number; value: string }>
): void => {
  if (!node || typeof node !== 'object') {
    return;
  }

  const astNode = node as AstNode;
  const memberName = getMemberExpressionName(astNode);
  const value = memberName ? define.get(memberName) : undefined;
  if (
    value !== undefined &&
    typeof astNode.start === 'number' &&
    typeof astNode.end === 'number'
  ) {
    replacements.push({
      start: astNode.start,
      end: astNode.end,
      value,
    });
    return;
  }

  for (const child of Object.values(node)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        collectDefineReplacements(item, define, replacements);
      }
      continue;
    }
    collectDefineReplacements(child, define, replacements);
  }
};

export const applyConfigDefines = (
  source: string,
  define: Record<string, unknown> | undefined
): string => {
  if (!define) {
    return source;
  }

  const normalizedDefine = new Map(
    Object.entries(define).flatMap(([key, value]) => {
      const normalized = normalizeDefineValue(value);
      return normalized === undefined ? [] : [[key, normalized]];
    })
  );
  if (normalizedDefine.size === 0) {
    return source;
  }

  const replacements: Array<{ start: number; end: number; value: string }> = [];
  collectDefineReplacements(
    parse(source, { sourceType: 'module' }),
    normalizedDefine,
    replacements
  );

  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (contents, replacement) =>
        `${contents.slice(0, replacement.start)}${replacement.value}${contents.slice(
          replacement.end
        )}`,
      source
    );
};

export const createConfigImporter = ({
  define,
  moduleCache = true,
}: ConfigImportOptions = {}): ReturnType<typeof createJiti> => {
  const defaultJiti = createJiti(process.cwd(), { moduleCache });
  if (!define || Object.keys(define).length === 0) {
    return defaultJiti;
  }

  const defaultTransform = defaultJiti.transform;
  const options = {
    moduleCache,
    transform(transformOptions: TransformOptions) {
      return {
        code: defaultTransform({
          ...transformOptions,
          source: applyConfigDefines(transformOptions.source, define),
        }),
      };
    },
  } satisfies JitiOptions;

  return createJiti(process.cwd(), options);
};

export const collectConfigImportWatchPaths = (
  configPath: string,
  moduleCache: ModuleCache,
  previousCacheKeys: ReadonlySet<string>
): string[] => {
  const normalizedConfigPath = normalizePath(configPath);
  const watchPaths = new Set<string>();

  for (const [cacheKey, module] of Object.entries(moduleCache)) {
    if (previousCacheKeys.has(cacheKey)) {
      continue;
    }

    const importPath = normalizePath(module?.filename ?? cacheKey);
    if (importPath === normalizedConfigPath || isNodeModulePath(importPath)) {
      continue;
    }

    watchPaths.add(importPath);
  }

  return Array.from(watchPaths);
};

export const clearConfigImportCache = (
  moduleCache: ModuleCache,
  filePaths: readonly string[]
): void => {
  const normalizedFilePaths = new Set(filePaths.map(normalizePath));

  for (const [cacheKey, module] of Object.entries(moduleCache)) {
    const cachedPath = normalizePath(module?.filename ?? cacheKey);
    if (normalizedFilePaths.has(cachedPath)) {
      delete moduleCache[cacheKey];
    }
  }
};

export const importConfigWithWatchPaths = async <T>(
  configPath: string,
  load: (importer: ConfigImporter) => PromiseLike<T> | T = async importer =>
    importer.import<T>(configPath, { default: true }),
  options?: ConfigImportOptions
): Promise<{ value: Awaited<T>; watchPaths: string | string[] }> => {
  const jiti = createConfigImporter({ moduleCache: true, ...options });
  const previousCacheKeys = new Set(Object.keys(jiti.cache));
  let importPaths: string[] = [];

  try {
    const value = await load(jiti);
    importPaths = collectConfigImportWatchPaths(
      configPath,
      jiti.cache,
      previousCacheKeys
    );
    return {
      value,
      watchPaths:
        importPaths.length > 0 ? [configPath, ...importPaths] : configPath,
    };
  } finally {
    if (importPaths.length === 0) {
      importPaths = collectConfigImportWatchPaths(
        configPath,
        jiti.cache,
        previousCacheKeys
      );
    }
    clearConfigImportCache(jiti.cache, [configPath, ...importPaths]);
  }
};
