import { existsSync, readFileSync, statSync } from 'node:fs';
import { SourceMap, type SourceMapPayload } from 'node:module';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type CachedSourceMap = {
  cacheKey: string;
  sourceMap: SourceMap | null;
};

const SOURCE_MAPPING_URL_MARKER = '//# sourceMappingURL=';
const GENERATED_JS_FRAME_RE =
  /(file:\/\/\/[^\s()]+\.m?js|\/[^\s()]+\.m?js):(\d+):(\d+)/g;

let installed = false;
let previousPrepareStackTrace: typeof Error.prepareStackTrace;
const sourceMapCache = new Map<string, CachedSourceMap>();

const getGeneratedFilePath = (fileName: string): string => {
  if (fileName.startsWith('file://')) {
    return fileURLToPath(fileName);
  }
  return fileName;
};

const getCacheKey = (filePath: string): string | null => {
  try {
    const generatedStats = statSync(filePath);
    const mapPath = `${filePath}.map`;
    const mapStats = existsSync(mapPath) ? statSync(mapPath) : undefined;
    return [
      generatedStats.mtimeMs,
      generatedStats.size,
      mapStats?.mtimeMs ?? 0,
      mapStats?.size ?? 0,
    ].join(':');
  } catch {
    return null;
  }
};

const parseSourceMapPayload = (sourceMapJson: string): SourceMapPayload => {
  const payload = JSON.parse(sourceMapJson) as Partial<SourceMapPayload>;
  return {
    file: payload.file ?? '',
    version: payload.version ?? 3,
    sources: payload.sources ?? [],
    sourcesContent: payload.sourcesContent ?? [],
    names: payload.names ?? [],
    mappings: payload.mappings ?? '',
    sourceRoot: payload.sourceRoot ?? '',
  };
};

const readInlineSourceMap = (filePath: string): string | null => {
  const source = readFileSync(filePath, 'utf8');
  const markerIndex = source.lastIndexOf(SOURCE_MAPPING_URL_MARKER);
  if (markerIndex === -1) {
    return null;
  }

  const sourceMapUrlStart = markerIndex + SOURCE_MAPPING_URL_MARKER.length;
  const nextLineIndex = source.indexOf('\n', sourceMapUrlStart);
  const sourceMapUrl = source
    .slice(sourceMapUrlStart, nextLineIndex === -1 ? undefined : nextLineIndex)
    .trim();
  if (!sourceMapUrl.startsWith('data:')) {
    return null;
  }

  const commaIndex = sourceMapUrl.indexOf(',');
  if (commaIndex === -1) {
    return null;
  }

  const metadata = sourceMapUrl.slice(0, commaIndex);
  const data = sourceMapUrl.slice(commaIndex + 1);
  return metadata.endsWith(';base64')
    ? Buffer.from(data, 'base64').toString('utf8')
    : decodeURIComponent(data);
};

const readSourceMapPayload = (filePath: string): SourceMapPayload | null => {
  const inlineSourceMap = readInlineSourceMap(filePath);
  if (inlineSourceMap) {
    return parseSourceMapPayload(inlineSourceMap);
  }

  const externalSourceMapPath = `${filePath}.map`;
  if (!existsSync(externalSourceMapPath)) {
    return null;
  }

  return parseSourceMapPayload(readFileSync(externalSourceMapPath, 'utf8'));
};

const getSourceMap = (filePath: string): SourceMap | null => {
  const cacheKey = getCacheKey(filePath);
  if (!cacheKey) {
    return null;
  }

  const cached = sourceMapCache.get(filePath);
  if (cached?.cacheKey === cacheKey) {
    return cached.sourceMap;
  }

  let sourceMap: SourceMap | null = null;
  try {
    const payload = readSourceMapPayload(filePath);
    sourceMap = payload ? new SourceMap(payload) : null;
  } catch {
    sourceMap = null;
  }

  sourceMapCache.set(filePath, { cacheKey, sourceMap });
  return sourceMap;
};

const resolveOriginalFileName = (
  generatedFilePath: string,
  originalFileName: string
): string => {
  if (
    isAbsolute(originalFileName) ||
    originalFileName.startsWith('node:') ||
    originalFileName.includes('://')
  ) {
    return originalFileName;
  }
  return resolve(dirname(generatedFilePath), originalFileName);
};

const remapDevServerStack = (stack: string): string =>
  stack.replace(GENERATED_JS_FRAME_RE, (match, fileName, line, column) => {
    const generatedFilePath = getGeneratedFilePath(fileName);
    const sourceMap = getSourceMap(generatedFilePath);
    const origin = sourceMap?.findOrigin(Number(line), Number(column));
    if (!origin || !('fileName' in origin)) {
      return match;
    }

    return `${resolveOriginalFileName(
      generatedFilePath,
      origin.fileName
    )}:${origin.lineNumber}:${origin.columnNumber}`;
  });

const formatStackTrace = (
  error: Error,
  callSites: NodeJS.CallSite[]
): string => {
  const message = error.message
    ? `${error.name}: ${error.message}`
    : error.name;
  const frames = callSites.map(callSite => `    at ${callSite.toString()}`);
  return [message, ...frames].join('\n');
};

const prepareStackTrace: NonNullable<typeof Error.prepareStackTrace> = (
  error,
  callSites
) => {
  const formattedStack =
    previousPrepareStackTrace && previousPrepareStackTrace !== prepareStackTrace
      ? previousPrepareStackTrace(error, callSites)
      : formatStackTrace(error, callSites);

  return typeof formattedStack === 'string'
    ? remapDevServerStack(formattedStack)
    : formattedStack;
};

export const installDevServerSourceMapSupport = (): void => {
  if (installed) {
    return;
  }

  installed = true;
  previousPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = prepareStackTrace;
};
