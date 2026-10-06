import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function createReactLazyCatalogFixture(
  root,
  count,
  format = 'esm'
) {
  await mkdir(join(root, 'app/generated'), { recursive: true });
  await mkdir(join(root, 'app/routes'), { recursive: true });
  const files = {
    'react-router.config.ts': `export default { ssr: true, appDirectory: 'app', buildDirectory: 'build', serverModuleFormat: ${JSON.stringify(format)} };`,
    'app/routes.ts': `import { index, route } from '@react-router/dev/routes'; export default [index('routes/index.tsx'), route('catalog/:item', 'routes/catalog.tsx')];`,
    'app/root.tsx': `import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
export default function Root() { return <html lang="en"><head><Meta /><Links /></head><body><Outlet /><ScrollRestoration /><Scripts /></body></html>; }`,
    'app/entry.client.tsx': `import { startTransition } from 'react'; import { hydrateRoot } from 'react-dom/client'; import { HydratedRouter } from 'react-router/dom'; startTransition(() => hydrateRoot(document, <HydratedRouter />));`,
    'app/entry.server.tsx': `import { PassThrough } from 'node:stream'; import { renderToPipeableStream } from 'react-dom/server'; import { createReadableStreamFromReadable } from '@react-router/node'; import { ServerRouter } from 'react-router';
export default function handleRequest(request, status, headers, context) {
  return new Promise((resolve, reject) => {
    let shell = false;
    const stream = renderToPipeableStream(<ServerRouter context={context} url={request.url} />, {
      onShellReady() { shell = true; const body = new PassThrough(); headers.set('Content-Type', 'text/html'); resolve(new Response(createReadableStreamFromReadable(body), { status, headers })); stream.pipe(body); },
      onShellError: reject,
      onError(error) { if (!shell) reject(error); },
    });
    request.signal.addEventListener('abort', () => stream.abort(), { once: true });
  });
}`,
    'app/routes/index.tsx': `import { useLoaderData } from 'react-router'; import { dependencyValue } from '../shared';
export function loader() { return { value: dependencyValue }; }
export async function action() { return { value: 'action original' }; }
export default function Index() { const data = useLoaderData(); return <main><p id="loader-value">{data.value}</p><input aria-label="Retained text" /><button onClick={event => event.currentTarget.textContent = 'interactive'}>Check interactivity</button></main>; }`,
    'app/shared.ts': `export const dependencyValue = 'loader original';`,
    'app/generated/registry.tsx': `import { lazy } from 'react';\nexport const optional = [\n${Array.from({ length: count }, (_, index) => `lazy(() => import('./optional-${index}')),`).join('\n')}\n];`,
    'app/routes/catalog.tsx': `import { Suspense } from 'react'; import { useLoaderData } from 'react-router'; import { optional } from '../generated/registry'; import './catalog.css';
export function loader({ params }) { return { item: Number(params.item ?? 0) }; }
export default function Catalog() { const { item } = useLoaderData(); const Selected = optional[item]; return <main><Suspense fallback={<p>Loading item</p>}><Selected /></Suspense><button onClick={event => event.currentTarget.textContent = 'interactive'}>Check interactivity</button></main>; }`,
    'app/routes/catalog.css': '.optional { color: darkslateblue; }',
  };
  for (let index = 0; index < count; index++)
    files[`app/generated/optional-${index}.tsx`] =
      `export default function Optional() { return <p className="optional">Optional item ${index}</p>; }`;
  await Promise.all(
    Object.entries(files).map(([name, source]) =>
      writeFile(join(root, name), source)
    )
  );
}
