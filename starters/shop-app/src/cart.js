import { products } from './db.js';

const PROMOS = { SAVE10: 0.1, SAVE20: 0.2 };

export class Cart {
  constructor() {
    this.items = new Map(); // sku -> quantity
    this._subtotal = null; // cached to avoid recalculating on every read
    this._discount = 0;
  }

  addItem(sku, quantity = 1) {
    if (!products[sku]) throw new Error(`Unknown product: ${sku}`);
    this.items.set(sku, (this.items.get(sku) ?? 0) + quantity);
    this._subtotal = null;
  }

  removeItem(sku) {
    this.items.delete(sku);
    this._subtotal = null;
  }

  get subtotal() {
    if (this._subtotal === null) {
      let sum = 0;
      for (const [sku, quantity] of this.items) sum += products[sku].price * quantity;
      this._subtotal = sum;
    }
    return this._subtotal;
  }

  applyPromo(code) {
    const rate = PROMOS[code];
    if (rate === undefined) throw new Error(`Invalid promo code: ${code}`);
    this._discount = this.subtotal * rate;
  }

  get total() {
    return Math.round((this.subtotal - this._discount) * 100) / 100;
  }
}
