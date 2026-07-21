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
import { ClientBootstrap } from "./entry.rsc.bootstrap";

declare const __webpack_require__:
  | {
      rscM?: {
        serverManifest?: unknown;
      };
    }
  | undefined;

const getServerManifest = (): unknown =>
  typeof __webpack_require__ === "undefined"
    ? undefined
    : __webpack_require__.rscM?.serverManifest;

export async function fetchServer(request: Request) {
  return await matchRSCServerRequest({
    createTemporaryReferenceSet,
    decodeReply,
    decodeAction: (body) => decodeAction(body, getServerManifest()),
    decodeFormState: (actionResult, body) =>
      decodeFormState(actionResult, body, getServerManifest()),
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
  // `ClientBootstrap` carries the compiled browser entry scripts on
  // `entryJsFiles` (attached by the rspack RSC runtime via its `use server-entry`
  // directive). Forward them to the SSR renderer so the server-rendered document
  // boots `entry.browser.tsx` and hydrates. Without this the page renders server
  // HTML but never loads client JS, so every client-interactive path hangs.
  // Mirrors the rsbuild-plugin-rsc react-router example and this repo's own
  // framework `entry.rsc.tsx` (which passes `bootstrapScripts` to generateHTML).
  const bootstrapScripts = (ClientBootstrap as { entryJsFiles?: string[] })
    .entryJsFiles;
  return ssrHandler(request, await fetchServer(request), { bootstrapScripts });
}
