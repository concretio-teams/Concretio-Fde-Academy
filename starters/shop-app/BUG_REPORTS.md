# Bug reports

Written the way real users report problems. Give Claude one report at a time. Do not tell it where the bug is.

## Report 1: Order list shows the wrong orders
After placing 6 orders I open `GET /orders?page=1`. The first order is missing and I see later ones instead. Page 2 is sometimes empty even though I have more orders.
Expected: page 1 shows my first orders, page 2 shows the next ones.

## Report 2: Discount stays after I remove an item
I add a keyboard and a mouse, apply promo code `SAVE10`, then remove the mouse. The total should be 44.10 (10 percent off 49.00). It shows 42.15.
Expected: the discount follows what is actually in the cart.

## Report 3: Strange quantity crashes the server response
`POST /orders` with a quantity of `-1` (or `"abc"`) returns a 500 error and a stack trace in the response body.
Expected: a clear 400 error that says the quantity is invalid, with no internal details.

## Report 4: Two people bought the last headset
Product `HD-03` has one unit. Two customers ordered at nearly the same moment and both orders were accepted. Stock went to a wrong number.
Expected: one order succeeds, the other is refused as out of stock.

## Report 5: "Orders created today" is wrong near midnight
Our server is not in UTC. An order placed at 10:00 UTC does not show up in `GET /orders/today` at 19:00 UTC the same day. Orders around midnight show up on the wrong day.
Expected: "today" means the current UTC day, everywhere.
