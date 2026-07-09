import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction as loadServerActionSync,
  renderToReadableStream,
} from 'react-server-dom-rspack/server.node';
import {
  RouterContextProvider,
  unstable_matchRSCServerRequest as matchRSCServerRequest,
} from 'react-router';

import routes from 'virtual/react-router/unstable_rsc/routes';
import routeDiscovery from 'virtual/react-router/unstable_rsc/route-discovery';
import basename from 'virtual/react-router/unstable_rsc/basename';
import allowedActionOrigins from 'virtual/react-router/unstable_rsc/allowed-action-origins';
import unstable_reactRouterServeConfig from 'virtual/react-router/unstable_rsc/react-router-serve-config';
import bootstrapScripts from 'virtual/react-router/unstable_rsc/bootstrap-scripts';
import getServerManifest from 'virtual/react-router/unstable_rsc/server-manifest';
import { generateHTML } from './entry.rsc.ssr.js';

export { unstable_reactRouterServeConfig };

type RscRequestHandler = {
  fetch(
    request: Request,
    requestContext?: RouterContextProvider
  ): Promise<Response>;
};

export function fetchServer(
  request: Request,
  requestContext?: RouterContextProvider
): Promise<Response> {
  return matchRSCServerRequest({
    allowedActionOrigins,
    basename,
    createTemporaryReferenceSet,
    decodeAction: body => decodeAction(body, getServerManifest()),
    decodeFormState: (actionResult, body) =>
      decodeFormState(actionResult, body, getServerManifest()),
    decodeReply,
    loadServerAction: (id: string) => Promise.resolve(loadServerActionSync(id)),
    request,
    requestContext,
    routes,
    routeDiscovery,
    generateResponse(match, options) {
      return new Response(renderToReadableStream(match.payload, options), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

const handler: RscRequestHandler = {
  async fetch(
    request: Request,
    requestContext?: RouterContextProvider
  ): Promise<Response> {
    if (requestContext && !(requestContext instanceof RouterContextProvider)) {
      requestContext = undefined;
    }

    return generateHTML(request, await fetchServer(request, requestContext), {
      bootstrapScripts,
    });
  },
};

export default handler;

import.meta.webpackHot?.accept();
