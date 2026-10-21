export interface Remix2Route {
  id: string;
  parentId?: string;
  path?: string;
  index?: boolean;
  caseSensitive?: boolean;
  file: string;
}

export interface Remix2Future {
  v3_fetcherPersist: boolean;
  v3_relativeSplatPath: boolean;
  v3_throwAbortReason: boolean;
  unstable_singleFetch: boolean;
  unstable_lazyRouteDiscovery: boolean;
}

export interface ResolvedRemix2Config {
  rootDirectory: string;
  appDirectory: string;
  entryClientFilePath: string;
  entryServerFilePath: string;
  assetsBuildDirectory: string;
  relativeAssetsBuildDirectory: string;
  serverBuildPath: string;
  serverModuleFormat: 'esm' | 'cjs';
  publicPath: string;
  routes: Record<string, Remix2Route>;
  future: Remix2Future;
  serverDependenciesToBundle?: 'all' | Array<string | RegExp>;
  serverConditions?: string[];
  serverMainFields?: string[];
  serverMinify?: boolean;
  watchPaths?: string[];
}

export interface Remix2Assets {
  module: string;
  imports: string[];
  css?: string[];
}

export interface Remix2ManifestRoute
  extends Omit<Remix2Route, 'file'>, Remix2Assets {
  hasLoader: boolean;
  hasAction: boolean;
  hasClientLoader: boolean;
  hasClientAction: boolean;
  hasErrorBoundary: boolean;
  [extension: string]: unknown;
}

export interface Remix2ManifestDraft {
  entry: Remix2Assets;
  routes: Record<string, Remix2ManifestRoute>;
  [extension: string]: unknown;
}

export interface Remix2AssetsManifest extends Remix2ManifestDraft {
  version: string;
  url: string;
}

export interface Remix2ServerBuild {
  mode: 'production' | 'development';
  entry: {
    module: {
      default: (
        request: Request,
        status: number,
        headers: Headers,
        context: any,
        loadContext: any
      ) => Response | Promise<Response>;
      handleDataRequest?: (
        response: Response,
        args: any
      ) => Response | Promise<Response>;
      handleError?: (error: unknown, args: any) => void;
      streamTimeout?: number;
    };
  };
  routes: Record<
    string,
    Remix2Route & {
      module: {
        default: any;
        [exportName: string]: any;
      };
    }
  >;
  assets: Remix2AssetsManifest;
  publicPath: string;
  assetsBuildDirectory: string;
  future: Remix2Future;
  isSpaMode: boolean;
}

export interface Remix2PluginOptions {
  config?: ResolvedRemix2Config;
  customServer?: boolean;
  transformManifest?: (
    draft: Remix2ManifestDraft
  ) => Remix2ManifestDraft | Promise<Remix2ManifestDraft>;
  transformClientRoute?: (input: {
    code: string;
    route: Remix2Route;
    serverExports: readonly string[];
  }) => string | Promise<string>;
}
