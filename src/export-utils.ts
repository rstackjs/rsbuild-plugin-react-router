import { readFile } from 'node:fs/promises';
import { extname } from 'pathe';
import * as esbuild from 'esbuild';
import { init, parse as parseExports } from 'es-module-lexer';
import { JS_LOADERS } from './constants.js';

const getEsbuildLoader = (resourcePath: string): esbuild.Loader => {
  const ext = extname(resourcePath) as keyof typeof JS_LOADERS;
  return JS_LOADERS[ext] ?? 'js';
};

export const transformToEsm = async (
  code: string,
  resourcePath: string
): Promise<string> => {
  return (
    await esbuild.transform(code, {
      jsx: 'automatic',
      format: 'esm',
      platform: 'neutral',
      loader: getEsbuildLoader(resourcePath),
    })
  ).code;
};

export const getExportNames = async (code: string): Promise<string[]> => {
  await init;
  const [, exportSpecifiers] = await parseExports(code);
  return Array.from(
    new Set(exportSpecifiers.map(specifier => specifier.n).filter(Boolean))
  );
};

export const getRouteModuleExports = async (
  resourcePath: string
): Promise<string[]> => {
  const source = await readFile(resourcePath, 'utf8');
  const code = await transformToEsm(source, resourcePath);
  return getExportNames(code);
};
