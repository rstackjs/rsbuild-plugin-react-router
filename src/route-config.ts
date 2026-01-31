import type { RouteConfigEntry } from '@react-router/dev/routes';

type ValidationResult =
  | { valid: true; routeConfig: RouteConfigEntry[] }
  | { valid: false; message: string };

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isThenable = (value: unknown): value is Promise<unknown> =>
  isPlainObject(value) && 'then' in value && 'catch' in value;

const validateEntry = (
  entry: unknown,
  path: string,
  issues: string[]
): entry is RouteConfigEntry => {
  if (isThenable(entry)) {
    issues.push(
      `${path}\nInvalid type: Expected object but received a promise. Did you forget to await?`
    );
    return false;
  }
  if (!isPlainObject(entry)) {
    issues.push(`${path}\nInvalid type: Expected object.`);
    return false;
  }
  if (typeof entry.file !== 'string') {
    issues.push(`${path}.file\nInvalid type: Expected string.`);
  }
  if ('id' in entry && entry.id === 'root') {
    issues.push(`${path}.id\nA route cannot use the reserved id 'root'.`);
  }
  if ('path' in entry && entry.path !== undefined && typeof entry.path !== 'string') {
    issues.push(`${path}.path\nInvalid type: Expected string.`);
  }
  if ('index' in entry && entry.index !== undefined && typeof entry.index !== 'boolean') {
    issues.push(`${path}.index\nInvalid type: Expected boolean.`);
  }
  if (
    'caseSensitive' in entry &&
    entry.caseSensitive !== undefined &&
    typeof entry.caseSensitive !== 'boolean'
  ) {
    issues.push(`${path}.caseSensitive\nInvalid type: Expected boolean.`);
  }
  if ('children' in entry && entry.children !== undefined) {
    if (!Array.isArray(entry.children)) {
      issues.push(`${path}.children\nInvalid type: Expected array.`);
    } else {
      entry.children.forEach((child, index) =>
        validateEntry(child, `${path}.children.${index}`, issues)
      );
    }
  }
  return issues.length === 0;
};

export const validateRouteConfig = ({
  routeConfigFile,
  routeConfig,
}: {
  routeConfigFile: string;
  routeConfig: unknown;
}): ValidationResult => {
  if (!routeConfig) {
    return {
      valid: false,
      message: `Route config must be the default export in "${routeConfigFile}".`,
    };
  }
  if (!Array.isArray(routeConfig)) {
    return {
      valid: false,
      message: `Route config in "${routeConfigFile}" must be an array.`,
    };
  }

  const issues: string[] = [];
  routeConfig.forEach((entry, index) =>
    validateEntry(entry, `routes.${index}`, issues)
  );

  if (issues.length > 0) {
    return {
      valid: false,
      message: [
        `Route config in "${routeConfigFile}" is invalid.`,
        issues.join('\n\n'),
      ].join('\n\n'),
    };
  }

  return {
    valid: true,
    routeConfig: routeConfig as RouteConfigEntry[],
  };
};
