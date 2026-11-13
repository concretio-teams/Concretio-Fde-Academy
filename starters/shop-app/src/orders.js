import { getStock, setStock, orders } from './db.js';
import { products } from './db.js';

// items: [{ sku, quantity }]
export async function createOrder(items, now = new Date()) {
  for (const { sku, quantity } of items) {
    if (!products[sku]) throw new Error(`Unknown product: ${sku}`);
    const available = await getStock(sku);
    if (available < quantity) throw new Error(`Not enough stock for ${sku}`);
    await setStock(sku, available - quantity);
  }
  const total = items.reduce((sum, { sku, quantity }) => sum + products[sku].price * quantity, 0);
  const order = {
    id: orders.length + 1,
    items,
    total: Math.round(total * 100) / 100,
    createdAt: now.toISOString(),
    // one entry per unit, so the warehouse can pick them
    pickList: items.flatMap(({ sku, quantity }) => new Array(quantity).fill(sku)),
  };
  orders.push(order);
  return order;
}

// Pages start at 1.
export function listOrders({ page = 1, size = 5 } = {}) {
  const offset = page * size;
  return orders.slice(offset, offset + size);
}

export function ordersCreatedToday(now = new Date()) {
  return orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  });
}
