import http from 'node:http';
import { createOrder, listOrders, ordersCreatedToday } from './orders.js';

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); }
    });
  });
}

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'POST' && url.pathname === '/orders') {
      const body = await readJson(req);
      const items = body.items.map((i) => ({ sku: i.sku, quantity: Number(i.quantity) }));
      return send(res, 201, await createOrder(items));
    }
    if (req.method === 'GET' && url.pathname === '/orders') {
      const page = Number(url.searchParams.get('page') ?? 1);
      return send(res, 200, listOrders({ page }));
    }
    if (req.method === 'GET' && url.pathname === '/orders/today') {
      return send(res, 200, ordersCreatedToday());
    }
    send(res, 404, { error: 'Not found' });
  } catch (err) {
    send(res, 500, { error: err.message, stack: err.stack });
  }
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  server.listen(3000, () => console.log('Shop app on http://localhost:3000'));
}
