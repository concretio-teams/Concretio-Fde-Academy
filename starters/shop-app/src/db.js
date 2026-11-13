// A tiny in-memory "database". The small delays imitate a real network call.
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

const stock = { 'KB-01': 10, 'MS-02': 5, 'HD-03': 1 };
export const products = {
  'KB-01': { sku: 'KB-01', name: 'Keyboard', price: 49.0 },
  'MS-02': { sku: 'MS-02', name: 'Mouse', price: 19.5 },
  'HD-03': { sku: 'HD-03', name: 'Headset (last one)', price: 89.0 },
};

export async function getStock(sku) {
  await tick();
  return stock[sku];
}

export async function setStock(sku, quantity) {
  await tick();
  stock[sku] = quantity;
}

export const orders = [];
