import http from 'node:http';
import { send } from './http.js';
import { handleTasks } from './routes/tasks.js';

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/health') return send(res, 200, { ok: true });
  if (await handleTasks(req, res, url)) return;
  send(res, 404, { error: 'Not found' });
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  server.listen(3000, () => console.log('Task tracker on http://localhost:3000'));
}
