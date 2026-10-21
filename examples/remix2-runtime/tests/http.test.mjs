import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { after, before, test } from 'node:test';

let server;
let base;
let output = '';
before(async () => {
  server = spawn(process.execPath, ['server.mjs'], {
    env: { ...process.env, PORT: '0', NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server startup timed out\n${output}`)), 15000);
    server.once('exit', code => {
      clearTimeout(timer);
      reject(new Error(`Server exited ${code}\n${output}`));
    });
    server.stderr.on('data', chunk => { output += chunk; });
    server.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/REMIX2_READY (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) {
        base = match[1];
        clearTimeout(timer);
        resolve();
      }
    });
  });
});
after(async () => {
  if (server?.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    await exited;
  }
});

test('SSR uses the unchanged custom server entry and native loader', async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-remix2-entry'), 'custom-server');
  assert.equal(response.headers.get('x-remix2-loader'), 'native');
  const html = await response.text();
  assert.match(html, /native-loader-v1/);
  assert.match(html, /window\.__remixContext/);
  const manifestURL = html.match(/import "([^"]*\/manifest-[^"]+\.js)"/)?.[1];
  assert(manifestURL, 'SSR must reference the native browser manifest');
  const manifest = await fetch(new URL(manifestURL, base));
  assert.equal(manifest.status, 200);
  assert.match(await manifest.text(), /__remixManifest/);
  assert.doesNotMatch(html, /__reactRouterManifest|__reactRouterContext/);
});

test('native _data GET and POST preserve JSON, status, headers, and revalidation', async () => {
  const before = await fetch(`${base}/?_data=routes%2F_index`);
  assert.equal(before.headers.get('x-remix2-loader'), 'native');
  const state = await before.json();
  const action = await fetch(`${base}/?_data=routes%2F_index`, {
    method: 'POST',
    body: new URLSearchParams({ message: 'http-native' }),
  });
  assert.equal(action.status, 201);
  assert.equal(action.headers.get('x-remix2-action'), 'native');
  assert.deepEqual(await action.json(), { submitted: 'http-native', revision: state.revision + 1 });
  const revalidated = await fetch(`${base}/?_data=routes%2F_index`);
  assert.equal((await revalidated.json()).revision, state.revision + 1);
  const next = await fetch(`${base}/next?_data=routes%2Fnext`);
  assert.equal(next.headers.get('x-remix2-next'), 'native');
  assert.deepEqual(await next.json(), { message: 'native-next-loader' });
});

test('document and _data action redirects preserve the native redirect protocol', async () => {
  const options = {
    method: 'POST',
    redirect: 'manual',
    body: new URLSearchParams({ intent: 'redirect' }),
  };
  const document = await fetch(`${base}/?index`, options);
  assert.equal(document.status, 303);
  assert.equal(document.headers.get('location'), '/next?redirected=1');
  assert.equal(document.headers.get('x-remix2-redirect'), 'native');
  const data = await fetch(`${base}/?_data=routes%2F_index`, options);
  assert.equal(data.status, 204);
  assert.equal(data.headers.get('x-remix-redirect'), '/next?redirected=1');
  assert.equal(data.headers.get('x-remix-status'), '303');
  assert.equal(data.headers.get('x-remix2-redirect'), 'native');
});

test('deferred document streams a shell before pending and rejected values settle', async () => {
  const response = await fetch(`${base}/deferred`);
  const reader = response.body.getReader();
  const first = await reader.read();
  const shell = new TextDecoder().decode(first.value);
  assert.equal(response.headers.get('x-remix2-entry'), 'custom-server');
  assert.match(shell, /Pending waiting/);
  assert.doesNotMatch(shell, /pending-resolved-native/);
  let html = shell;
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    html += new TextDecoder().decode(chunk.value);
  }
  assert.match(html, /already-resolved-native/);
  assert.match(html, /pending-resolved-native/);
  assert.match(html, /Rejected handled natively/);
});

test('native deferred _data emits real text/remix-deferred with data and error records', async () => {
  const response = await fetch(`${base}/deferred?_data=routes%2Fdeferred`);
  assert.equal(response.headers.get('content-type'), 'text/remix-deferred; charset=utf-8');
  assert.equal(response.headers.get('x-remix2-defer'), 'native');
  const body = await response.text();
  assert.match(body, /__deferred_promise:pending/);
  assert.match(body, /already-resolved-native/);
  assert.match(body, /data:\{"pending":"pending-resolved-native"\}/);
  assert.match(body, /error:\{"rejected":/);
});
