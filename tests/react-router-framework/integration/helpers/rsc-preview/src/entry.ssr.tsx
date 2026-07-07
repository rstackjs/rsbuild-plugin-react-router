import { createFromReadableStream } from "react-server-dom-rspack/client.node";
import * as ReactDomServer from "react-dom/server";
import {
  unstable_RSCStaticRouter as RSCStaticRouter,
  unstable_routeRSCServerRequest as routeRSCServerRequest,
} from "react-router";
import type { unstable_RSCPayload as RSCPayload } from "react-router/dom";

type PayloadPromise = Promise<RSCPayload> & {
  formState?: Promise<unknown>;
};

export default async function handler(
  request: Request,
  serverResponse: Response,
) {
  return routeRSCServerRequest({
    request,
    serverResponse,
    createFromReadableStream,
    async renderHTML(getPayload, options) {
      const payload = getPayload() as PayloadPromise;
      payload.formState ??= payload.then((value) =>
        value.type === "render" ? value.formState : undefined,
      );

      return ReactDomServer.renderToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          ...options,
          signal: request.signal,
          formState: (await payload.formState) as never,
        },
      );
    },
  });
}
