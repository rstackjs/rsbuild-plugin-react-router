import { createRequestHandler } from '@remix-run/express';
import express from 'express';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const build = await import(pathToFileURL(resolve(
  process.env.REMIX2_SERVER_BUILD || 'build/server/index.js',
)).href);
const app = express();
app.disable('x-powered-by');
app.use(express.static('public', { index: false }));
app.all('*', createRequestHandler({
  build,
  mode: 'production',
  getLoadContext: () => ({ acceptance: 'native-remix2' }),
}));
const server = app.listen(Number(process.env.PORT || 3032), '127.0.0.1', () => {
  console.log(`REMIX2_READY http://127.0.0.1:${server.address().port}`);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
