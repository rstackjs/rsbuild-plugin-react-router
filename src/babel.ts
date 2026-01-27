import type { types as Babel } from '@babel/core';
import generatorPkg from '@babel/generator';
import { type ParseResult, parse } from '@babel/parser';
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { NodePath } from '@babel/traverse';
import traversePkg from '@babel/traverse';
import * as t from '@babel/types';

// Babel packages are CommonJS. Depending on the bundler/runtime interop mode,
// their "default" may either be the exported function or a module namespace.
// We normalize to always get the callable function.
const traverse: typeof import('@babel/traverse').default =
  (traversePkg as any).default ?? (traversePkg as any);
const generate: typeof import('@babel/generator').default =
  (generatorPkg as any).default ?? (generatorPkg as any);

export { traverse, generate, parse, t };
export type { Babel, NodePath, ParseResult };
