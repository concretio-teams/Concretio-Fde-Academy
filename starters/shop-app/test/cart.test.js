import test from 'node:test';
import assert from 'node:assert/strict';
import { Cart } from '../src/cart.js';

test('subtotal adds up the items', () => {
  const cart = new Cart();
  cart.addItem('KB-01', 1);
  cart.addItem('MS-02', 2);
  assert.equal(cart.subtotal, 88);
});

test('a valid promo code reduces the total', () => {
  const cart = new Cart();
  cart.addItem('KB-01', 2);
  cart.applyPromo('SAVE10');
  assert.equal(cart.total, 88.2);
});

test('an unknown promo code is rejected', () => {
  const cart = new Cart();
  assert.throws(() => cart.applyPromo('NOPE'), /Invalid promo code/);
});
