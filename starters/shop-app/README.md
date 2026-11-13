# Shop app starter

A tiny shop (products, cart, orders, a small HTTP API). No dependencies. Needs Node 18 or newer.

Used by these academy assignments:

| Assignment | How you use it |
|---|---|
| Module 2, first session | Practice sessions, `@` mentions and permission modes on a safe project |
| Module 4, CLAUDE.md | Write a CLAUDE.md for it and prove Claude follows it |
| Module 6, debugging | Fix the five bugs reported in `BUG_REPORTS.md` |

## Run it

```
npm test        # runs the tests (they pass today)
npm start       # API on http://localhost:3000
```

Try the API:

```
curl -X POST localhost:3000/orders -d '{"items":[{"sku":"KB-01","quantity":2}]}'
curl localhost:3000/orders
curl localhost:3000/orders/today
```

## Files

- `src/cart.js` cart, promo codes and totals
- `src/orders.js` creating, listing and counting orders
- `src/db.js` in-memory stock, products and orders
- `src/server.js` the HTTP routes
- `test/` the existing tests

## For the Module 6 debugging assignment

Copy this folder out of the academy repo and run `git init` in the copy so you can commit once per bug.
Work only from `BUG_REPORTS.md`. Do not read `ANSWERS.md` until you have finished or are truly stuck.
