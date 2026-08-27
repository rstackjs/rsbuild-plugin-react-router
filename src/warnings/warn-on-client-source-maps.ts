import type { NormalizedConfig } from '@rsbuild/core';

type Warn = (message: string) => void;
type ToolsRspackConfig = NonNullable<NormalizedConfig['tools']>['rspack'];
type SourceMapConfigObject = { js?: unknown };

function isProdBuild(mode?: string): boolean {
  // Prefer Rsbuild's normalized `mode` (explicit) and fall back to NODE_ENV.
  return mode === 'production' || process.env.NODE_ENV === 'production';
}

export function isSourceMapEnabled(value: unknown): boolean {
  // Rsbuild normalizes `output.sourceMap` into either:
  //  - boolean
  //  - { js?: devtool; css: boolean }
  if (value === true || typeof value === 'string') return true;
  if (value !== null && typeof value === 'object') {
    const js = (value as SourceMapConfigObject).js;
    // Any truthy devtool string/object means source maps are on for JS.
    return Boolean(js);
  }
  return false;
}

function isDevtoolSourceMap(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'string') {
    return value.includes('source-map');
  }
  // Unknown object shape - treat as enabled to be safe.
  return value !== null && typeof value === 'object';
}

export function getClientSourceMapSetting(
  normalized: NormalizedConfig,
  clientEnvName = 'web'
): unknown {
  // Prefer environment setting, fallback to global.
  return (
    normalized.environments?.[clientEnvName]?.output?.sourceMap ??
    normalized.output?.sourceMap
  );
}

export function getClientDevtoolSetting(
  normalized: NormalizedConfig,
  clientEnvName = 'web'
): unknown {
  const envTools = normalized.environments?.[clientEnvName]?.tools?.rspack;
  const rootTools = normalized.tools?.rspack;
  return (
    getDevtoolFromRspackConfig(envTools) ??
    getDevtoolFromRspackConfig(rootTools)
  );
}

function getDevtoolFromRspackConfig(config?: ToolsRspackConfig): unknown {
  return config !== null && typeof config === 'object'
    ? (config as { devtool?: unknown }).devtool
    : undefined;
}

export function warnOnClientSourceMaps(
  normalized: NormalizedConfig,
  warn: Warn,
  clientEnvName = 'web'
): void {
  // Only warn on production builds.
  if (!isProdBuild(normalized.mode)) {
    return;
  }

  const sourceMapSetting = getClientSourceMapSetting(normalized, clientEnvName);
  const devtoolSetting = getClientDevtoolSetting(normalized, clientEnvName);
  if (
    !isSourceMapEnabled(sourceMapSetting) &&
    !isDevtoolSourceMap(devtoolSetting)
  ) {
    return;
  }

  warn(
    [
      '',
      '  WARNING: Source maps are enabled in production',
      '  This makes your server code publicly visible in the browser.',
      '  This is highly discouraged! If you insist, ensure that you are using',
      '  environment variables for secrets and not hard-coding them in your source code.',
      '',
    ].join('\n')
  );
}
