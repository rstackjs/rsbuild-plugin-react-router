import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction as loadServerActionSync,
  renderToReadableStream,
} from "react-server-dom-rspack/server.node";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";
import { basename } from "./config/basename";

import { routes } from "./routes";
import { requestContext } from "./config/request-context";
import ssrHandler from "./entry.ssr";

export async function fetchServer(request: Request) {
  return await matchRSCServerRequest({
    createTemporaryReferenceSet,
    decodeReply,
    decodeAction,
    decodeFormState,
    loadServerAction: (id: string) => Promise.resolve(loadServerActionSync(id)),
    request,
    requestContext,
    routes,
    basename,
    generateResponse(match, options) {
      return new Response(renderToReadableStream(match.payload, options), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

export default async function handler(request: Request) {
  return ssrHandler(request, await fetchServer(request));
}
