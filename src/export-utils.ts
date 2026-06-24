import { readFile, stat } from 'node:fs/promises';
import { langFromPath, parse } from 'yuku-parser';
import { setBoundedCacheEntry } from './bounded-cache.js';
import {
  getExportedName,
  getIdentifierNamesFromPattern,
  type AnyNode,
} from './route-ast.js';

type ExportInfo = {
  readonly exportNames: readonly string[];
  readonly exportAllModules: readonly string[];
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

const exportInfoCache = new Map<string, Promise<ExportInfo>>();
const routeModuleAnalysisCache = new Map<
  string,
  RouteModuleAnalysisCacheEntry
>();

const MAX_EXPORT_UTILS_CACHE_ENTRIES = 2048;

const cachePromiseOnReject = <T>(
  promise: Promise<T>,
  invalidate: () => void
): Promise<T> =>
  promise.catch(error => {
    invalidate();
    throw error;
  });

const parseProgram = (code: string, resourcePath?: string) => {
  const result = parse(code, {
    sourceType: 'module',
    lang: resourcePath ? langFromPath(resourcePath) : 'tsx',
  });
  const errors = result.diagnostics.filter(
    diagnostic => diagnostic.severity === 'error'
  );
  if (errors.length > 0) {
    throw new Error(errors.map(error => error.message).join('\n'));
  }
  return result.program;
};

const isTypeOnlyExport = (node: AnyNode): boolean =>
  node.exportKind === 'type' ||
  node.type === 'TSExportAssignment' ||
  node.declaration?.declare === true ||
  (node.type === 'ExportDefaultDeclaration' &&
    node.declaration?.type === 'TSInterfaceDeclaration');

export const collectProgramExportNames = (program: AnyNode): string[] => {
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
          declaration.type === 'ClassDeclaration' ||
          declaration.type === 'TSEnumDeclaration') &&
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

export const getExportNames = async (
  code: string
): Promise<readonly string[]> => {
  return (await getExportNamesAndExportAll(code)).exportNames;
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
      exportNames: collectProgramExportNames(program),
      exportAllModules: collectExportAllModules(program),
    };
  })();

  let trackedExportInfo: Promise<ExportInfo>;
  trackedExportInfo = cachePromiseOnReject(exportInfo, () => {
    if (exportInfoCache.get(code) === trackedExportInfo) {
      exportInfoCache.delete(code);
    }
  });

  setBoundedCacheEntry(
    exportInfoCache,
    code,
    trackedExportInfo,
    MAX_EXPORT_UTILS_CACHE_ENTRIES
  );
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
    const program = parseProgram(source, resourcePath);
    return {
      code: source,
      exports: collectProgramExportNames(program),
      exportAllModules: collectExportAllModules(program),
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

  setBoundedCacheEntry(
    routeModuleAnalysisCache,
    resourcePath,
    {
      mtimeMs: stats.mtimeMs,
      size: stats.size,
      analysis: trackedAnalysis,
    },
    MAX_EXPORT_UTILS_CACHE_ENTRIES
  );
  return trackedAnalysis;
};
