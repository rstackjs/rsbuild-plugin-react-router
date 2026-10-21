import { analyzeRouteModuleCode } from '../export-utils.js';
import { removeExports, removeUnusedImports } from '../route-export-pruning.js';
import { generate, parse } from '../yuku.js';
import type { Remix2PluginOptions, Remix2Route } from './types.js';

export interface Remix2RouteAnalysis {
  serverExports: readonly string[];
  clientExports: readonly string[];
}

export async function transformRemix2Route(
  code: string,
  route: Remix2Route,
  transform?: Remix2PluginOptions['transformClientRoute']
): Promise<{ code: string; analysis: Remix2RouteAnalysis }> {
  const original = analyzeRouteModuleCode(code, route.file);
  if (original.exportAllModules.length) {
    throw new Error(
      '[remix2] Route export * is unsupported. Use explicit named re-exports.'
    );
  }
  const ast = parse(code);
  removeExports(ast, ['loader', 'action', 'headers']);
  removeUnusedImports(ast);
  let client = generate(ast).code;
  if (transform) {
    client = await transform({
      code: client,
      route,
      serverExports: original.exports,
    });
  }
  const analysis = analyzeRouteModuleCode(client, route.file);
  if (
    analysis.exports.some(name =>
      ['loader', 'action', 'headers'].includes(name)
    )
  ) {
    throw new Error(
      '[remix2] Client route transforms must not restore server exports.'
    );
  }
  return {
    code: client,
    analysis: {
      serverExports: original.exports,
      clientExports: analysis.exports,
    },
  };
}
