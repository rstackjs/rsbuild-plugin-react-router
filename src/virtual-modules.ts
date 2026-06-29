const VIRTUAL_MODULE_PREFIX = 'virtual/react-router/';

export const getVirtualModuleFilePath = (moduleId: string): string => {
  if (!moduleId.startsWith(VIRTUAL_MODULE_PREFIX)) {
    throw new Error(
      `Virtual module id must start with ${JSON.stringify(VIRTUAL_MODULE_PREFIX)}: ${moduleId}`
    );
  }

  const relativeId = moduleId.slice(VIRTUAL_MODULE_PREFIX.length);
  const segments = relativeId.split('/');
  if (
    !relativeId ||
    segments.some(segment => !segment || segment === '.' || segment === '..')
  ) {
    throw new Error(`Invalid virtual module id: ${moduleId}`);
  }

  return `node_modules/${moduleId}.js`;
};

export const mapVirtualModules = (
  modules: Record<string, string>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(modules).map(([moduleId, contents]) => [
      getVirtualModuleFilePath(moduleId),
      contents,
    ])
  );
