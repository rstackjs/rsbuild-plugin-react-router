import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const probe = createServer();
probe.listen(0, '127.0.0.1');
await once(probe, 'listening');
const address = probe.address();
assert(address && typeof address !== 'string');
const { port } = address;
await new Promise(resolve => probe.close(resolve));

const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
child.stdout.on('data', chunk => {
  output += chunk;
});
child.stderr.on('data', chunk => {
  output += chunk;
});

try {
  const deadline = Date.now() + 30_000;
  let response;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Production server exited early.\n${output}`);
    }
    try {
      response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) {
        break;
      }
    } catch {
      // The server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert(response?.ok, `Production server did not become ready.\n${output}`);
  assert.match(await response.text(), /React Router Demo/);
  console.log('Production smoke request returned HTTP 200.');
} finally {
  child.kill('SIGTERM');
  await Promise.race([
    once(child, 'exit'),
    new Promise(resolve => setTimeout(resolve, 5_000)),
  ]);
  if (child.exitCode === null) {
    child.kill('SIGKILL');
  }
}
