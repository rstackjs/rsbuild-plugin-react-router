import * as React from 'react';
import { renderToReadableStream as renderHTMLToReadableStream } from 'react-dom/server';
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from 'react-router';
import type { unstable_RSCPayload as RSCPayload } from 'react-router/dom';
import { createFromReadableStream } from 'react-server-dom-rspack/client.node';

type PayloadPromise = Promise<RSCPayload> & {
  _deepestRenderedBoundaryId?: string | null;
  formState?: Promise<unknown>;
};

export async function generateHTML(
  request: Request,
  serverResponse: Response,
  options: {
    bootstrapScripts?: string[];
    bootstrapModules?: string[];
  } = {}
): Promise<Response> {
  return routeRSCServerRequest({
    request,
    serverResponse,
    createFromReadableStream,
    async renderHTML(getPayload, renderOptions) {
      const payloadPromise = getPayload() as PayloadPromise;
      payloadPromise.formState ??= payloadPromise.then(payload =>
        payload.type === 'render' ? payload.formState : undefined
      );

      return renderHTMLToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          ...renderOptions,
          bootstrapModules: options.bootstrapModules,
          bootstrapScripts: options.bootstrapScripts,
          formState: (await payloadPromise.formState) as never,
          signal: request.signal,
        }
      );
    },
  });
}
