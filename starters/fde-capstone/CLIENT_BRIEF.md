# Northwind Parcel: client brief

You have joined Northwind Parcel as the forward deployed engineer for four weeks (compressed into one academy capstone).
Northwind Parcel is a regional freight forwarder. They book shipments with outside carriers and promise delivery dates to customers.

## The email from the client

> From: Maya Okafor, Head of Dispatch
> Subject: Late deliveries
>
> We keep missing delivery promises and the penalties are adding up. Please build us a dashboard that shows late deliveries by carrier. We have a report already (it is in `legacy/report.js`) but nobody trusts it. We need this soon.

That is the whole request. Everything else you have to find out, the way a real FDE would.

## Your first conversations (notes you took)

**Maya Okafor, Head of Dispatch (the sponsor)**
- "I want to know *before* a shipment is late, not after. By the time it is in the report, the customer has already called."
- "Late means after the promised date. Simple."
- Cares most about EXPRESS shipments. Her team has about 10 minutes each morning to act.

**Dan Whitfield, Finance**
- "Penalties are EUR 15 for a late STANDARD shipment and EUR 50 for a late EXPRESS shipment, per the contracts."
- "Customers give us one day of grace, so late means more than 24 hours after the promised date." (Maya has not heard this.)
- Needs a monthly total he can put in the board pack.

**Ravi Menon, owner of the data (TMS administrator)**
- "The file is a manual weekly export from our transport system. Carrier names are typed by hand by the booking clerks."
- "Some offices export dates as DD/MM/YYYY. If someone re-exports, the old rows get appended again."
- "I cannot give you API access. I can drop a CSV in a shared folder every night."
- Constraints from IT: nothing leaves the company network, no new vendor accounts, no personal customer data beyond company names.

**The CEO, in the corridor**
- "Our goal is zero late deliveries by next quarter."

## What is in this folder

| Path | What it is |
|---|---|
| `data/shipments.csv` | The latest export: 83 lines, real columns, real mess |
| `legacy/report.js` | The existing report nobody trusts |
| `test/legacy.test.js` | Tests for the legacy report. They all pass. |
| `ROLES.md` | What each role (developer, ops, QA, engineering lead) hands in |

## Ground rules

- Run everything on your own machine. Use Claude Code for exploring, planning and building, as taught in Modules 2 to 8.
- Do not edit `data/shipments.csv`. Your solution must cope with it as it is.
- Do not open `ANSWERS.md` until you have finished step 7 and written your own handover.
