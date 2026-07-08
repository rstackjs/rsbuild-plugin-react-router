import { readFile, stat } from 'node:fs/promises';
import { rspack } from '@rsbuild/core';
import { langFromPath, parse, type ParseOptions } from 'yuku-parser';
import { setBoundedCacheEntry } from './bounded-cache.js';
import {
  getExportedName,
  getIdentifierNamesFromPattern,
  getProgram,
  type AnyNode,
  type ProgramNode,
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

const stripResourcePathQuery = (resourcePath: string): string =>
  resourcePath.replace(/[?#].*$/, '');

type TypeScriptParseLang = Extract<
  NonNullable<ParseOptions['lang']>,
  'ts' | 'tsx'
>;

const getExportAnalysisCode = (
  code: string,
  resourcePath: string,
  lang: TypeScriptParseLang
): string =>
  rspack.experiments.swc.transformSync(code, {
    filename: resourcePath,
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: lang === 'tsx',
      },
    },
  }).code;

const getParseErrors = (result: ReturnType<typeof parse>) =>
  result.diagnostics.filter(diagnostic => diagnostic.severity === 'error');

const getParseErrorMessage = (
  errors: ReturnType<typeof getParseErrors>
): string => errors.map(error => error.message).join('\n');

const parseProgram = (code: string, resourcePath?: string): ProgramNode => {
  const sourcePath = resourcePath
    ? stripResourcePathQuery(resourcePath)
    : undefined;
  const lang = sourcePath ? langFromPath(sourcePath) : 'tsx';
  const result = parse(code, {
    sourceType: 'module',
    lang,
  });
  const errors = getParseErrors(result);
  if (errors.length === 0) {
    return getProgram(result);
  }
  if (!sourcePath || (lang !== 'ts' && lang !== 'tsx')) {
    throw new Error(getParseErrorMessage(errors));
  }

  const normalizedCode = getExportAnalysisCode(code, sourcePath, lang);
  const normalizedResult = parse(normalizedCode, {
    sourceType: 'module',
    lang: 'js',
  });
  const normalizedErrors = getParseErrors(normalizedResult);
  if (normalizedErrors.length > 0) {
    throw new Error(getParseErrorMessage(normalizedErrors));
  }
  return getProgram(normalizedResult);
};

const getExportInfoCacheKey = (
  code: string,
  resourcePath?: string
): string => {
  const lang = resourcePath
    ? langFromPath(stripResourcePathQuery(resourcePath))
    : 'inline';
  return `${lang}\0${code}`;
};

const cachePromiseOnReject = <T>(
  promise: Promise<T>,
  invalidate: () => void
): Promise<T> =>
  promise.catch(error => {
    invalidate();
    throw error;
  });

const isTypeOnlyExport = (node: AnyNode): boolean =>
  node.exportKind === 'type' ||
  node.type === 'TSExportAssignment' ||
  node.declaration?.declare === true ||
  (node.type === 'ExportDefaultDeclaration' &&
    node.declaration?.type === 'TSInterfaceDeclaration');

export const collectProgramExportNames = (program: ProgramNode): string[] => {
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
  code: string,
  resourcePath?: string
): Promise<readonly string[]> => {
  return (await getExportNamesAndExportAll(code, resourcePath)).exportNames;
};

export const getExportNamesAndExportAll = async (
  code: string,
  resourcePath?: string
): Promise<ExportInfo> => {
  const cacheKey = getExportInfoCacheKey(code, resourcePath);
  const cached = exportInfoCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const exportInfo = (async () => {
    const program = parseProgram(code, resourcePath);
    return {
      exportNames: collectProgramExportNames(program),
      exportAllModules: collectExportAllModules(program),
    };
  })();

  let trackedExportInfo: Promise<ExportInfo>;
  trackedExportInfo = cachePromiseOnReject(exportInfo, () => {
    if (exportInfoCache.get(cacheKey) === trackedExportInfo) {
      exportInfoCache.delete(cacheKey);
    }
  });

  setBoundedCacheEntry(
    exportInfoCache,
    cacheKey,
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
