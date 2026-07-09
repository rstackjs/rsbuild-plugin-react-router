interface ImportMeta {
  webpackHot?: {
    accept(): void;
    on(event: string, handler: () => void): void;
  };
}

declare module 'react-server-dom-rspack/client.browser' {
  export function createFromReadableStream<T>(
    stream: ReadableStream<Uint8Array>,
    options?: { temporaryReferences?: unknown }
  ): Promise<T>;

  export function createTemporaryReferenceSet(): unknown;

  export function encodeReply(
    value: unknown,
    options?: { temporaryReferences?: unknown }
  ): Promise<BodyInit>;

  export function setServerCallback(
    fn: (id: string, args: unknown[]) => Promise<unknown>
  ): void;
}

declare module 'react-server-dom-rspack/client.node' {
  export * from 'react-server-dom-rspack/client.browser';
}

declare module 'react-server-dom-rspack/server.node' {
  export function createTemporaryReferenceSet(): unknown;

  export function decodeAction(
    body: FormData,
    serverManifest?: unknown
  ): Promise<() => Promise<unknown>>;

  export function decodeFormState(
    actionResult: unknown,
    body: FormData,
    serverManifest?: unknown
  ): unknown;

  export function decodeReply(
    body: FormData | string,
    options?: { temporaryReferences?: unknown }
  ): Promise<unknown[]>;

  export function loadServerAction(
    actionId: string
  ): (...args: unknown[]) => unknown;

  export function renderToReadableStream(
    model: unknown,
    options?: {
      onError?: (error: unknown) => string | undefined;
      temporaryReferences?: unknown;
    }
  ): ReadableStream<Uint8Array>;
}

declare module 'virtual/react-router/unstable_rsc/routes' {
  import type { unstable_RSCRouteConfig as RSCRouteConfig } from 'react-router';
  const routes: RSCRouteConfig;
  export default routes;
}

declare module 'virtual/react-router/unstable_rsc/route-discovery' {
  const routeDiscovery:
    | { mode: 'initial' }
    | { mode: 'lazy'; manifestPath?: string };
  export default routeDiscovery;
}

declare module 'virtual/react-router/unstable_rsc/basename' {
  const basename: string;
  export default basename;
}

declare module 'virtual/react-router/unstable_rsc/allowed-action-origins' {
  const allowedActionOrigins: string[] | undefined;
  export default allowedActionOrigins;
}

declare module 'virtual/react-router/unstable_rsc/react-router-serve-config' {
  const config: {
    assetsBuildDirectory: string;
    publicPath: string;
  };
  export default config;
}

declare module 'virtual/react-router/unstable_rsc/inject-hmr-runtime' {}

declare module 'virtual/react-router/unstable_rsc/bootstrap-scripts' {
  const bootstrapScripts: string[];
  export default bootstrapScripts;
}

declare module 'virtual/react-router/unstable_rsc/server-manifest' {
  export default function getServerManifest(): unknown;
}

declare module 'virtual:react-router/unstable_rsc/routes' {
  export { default } from 'virtual/react-router/unstable_rsc/routes';
}

declare module 'virtual:react-router/unstable_rsc/route-discovery' {
  export { default } from 'virtual/react-router/unstable_rsc/route-discovery';
}

declare module 'virtual:react-router/unstable_rsc/basename' {
  export { default } from 'virtual/react-router/unstable_rsc/basename';
}

declare module 'virtual:react-router/unstable_rsc/allowed-action-origins' {
  export { default } from 'virtual/react-router/unstable_rsc/allowed-action-origins';
}

declare module 'virtual:react-router/unstable_rsc/react-router-serve-config' {
  export { default } from 'virtual/react-router/unstable_rsc/react-router-serve-config';
}

declare module 'virtual:react-router/unstable_rsc/inject-hmr-runtime' {}

declare module 'virtual:react-router/unstable_rsc/bootstrap-scripts' {
  export { default } from 'virtual/react-router/unstable_rsc/bootstrap-scripts';
}

declare module 'virtual:react-router/unstable_rsc/server-manifest' {
  export { default } from 'virtual/react-router/unstable_rsc/server-manifest';
}
