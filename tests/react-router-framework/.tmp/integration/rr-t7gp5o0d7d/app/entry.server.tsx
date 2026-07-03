
import { ServerRouter } from "react-router";
import { renderToString } from "react-dom/server";

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  const html = renderToString(
    <ServerRouter context={remixContext} url={request.url} />
  );
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
    status: 500,
  });
}
            