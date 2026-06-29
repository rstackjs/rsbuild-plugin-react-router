import {
  parse as yukuParse,
  walk,
  type ParseOptions,
  type ParseResult,
} from 'yuku-parser';
import type { Rspack } from '@rsbuild/core';
import { print } from 'yuku-codegen';

export const parse = (
  code: string,
  options: ParseOptions = {}
): ParseResult => {
  const result = yukuParse(code, {
    ...options,
    sourceType: options.sourceType ?? 'module',
    lang: options.lang ?? 'tsx',
    attachComments: options.attachComments ?? true,
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
  const generated = print(result.program as Parameters<typeof print>[0], {
    comments: true,
    sourceMaps: options.sourceMaps
      ? {
          lineStarts: result.lineStarts,
          file: options.filename,
          sourceFileName: options.sourceFileName,
        }
      : undefined,
  });
  if (generated.errors.length > 0) {
    throw new Error(generated.errors.map(error => error.message).join('\n'));
  }
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

export type { ParseResult };
