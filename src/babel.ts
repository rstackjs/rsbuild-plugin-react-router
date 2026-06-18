import {
  parse as yukuParse,
  walk,
  type ParseOptions,
  type ParseResult,
} from 'yuku-parser';
import { strip } from 'yuku-codegen';

export type Babel = any;
export type NodePath<T = any> = T;

export const parse = (
  code: string,
  options: ParseOptions = {}
): ParseResult => {
  const result = yukuParse(code, {
    sourceType: options.sourceType ?? 'module',
    lang: options.lang ?? 'tsx',
    preserveParens: true,
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
): { code: string; map: any } => {
  const result = 'program' in ast ? ast : { program: ast, lineStarts: [] };
  const generated = strip(result.program as any, {
    comments: 'some',
    sourceMaps: options.sourceMaps
      ? {
          lineStarts: result.lineStarts,
          file: options.filename,
          sourceFileName: options.sourceFileName,
        }
      : undefined,
  });
  return { code: generated.code, map: generated.map as any };
};

export const t = {};
export type { ParseResult };
