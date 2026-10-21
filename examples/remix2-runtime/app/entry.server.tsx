import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable, type EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToPipeableStream } from 'react-dom/server';

export default function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext,
) {
  return new Promise<Response>((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={context} url={request.url} abortDelay={5000} />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          headers.set('Content-Type', 'text/html; charset=utf-8');
          headers.set('X-Remix2-Entry', 'custom-server');
          resolve(new Response(createReadableStreamFromReadable(body), { status, headers }));
          pipe(body);
        },
        onShellError: reject,
        onError(error) {
          status = 500;
          if (shellRendered) console.error(error);
        },
      },
    );
    const timer = setTimeout(abort, 5000);
    timer.unref();
  });
}
