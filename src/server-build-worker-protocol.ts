// Messages between the build process and `server-build-worker`.

/** Headers as a structured-cloneable list (the DOM lib's Headers is not iterable here). */
export const headerEntries = (headers: Headers): [string, string][] => {
  const entries: [string, string][] = [];
  headers.forEach((value, key) => entries.push([key, value]));
  return entries;
};

export type ServerBuildWorkerData = {
  serverBuildPath: string;
  mode: 'classic' | 'rsc';
};

export type ServerBuildWorkerRequest =
  | { type: 'close' }
  | {
      id: number;
      type: 'request';
      url: string;
      method: string;
      headers: [string, string][];
      body?: Uint8Array<ArrayBuffer>;
    }
  /** Consume a response body only when the parent asks for it. */
  | { id: number; type: 'read' }
  /** The parent released the request, possibly without reading its body. */
  | { id: number; type: 'abort' };

export type SerializedResponse = {
  status: number;
  statusText: string;
  headers: [string, string][];
  hasBody: boolean;
};

export type SerializedError = {
  message: string;
  stack?: string;
  name?: string;
};

export type ServerBuildWorkerResponse =
  | { type: 'closed' }
  /** Sent once the bundle is evaluated; carries the classic build description. */
  | { type: 'ready'; description?: ServerBuildDescription }
  | { type: 'reply'; id: number; ok: true; response: SerializedResponse }
  | { type: 'body'; id: number; ok: true; body: Uint8Array<ArrayBuffer> }
  | { type: 'reply'; id: number; ok: false; error: SerializedError };

/**
 * The parts of a classic React Router server build that build-time rendering
 * reads, as plain data: route module exports are reported by presence only.
 */
export type ServerBuildDescription = {
  prerender?: string[];
  routes: Record<
    string,
    {
      id?: string;
      parentId?: string;
      path?: string;
      index?: boolean;
      caseSensitive?: boolean;
      module: { default: boolean; ErrorBoundary: boolean; loader: boolean };
    }
  >;
  assets: { routes: Record<string, { hasLoader?: boolean }> };
};
