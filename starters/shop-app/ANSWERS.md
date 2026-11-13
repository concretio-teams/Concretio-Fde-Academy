# Answer key (spoilers)

Look only after you have tried each bug with Claude. Compare your root causes, not just your fixes.

| # | Where | Root cause | Correct fix | How to reproduce in a test |
|---|---|---|---|---|
| 1 | `src/orders.js` `listOrders` | Pages start at 1 but the offset is `page * size` | `offset = (page - 1) * size`, and reject page below 1 | Create 6 orders, `listOrders({ page: 1, size: 2 })` must return orders 1 and 2 |
| 2 | `src/cart.js` | The discount amount is computed once in `applyPromo` and never recalculated when items change | Store the promo rate and compute the discount from the current subtotal inside `total` | Add two items, apply `SAVE10`, remove one, expect 44.10 |
| 3 | `src/server.js` and `src/orders.js` | Quantity is never validated, so `new Array(-1)` and `new Array(NaN)` throw a RangeError that becomes a 500 with a stack trace | Validate quantity is a positive integer, return 400 with a short message; never return `err.stack` | POST quantity -1 and "abc", expect 400 and no `stack` field |
| 4 | `src/orders.js` | Read stock, wait, then write stock. Two requests both read 1 before either writes | Make the check and the decrement one atomic step (a single function in `db.js` that does both without an `await` in between, or a per-sku lock) | `Promise.all` two orders for `HD-03`, exactly one must succeed and stock must be 0 |
| 5 | `src/orders.js` `ordersCreatedToday` | Compares local date parts, so the answer depends on the server timezone | Compare UTC parts (`getUTCFullYear`, `getUTCMonth`, `getUTCDate`) | Create an order at `2026-11-13T10:00:00Z`, ask with now `2026-11-13T19:00:00Z`, expect 1. Run with a non-UTC `TZ` |

## Also worth noticing

- Bug 3 also leaks internals through `err.stack`. That is a security issue, not only a validation issue.
- No existing test covers any of these five behaviours. That is why the suite is green.
- A good fix adds one test per bug, written before the fix, and does not weaken any existing test.
