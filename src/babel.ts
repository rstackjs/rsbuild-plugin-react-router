import {
  parse as yukuParse,
  walk,
  type ParseOptions,
  type ParseResult,
} from 'yuku-parser';
import type { Rspack } from '@rsbuild/core';
import { strip } from 'yuku-codegen';

export const parse = (
  code: string,
  options: ParseOptions = {}
): ParseResult => {
  const result = yukuParse(code, {
    sourceType: options.sourceType ?? 'module',
    lang: options.lang ?? 'tsx',
  });
  const errors = result.diagnostics.filter(
    diagnostic => diagnostic.severity === 'error'
  );
  if (errors.length > 0) {
    throw new Error(errors.map(error => error.message).join('\n'));
  }
  return result;
};

export const traverse: typeof walk = walk;

export const generate = (
  ast: ParseResult | { type: 'Program' },
  options: {
    sourceMaps?: boolean;
    filename?: string;
    sourceFileName?: string;
  } = {}
): { code: string; map: Rspack.RawSourceMap | null } => {
  const result = 'program' in ast ? ast : { program: ast, lineStarts: [] };
  const generated = strip(result.program as Parameters<typeof strip>[0], {
    comments: 'some',
    sourceMaps: options.sourceMaps
      ? {
          lineStarts: result.lineStarts,
          file: options.filename,
          sourceFileName: options.sourceFileName,
        }
      : undefined,
  });
  const map = generated.map
    ? {
        ...generated.map,
        file: generated.map.file ?? options.filename ?? '',
        sourceRoot: generated.map.sourceRoot ?? undefined,
        sourcesContent:
          generated.map.sourcesContent?.map(source => source ?? '') ??
          undefined,
      }
    : null;

  return { code: generated.code, map };
};

export const t = {};
export type { ParseResult };
