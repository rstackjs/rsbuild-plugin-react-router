import { renderToString } from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  responseHeaders.set('Content-Type', 'text/html');
  return new Response(
    `<!DOCTYPE html>${renderToString(
      <ServerRouter context={routerContext} url={request.url} />
    )}`,
    {
      headers: responseHeaders,
      status: responseStatusCode,
    }
  );
}
