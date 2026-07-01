import { existsSync } from 'node:fs';
import { resolve } from 'pathe';
import { findEntryFile } from './plugin-utils.js';

type ReactRouterEntryPathsOptions = {
  appDirectory: string;
  templatesDirectory: string;
};

export type ReactRouterEntryPaths = {
  devServerBuildEntryName: string;
  finalEntryClientPath: string;
  finalEntryRscClientPath: string;
  finalEntryRscPath: string;
  finalEntryRscSsrPath: string;
  finalEntryServerPath: string;
  hasServerApp: boolean;
  serverAppPath: string;
};

const resolveEntryWithTemplate = ({
  appDirectory,
  entryName,
  templateName,
  templatesDirectory,
}: ReactRouterEntryPathsOptions & {
  entryName: string;
  templateName: string;
}): string => {
  const userEntryPath = findEntryFile(resolve(appDirectory, entryName));
  return existsSync(userEntryPath)
    ? userEntryPath
    : resolve(templatesDirectory, templateName);
};

export const resolveReactRouterEntryPaths = ({
  appDirectory,
  templatesDirectory,
}: ReactRouterEntryPathsOptions): ReactRouterEntryPaths => {
  const serverAppPath = findEntryFile(resolve(appDirectory, '../server/index'));
  const hasServerApp = existsSync(serverAppPath);

  return {
    devServerBuildEntryName: hasServerApp
      ? 'static/js/react-router-server-build'
      : 'static/js/app',
    finalEntryClientPath: resolveEntryWithTemplate({
      appDirectory,
      entryName: 'entry.client',
      templateName: 'entry.client.js',
      templatesDirectory,
    }),
    finalEntryServerPath: resolveEntryWithTemplate({
      appDirectory,
      entryName: 'entry.server',
      templateName: 'entry.server.js',
      templatesDirectory,
    }),
    finalEntryRscClientPath: resolveEntryWithTemplate({
      appDirectory,
      entryName: 'entry.rsc.client',
      templateName: 'entry.rsc.client.js',
      templatesDirectory,
    }),
    finalEntryRscPath: resolveEntryWithTemplate({
      appDirectory,
      entryName: 'entry.rsc',
      templateName: 'entry.rsc.js',
      templatesDirectory,
    }),
    finalEntryRscSsrPath: resolveEntryWithTemplate({
      appDirectory,
      entryName: 'entry.ssr',
      templateName: 'entry.rsc.ssr.js',
      templatesDirectory,
    }),
    hasServerApp,
    serverAppPath,
  };
};
