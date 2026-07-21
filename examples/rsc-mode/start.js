import { createRequestListener } from '@remix-run/node-fetch-server';
import express from 'express';
import build from './build/server/index.js';

const app = express();
const port = Number(process.env.PORT ?? 3021);
const host = process.env.HOST ?? '127.0.0.1';

app.use('/', express.static('build/client', { index: false }));

app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(404).send('Not Found');
});

if (typeof build?.fetch !== 'function') {
  throw new Error('Expected build/server/index.js to export default.fetch');
}

app.use(createRequestListener(build.fetch));

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
