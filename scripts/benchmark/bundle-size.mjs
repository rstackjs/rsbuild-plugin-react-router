import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

export const bundleSizeMetricKeys = [
  'fileCount',
  'totalBytes',
  'totalGzipBytes',
  'clientBytes',
  'clientGzipBytes',
  'clientJsBytes',
  'clientJsGzipBytes',
  'clientCssBytes',
  'clientCssGzipBytes',
  'serverBytes',
  'serverGzipBytes',
  'sourceMapBytes',
  'sourceMapGzipBytes',
];

export const bundleSizeComparisonMetrics = [
  { label: 'Client JS gzip median', key: 'clientJsGzipBytes' },
  { label: 'Total output gzip median', key: 'totalGzipBytes' },
];

export const bundleSizeCiColumns = [
  {
    heading: 'Head client JS gzip',
    headField: 'headClientJsGzipBytes',
  },
  {
    heading: 'Client JS gzip delta',
    headField: 'clientJsGzipDeltaPercent',
    format: 'percent',
  },
  {
    heading: 'Head total gzip',
    headField: 'headTotalGzipBytes',
  },
];

export const createEmptyBuildOutputStats = () =>
  Object.fromEntries(bundleSizeMetricKeys.map(key => [key, 0]));

export const formatBytes = value => {
  if (value == null) {
    return '-';
  }
  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(value / 1024).toFixed(1)} kB`;
};

export const getBundleSizeMedian = (benchmark, key) =>
  benchmark?.summary?.bundleSize?.[key]?.median ?? null;

export const bundleSizeMetricPath = key => `summary.bundleSize.${key}.median`;

export const summarizeBundleSizeRuns = (runs, summarizeMetric) =>
  Object.fromEntries(
    bundleSizeMetricKeys.map(key => [
      key,
      summarizeMetric(runs.map(run => run.bundleSize?.[key])),
    ])
  );

const addFileStats = (stats, relativePath, bytes, gzipBytes) => {
  stats.fileCount += 1;
  stats.totalBytes += bytes;
  stats.totalGzipBytes += gzipBytes;

  const normalizedPath = relativePath.split(path.sep).join('/');
  const isSourceMap = normalizedPath.endsWith('.map');

  if (isSourceMap) {
    stats.sourceMapBytes += bytes;
    stats.sourceMapGzipBytes += gzipBytes;
  }

  if (normalizedPath.startsWith('client/')) {
    stats.clientBytes += bytes;
    stats.clientGzipBytes += gzipBytes;
    if (normalizedPath.endsWith('.js')) {
      stats.clientJsBytes += bytes;
      stats.clientJsGzipBytes += gzipBytes;
    } else if (normalizedPath.endsWith('.css')) {
      stats.clientCssBytes += bytes;
      stats.clientCssGzipBytes += gzipBytes;
    }
  } else if (normalizedPath.startsWith('server/')) {
    stats.serverBytes += bytes;
    stats.serverGzipBytes += gzipBytes;
  }
};

export const collectBuildOutputStats = async buildRoot => {
  const stats = createEmptyBuildOutputStats();

  const visit = async directory => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return;
      }
      throw error;
    }

    await Promise.all(
      entries.map(async entry => {
        const filePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          await visit(filePath);
          return;
        }
        if (!entry.isFile()) {
          return;
        }

        const [fileStat, buffer] = await Promise.all([
          stat(filePath),
          readFile(filePath),
        ]);
        addFileStats(
          stats,
          path.relative(buildRoot, filePath),
          fileStat.size,
          gzipSync(buffer).byteLength
        );
      })
    );
  };

  await visit(buildRoot);
  return stats;
};
