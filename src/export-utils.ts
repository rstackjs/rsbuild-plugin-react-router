import { readFile, stat } from 'node:fs/promises';
import { strip } from 'yuku-codegen';
import { langFromPath, parse } from 'yuku-parser';
import {
  detectRouteChunksIfEnabled,
  type RouteChunkCache,
  type RouteChunkConfig,
  type RouteChunkInfo,
} from './route-chunks.js';

type TransformCacheEntry = {
  source: string;
  transformed: Promise<TransformedModule>;
};

type ExportInfo = {
  readonly exportNames: readonly string[];
  readonly exportAllModules: readonly string[];
};

type TransformedModule = ExportInfo & {
  readonly code: string;
};

export type BundlerRouteAnalysis = TransformedModule & {
  getRouteChunkInfo: (
    cache: RouteChunkCache | undefined,
    config: RouteChunkConfig
  ) => Promise<RouteChunkInfo>;
};

type BundlerRouteAnalysisCacheEntry = {
  source: string;
  analysis: Promise<BundlerRouteAnalysis>;
};

type RouteModuleAnalysis = {
  readonly code: string;
  readonly exports: readonly string[];
  readonly exportAllModules: readonly string[];
};

type RouteModuleAnalysisCacheEntry = {
  mtimeMs: number;
  size: number;
  analysis: Promise<RouteModuleAnalysis>;
};

const transformCache = new Map<string, TransformCacheEntry>();
const exportInfoCache = new Map<string, Promise<ExportInfo>>();
const bundlerRouteAnalysisCache = new Map<
  string,
  BundlerRouteAnalysisCacheEntry
>();
const routeModuleAnalysisCache = new Map<
  string,
  RouteModuleAnalysisCacheEntry
>();

const MAX_EXPORT_UTILS_CACHE_ENTRIES = 2048;

type AnyNode = Record<string, any>;

const setBoundedCacheEntry = <Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
  value: Value
) => {
  if (!cache.has(key) && cache.size >= MAX_EXPORT_UTILS_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }
  cache.set(key, value);
};

const cachePromiseOnReject = <T>(
  promise: Promise<T>,
  invalidate: () => void
): Promise<T> =>
  promise.catch(error => {
    invalidate();
    throw error;
  });

const getRouteChunkConfigCacheKey = (config: RouteChunkConfig) =>
  `${String(config.splitRouteModules ?? false)}\0${config.appDirectory}\0${config.rootRouteFile}`;

const parseProgram = (code: string, resourcePath?: string) => {
  const result = parse(code, {
    sourceType: 'module',
    lang: resourcePath ? langFromPath(resourcePath) : 'tsx',
    preserveParens: true,
  });
  const errors = result.diagnostics.filter(
    diagnostic => diagnostic.severity === 'error'
  );
  if (errors.length > 0) {
    throw new Error(errors.map(error => error.message).join('\n'));
  }
  return result.program;
};

const getIdentifierNamesFromPattern = (
  pattern: AnyNode | null | undefined,
  names: string[] = []
): string[] => {
  if (!pattern) {
    return names;
  }
  if (pattern.type === 'Identifier') {
    names.push(pattern.name);
    return names;
  }
  if (pattern.type === 'RestElement') {
    return getIdentifierNamesFromPattern(pattern.argument, names);
  }
  if (pattern.type === 'AssignmentPattern') {
    return getIdentifierNamesFromPattern(pattern.left, names);
  }
  if (pattern.type === 'ArrayPattern') {
    for (const element of pattern.elements ?? []) {
      getIdentifierNamesFromPattern(element, names);
    }
    return names;
  }
  if (pattern.type === 'ObjectPattern') {
    for (const property of pattern.properties ?? []) {
      if (property.type === 'RestElement') {
        getIdentifierNamesFromPattern(property.argument, names);
      } else {
        getIdentifierNamesFromPattern(property.value, names);
      }
    }
  }
  return names;
};

const getExportedName = (node: AnyNode): string | null => {
  if (!node) {
    return null;
  }
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'Literal' || node.type === 'StringLiteral') {
    return String(node.value);
  }
  return null;
};

const isTypeOnlyExport = (node: AnyNode): boolean =>
  node.exportKind === 'type' ||
  node.type === 'TSExportAssignment' ||
  (node.type === 'ExportDefaultDeclaration' &&
    node.declaration?.type === 'TSInterfaceDeclaration');

const collectExportNames = (program: AnyNode): string[] => {
  const exportNames = new Set<string>();
  for (const statement of program.body ?? []) {
    if (isTypeOnlyExport(statement)) {
      continue;
    }

    if (statement.type === 'ExportAllDeclaration') {
      const exported = getExportedName(statement.exported);
      if (exported) {
        exportNames.add(exported);
      }
      continue;
    }

    if (statement.type === 'ExportDefaultDeclaration') {
      exportNames.add('default');
      continue;
    }

    if (statement.type !== 'ExportNamedDeclaration') {
      continue;
    }
    const declaration = statement.declaration;
    if (declaration) {
      if (declaration.type === 'VariableDeclaration') {
        for (const declarator of declaration.declarations ?? []) {
          for (const name of getIdentifierNamesFromPattern(declarator.id)) {
            exportNames.add(name);
          }
        }
      } else if (
        (declaration.type === 'FunctionDeclaration' ||
          declaration.type === 'ClassDeclaration') &&
        declaration.id?.name
      ) {
        exportNames.add(declaration.id.name);
      }
      continue;
    }

    for (const specifier of statement.specifiers ?? []) {
      if (specifier.exportKind === 'type') {
        continue;
      }
      const exported = getExportedName(specifier.exported);
      if (exported) {
        exportNames.add(exported);
      }
    }
  }
  return Array.from(exportNames);
};

const collectExportAllModules = (program: AnyNode): string[] => {
  const modules: string[] = [];
  for (const statement of program.body ?? []) {
    if (
      statement.type !== 'ExportAllDeclaration' ||
      isTypeOnlyExport(statement)
    ) {
      continue;
    }
    if (statement.exported) {
      continue;
    }
    const source = statement.source?.value;
    if (typeof source === 'string') {
      modules.push(source);
    }
  }
  return modules;
};

const getTransformedModule = async (
  code: string,
  resourcePath: string
): Promise<TransformedModule> => {
  const cached = transformCache.get(resourcePath);
  if (cached?.source === code) {
    return cached.transformed;
  }

  let transformed: Promise<TransformedModule>;
  transformed = cachePromiseOnReject(
    (async () => {
      const program = parseProgram(code, resourcePath);
      const stripped = strip(program, { comments: 'some' });
      if (stripped.errors.length > 0) {
        throw new Error(stripped.errors.map(error => error.message).join('\n'));
      }
      return {
        code: stripped.code,
        exportNames: collectExportNames(program),
        exportAllModules: collectExportAllModules(program),
      };
    })(),
    () => {
      if (transformCache.get(resourcePath)?.transformed === transformed) {
        transformCache.delete(resourcePath);
      }
    }
  );

  setBoundedCacheEntry(transformCache, resourcePath, {
    source: code,
    transformed,
  });
  return transformed;
};

export const transformToEsm = async (
  code: string,
  resourcePath: string
): Promise<string> => (await getTransformedModule(code, resourcePath)).code;

export const getExportNames = async (
  code: string
): Promise<readonly string[]> => {
  return (await getExportNamesAndExportAll(code)).exportNames;
};

export const getBundlerRouteAnalysis = async (
  source: string,
  resourcePath: string
): Promise<BundlerRouteAnalysis> => {
  const cached = bundlerRouteAnalysisCache.get(resourcePath);
  if (cached?.source === source) {
    return cached.analysis;
  }

  const analysis = (async () => {
    const transformed = await getTransformedModule(source, resourcePath);
    const routeChunkInfoCache = new Map<string, Promise<RouteChunkInfo>>();

    return {
      ...transformed,
      getRouteChunkInfo: (
        cache: RouteChunkCache | undefined,
        config: RouteChunkConfig
      ) => {
        const cacheKey = getRouteChunkConfigCacheKey(config);
        const cachedRouteChunkInfo = routeChunkInfoCache.get(cacheKey);
        if (cachedRouteChunkInfo) {
          return cachedRouteChunkInfo;
        }

        let routeChunkInfo: Promise<RouteChunkInfo>;
        routeChunkInfo = cachePromiseOnReject(
          detectRouteChunksIfEnabled(
            cache,
            config,
            resourcePath,
            transformed.code
          ),
          () => {
            if (routeChunkInfoCache.get(cacheKey) === routeChunkInfo) {
              routeChunkInfoCache.delete(cacheKey);
            }
          }
        );

        routeChunkInfoCache.set(cacheKey, routeChunkInfo);
        return routeChunkInfo;
      },
    };
  })();

  let trackedAnalysis: Promise<BundlerRouteAnalysis>;
  trackedAnalysis = cachePromiseOnReject(analysis, () => {
    if (
      bundlerRouteAnalysisCache.get(resourcePath)?.analysis === trackedAnalysis
    ) {
      bundlerRouteAnalysisCache.delete(resourcePath);
    }
  });

  setBoundedCacheEntry(bundlerRouteAnalysisCache, resourcePath, {
    source,
    analysis: trackedAnalysis,
  });
  return trackedAnalysis;
};

export const getExportNamesAndExportAll = async (
  code: string
): Promise<ExportInfo> => {
  const cached = exportInfoCache.get(code);
  if (cached) {
    return cached;
  }

  const exportInfo = (async () => {
    const program = parseProgram(code);
    return {
      exportNames: collectExportNames(program),
      exportAllModules: collectExportAllModules(program),
    };
  })();

  let trackedExportInfo: Promise<ExportInfo>;
  trackedExportInfo = cachePromiseOnReject(exportInfo, () => {
    if (exportInfoCache.get(code) === trackedExportInfo) {
      exportInfoCache.delete(code);
    }
  });

  setBoundedCacheEntry(exportInfoCache, code, trackedExportInfo);
  return trackedExportInfo;
};

export const getRouteModuleAnalysis = async (
  resourcePath: string
): Promise<RouteModuleAnalysis> => {
  const stats = await stat(resourcePath);
  const cached = routeModuleAnalysisCache.get(resourcePath);
  if (cached?.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
    return cached.analysis;
  }

  const analysis = (async () => {
    const source = await readFile(resourcePath, 'utf8');
    const transformed = await getTransformedModule(source, resourcePath);
    return {
      code: transformed.code,
      exports: transformed.exportNames,
      exportAllModules: transformed.exportAllModules,
    };
  })();

  let trackedAnalysis: Promise<RouteModuleAnalysis>;
  trackedAnalysis = cachePromiseOnReject(analysis, () => {
    if (
      routeModuleAnalysisCache.get(resourcePath)?.analysis === trackedAnalysis
    ) {
      routeModuleAnalysisCache.delete(resourcePath);
    }
  });

  setBoundedCacheEntry(routeModuleAnalysisCache, resourcePath, {
    mtimeMs: stats.mtimeMs,
    size: stats.size,
    analysis: trackedAnalysis,
  });
  return trackedAnalysis;
};
