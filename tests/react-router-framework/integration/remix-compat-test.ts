import { expect, test } from '@playwright/test';
import {
  createAppFixture,
  createFixture,
  js,
} from './helpers/create-fixture.js';
import type { AppFixture, Fixture } from './helpers/create-fixture.js';
import { PlaywrightFixture } from './helpers/playwright-fixture.js';

let fixture: Fixture;
let appFixture: AppFixture;

test.describe('Remix source compatibility', () => {
  test.beforeAll(async () => {
    fixture = await createFixture({
      remixCompat: true,
      files: {
        'tsconfig.json': js`
          {
            "extends": "./node_modules/rsbuild-plugin-react-router/tests/react-router-framework/tsconfig.base.json",
            "include": ["env.d.ts", "app/**/*.ts", "app/**/*.tsx", ".react-router/types/**/*"],
            "compilerOptions": {
              "lib": ["DOM", "DOM.Iterable", "ES2022"],
              "jsx": "react-jsx",
              "baseUrl": ".",
              "paths": {
                "~/*": ["./app/*"],
                "@remix-run/node": ["./app/compat/remix-node.ts"],
                "@remix-run/react": ["./app/compat/remix-react.ts"],
                "react-router-dom": ["./app/compat/remix-react.ts"],
                "react-router-dom6": ["./app/compat/remix-react.ts"]
              },
              "noEmit": true,
              "rootDirs": [".", ".react-router/types/"]
            }
          }
        `,
        'app/compat/remix-node.ts': js`
          export * from 'rsbuild-plugin-react-router/compat/remix-node';
        `,
        'app/compat/remix-react.ts': js`
          export * from 'rsbuild-plugin-react-router/compat/remix-react';
        `,
        'app/entry.client.tsx': js`
          import { startTransition, StrictMode } from 'react';
          import { hydrateRoot } from 'react-dom/client';
          import { RemixBrowser } from '@remix-run/react';

          startTransition(() => {
            hydrateRoot(document, <StrictMode><RemixBrowser /></StrictMode>);
          });
        `,
        'app/entry.server.tsx': js`
          import { PassThrough } from 'node:stream';
          import { createReadableStreamFromReadable, type EntryContext } from '@remix-run/node';
          import { RemixServer } from '@remix-run/react';
          import { renderToPipeableStream } from 'react-dom/server';

          const ABORT_DELAY = 5_000;

          export default function handleRequest(
            request: Request,
            status: number,
            headers: Headers,
            context: EntryContext,
          ) {
            return new Promise((resolve, reject) => {
              let shellRendered = false;
              const { pipe, abort } = renderToPipeableStream(
                <RemixServer context={context} url={request.url} abortDelay={ABORT_DELAY} />,
                {
                  onShellReady() {
                    shellRendered = true;
                    const body = new PassThrough();
                    headers.set('Content-Type', 'text/html');
                    resolve(new Response(createReadableStreamFromReadable(body), { headers, status }));
                    pipe(body);
                  },
                  onShellError: reject,
                  onError(error) {
                    status = 500;
                    if (shellRendered) console.error(error);
                  },
                },
              );
              setTimeout(abort, ABORT_DELAY);
            });
          }
        `,
        'app/routes.ts': js`
          import { index, route } from '@react-router/dev/routes';
          export default [
            index('routes/_index.tsx'),
            route('next', 'routes/next.tsx'),
          ];
        `,
        'app/routes/_index.tsx': js`
          import { Suspense, useEffect, useState } from 'react';
          import { defer, json } from '@remix-run/node';
          import { Await, Form, Link, useActionData, useLoaderData } from '@remix-run/react';
          import { NavLink } from 'react-router-dom';
          import { Link as Link6 } from 'react-router-dom6';

          export function loader() {
            return defer(
              {
                value: new Promise(resolve => setTimeout(resolve, 2_000, 'document deferred')),
                failure: new Promise((_, reject) =>
                  setTimeout(reject, 1_000, new Error('document rejection')),
                ),
              },
              { status: 207, headers: { 'X-Remix-Compat': 'document' } },
            );
          }

          export async function action({ request }) {
            let form = await request.formData();
            return json(
              { message: form.get('message') },
              { status: 201, headers: { 'X-Remix-Action': 'json' } },
            );
          }

          export function headers({ loaderHeaders, actionHeaders }) {
            return actionHeaders.has('X-Remix-Action') ? actionHeaders : loaderHeaders;
          }

          export default function Index() {
            let { value, failure } = useLoaderData<typeof loader>();
            let actionData = useActionData<typeof action>();
            let [hydrated, setHydrated] = useState(false);
            useEffect(() => setHydrated(true), []);
            return <main data-hydrated={hydrated}>
              <Suspense fallback={<p id="fallback">waiting</p>}>
                <Await resolve={value}>{value => <p id="resolved">{value}</p>}</Await>
              </Suspense>
              <Suspense fallback={<p>waiting for document error</p>}>
                <Await resolve={failure} errorElement={<p id="document-rejected">rejected</p>} />
              </Suspense>
              <Form method="post">
                <input name="message" defaultValue="action json" />
                <button type="submit">submit</button>
              </Form>
              {actionData && <p id="action">{actionData.message}</p>}
              <Link to="/next">next</Link>
              <NavLink to="/next" id="next-dom">next-dom</NavLink>
              <Link6 to="/next" id="next6">next6</Link6>
            </main>;
          }
        `,
        'app/routes/next.tsx': js`
          import { Suspense } from 'react';
          import { defer } from '@remix-run/node';
          import { Await, Link, useLoaderData } from '@remix-run/react';

          export function loader() {
            return defer(
              {
                value: new Promise(resolve => setTimeout(resolve, 2_000, 'navigation deferred')),
                failure: new Promise((_, reject) =>
                  setTimeout(reject, 1_000, new Error('expected rejection')),
                ),
              },
              { status: 206, headers: { 'X-Remix-Compat': 'navigation' } },
            );
          }

          export function headers({ loaderHeaders }) {
            return loaderHeaders;
          }

          export default function Next() {
            let { value, failure } = useLoaderData<typeof loader>();
            return <main>
              <Suspense fallback={<p id="next-fallback">waiting</p>}>
                <Await resolve={value}>{value => <p id="next-resolved">{value}</p>}</Await>
              </Suspense>
              <Suspense fallback={<p>waiting for error</p>}>
                <Await resolve={failure} errorElement={<p id="rejected">rejected</p>} />
              </Suspense>
              <Link to="/">home</Link>
            </main>;
          }
        `,
      },
    });
    appFixture = await createAppFixture(fixture);
  });

  test.afterAll(async () => appFixture.close());

  test('SSR, hydration, action JSON, and deferred navigation use one RR runtime', async ({ page }) => {
    const app = new PlaywrightFixture(appFixture, page);
    const response = await app.goto('/', false);
    expect(response.status()).toBe(207);
    expect(response.headers()['x-remix-compat']).toBe('document');
    await expect(page.locator('#fallback')).toHaveText('waiting');
    await expect(page.locator('#document-rejected')).toHaveText('rejected');
    await expect(page.locator('#resolved')).toHaveText('document deferred');
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');

    const actionResponse = page.waitForResponse(
      response => response.url().includes('.data') && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'submit' }).click();
    expect((await actionResponse).status()).toBe(201);
    expect((await actionResponse).headers()['x-remix-action']).toBe('json');
    await expect(page.locator('#action')).toHaveText('action json');

    const navigationResponse = page.waitForResponse(
      response =>
        new URL(response.url()).pathname === '/next.data' &&
        response.request().method() === 'GET',
    );
    await page.locator('#next-dom').click();
    expect((await navigationResponse).status()).toBe(206);
    expect((await navigationResponse).headers()['x-remix-compat']).toBe(
      'navigation',
    );
    await expect(page.locator('#next-fallback')).toHaveText('waiting');
    await expect(page.locator('#rejected')).toHaveText('rejected');
    await expect(page.locator('#next-resolved')).toHaveText('navigation deferred');
  });
});
