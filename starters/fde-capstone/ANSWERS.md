# Answer key (mentors, and learners after step 7)

Numbers below were computed from `data/shipments.csv` as committed (83 lines, 80 unique shipments).
If you change the data, recompute them.

## The real problem

Maya asked for a dashboard of late deliveries. What she needs is an **early warning for shipments that are about to miss their promise**, from numbers the three stakeholders agree on.
A dashboard of past lateness arrives after the customer has already called. A morning list of at-risk open shipments fits her 10 minute routine.

## What is wrong with the legacy report

| # | Defect | How to see it |
|---|---|---|
| 1 | Carrier names are not normalised, so `swiftline ` and `SwiftLine` are separate rows, and blank carriers become an empty group | The report prints 6 carrier groups for 3 carriers plus unknown |
| 2 | Dates compared as strings, so a `DD/MM/YYYY` promise is compared with an ISO delivery date | 12 rows use `DD/MM/YYYY`; `12/03/2026` sorts before any `2026-...` string |
| 3 | The 3 re-exported duplicate rows are counted twice | NP-1004, NP-1011, NP-1030 appear twice |
| 4 | In transit shipments (10) count in the denominator but cannot be late yet | `delivered_at` is empty, so they are treated as on time |
| 5 | 2 rows say `delivered` but have no delivery date | They are counted as on time |
| 6 | The legacy tests pass because they only test the happy path | None covers a dirty row |

## Corrected numbers

Unique shipments 80: 70 delivered, 10 in transit. Of the 70 delivered, 2 have no delivery date, so 68 can be judged.

| Carrier | Late / judged | Late % |
|---|---|---|
| SwiftLine | 12 / 31 | 39% |
| NorthRoute | 10 / 16 | 63% |
| EuroHaul | 7 / 15 | 47% |
| Carrier blank | 3 / 6 | 50% |

By service level, the sharpest finding is **NorthRoute STANDARD: 10 of 12 late (83%)** and **EuroHaul STANDARD: 7 of 12 (58%)**. On EXPRESS among named carriers, only SwiftLine has late deliveries (4 of 9); a further 1 of 2 EXPRESS shipments with a blank carrier is late.
The penalty column in the data adds up to EUR 705, calculated with the strict rule (late means after the promised date).

The legacy report shows NorthRoute at 55% and SwiftLine split into 33% and 80%, so it understates the worst carrier and invents a problem with a misspelt one.

## The stakeholder conflicts a good FDE finds

| Conflict | What to do |
|---|---|
| Maya: late is after the promised date. Dan: late is more than 24 hours after. | Do not choose silently. Show both definitions, tell Maya and Dan, and get one agreed. The data's penalty column follows Maya's strict rule, which is a clue worth raising with Dan. |
| Maya wants to know before it is late. The legacy report and the email ask for after. | Restate the problem as early warning, and confirm with her. |
| The CEO says zero late deliveries. | Treat it as an ambition, not an acceptance criterion. Propose a measurable target agreed with the sponsor. |
| Ravi cannot give API access but can drop a nightly CSV. | Design for a nightly file, so the freshest data is yesterday. Say so to Maya. |

## Reasonable solution options (any of these can be right, if the decision is defended)

| Option | Strength | Weakness |
|---|---|---|
| A. Fix the legacy report and add a morning at-risk list (script plus a text or HTML file) | Smallest, fits the file drop and the 10 minute routine | No live view |
| B. A small local web page reading the nightly CSV | Easy to read, filterable | More to host and secure |
| C. A BI tool dashboard | Familiar to some | Needs a new vendor or account, which IT forbids |

Option C breaks a stated constraint. Reject it with the reason.

## Handover must include

How to run it, where the nightly file lands, what happens when the file is missing or malformed, who owns it, what it does not do (no live tracking), the agreed definition of late, and the known data issues to fix at the source with Ravi.
