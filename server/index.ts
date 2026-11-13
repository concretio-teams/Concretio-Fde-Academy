// Standalone server: serves the built app and the API. Used by Render (and `npm start`).
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { getStore } from './store.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '..', 'dist');
const port = Number(process.env.PORT) || 3001;

if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1h', index: 'index.html' }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

getStore()
  .then((s) => {
    if (s.kind === 'file' && process.env.NODE_ENV === 'production') {
      console.warn('[warn] DATABASE_URL is not set: using a local JSON file. Data is lost on redeploy unless a persistent disk is attached.');
    }
    app.listen(port, () => console.log(`Claude Code Academy listening on :${port} (storage: ${s.kind})`));
  })
  .catch((e) => { console.error('Failed to start:', e.message); process.exit(1); });
