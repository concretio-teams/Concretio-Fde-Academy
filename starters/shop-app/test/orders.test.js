import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from '../src/orders.js';
import { getStock } from '../src/db.js';

test('creating an order reduces stock', async () => {
  const before = await getStock('KB-01');
  const order = await createOrder([{ sku: 'KB-01', quantity: 2 }]);
  assert.equal(order.total, 98);
  assert.equal(await getStock('KB-01'), before - 2);
});

test('an unknown product is rejected', async () => {
  await assert.rejects(() => createOrder([{ sku: 'XX-99', quantity: 1 }]), /Unknown product/);
});
