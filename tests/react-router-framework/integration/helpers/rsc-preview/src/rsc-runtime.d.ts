declare module "react-server-dom-rspack/client.browser" {
  export function createFromReadableStream<T>(
    stream: ReadableStream<Uint8Array>,
    options?: { temporaryReferences?: unknown },
  ): Promise<T>;

  export function createTemporaryReferenceSet(): unknown;

  export function encodeReply(
    value: unknown,
    options?: { temporaryReferences?: unknown },
  ): Promise<BodyInit>;

  export function setServerCallback(
    fn: (id: string, args: unknown[]) => Promise<unknown>,
  ): void;
}

declare module "react-server-dom-rspack/client.node" {
  export * from "react-server-dom-rspack/client.browser";
}

declare module "react-server-dom-rspack/server.node" {
  export function createTemporaryReferenceSet(): unknown;

  export function decodeAction(
    body: FormData,
    serverManifest?: unknown,
  ): Promise<() => Promise<unknown>>;

  export function decodeFormState(
    actionResult: unknown,
    body: FormData,
    serverManifest?: unknown,
  ): unknown;

  export function decodeReply(
    body: FormData | string,
    options?: { temporaryReferences?: unknown },
  ): Promise<unknown[]>;

  export function loadServerAction(
    actionId: string,
  ): (...args: unknown[]) => unknown;

  export function renderToReadableStream(
    model: unknown,
    options?: {
      onError?: (error: unknown) => string | undefined;
      temporaryReferences?: unknown;
    },
  ): ReadableStream<Uint8Array>;
}
