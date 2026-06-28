import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'pathe';
import { init, parse } from 'es-module-lexer';
import { JS_EXTENSIONS } from './constants.js';

const requireDependencyRE =
  /\brequire\s*\(\s*(['"])(?<specifier>\.{1,2}\/[^'"]+)\1\s*\)/g;

const resolveDependencyFile = (
  importerPath: string,
  specifier: string
): string | undefined => {
  if (!specifier.startsWith('.')) {
    return undefined;
  }

  const absolutePath = resolve(dirname(importerPath), specifier);
  const candidates = [absolutePath];
  for (const extension of JS_EXTENSIONS) {
    candidates.push(`${absolutePath}${extension}`);
  }
  for (const extension of JS_EXTENSIONS) {
    candidates.push(resolve(absolutePath, `index${extension}`));
  }

  return candidates.find(candidate => {
    try {
      return existsSync(candidate) && statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
};

const collectDependencySpecifiers = async (
  filePath: string
): Promise<string[]> => {
  let source: string;
  try {
    source = readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }
  await init;
  const [imports] = parse(source);
  const specifiers = imports
    .map(importSpecifier => importSpecifier.n)
    .filter((specifier): specifier is string => Boolean(specifier));

  for (const match of source.matchAll(requireDependencyRE)) {
    const specifier = match.groups?.specifier;
    if (specifier) {
      specifiers.push(specifier);
    }
  }

  return specifiers;
};

export const collectConfigDependencyWatchPaths = async (
  configPath: string
): Promise<string[]> => {
  const dependencies: string[] = [];
  const visited = new Set<string>([configPath]);
  const queue = [configPath];

  for (let index = 0; index < queue.length; index += 1) {
    const currentPath = queue[index];
    for (const specifier of await collectDependencySpecifiers(currentPath)) {
      const dependencyPath = resolveDependencyFile(currentPath, specifier);
      if (!dependencyPath || visited.has(dependencyPath)) {
        continue;
      }

      visited.add(dependencyPath);
      dependencies.push(dependencyPath);
      queue.push(dependencyPath);
    }
  }

  return dependencies;
};
