# Roles in the capstone

Everyone works the same case through the same seven steps (discover, explore, decide, prototype, validate, iterate, own).
What differs is the lens you bring and the extra deliverable you add at each step. Pick the role closest to your day job.
You may do a second role afterwards to see the delivery from another side.

| Step | Developer | Ops | QA | Engineering lead |
|---|---|---|---|---|
| 1 Discover | Problem statement and assumption log | Which morning routine will use this, and who acts on it | Questions that would make a requirement testable | Stakeholder map and who decides what |
| 2 Explore | Map of `legacy/report.js` and the data | Where the data comes from and when it is fresh | List of ways the legacy report can be wrong | Risks, dependencies and unknowns |
| 3 Decide | Chosen solution with a short decision record | Run model: where it runs, who restarts it | Test strategy for the chosen option | Options compared, cost and effort estimate |
| 4 Prototype | Working thin slice on the real CSV | Scheduled run on a laptop or server, with a failure alert | Tests that fail on the legacy report and pass on the fix | Review of the prototype against the decision record |
| 5 Validate | Demo script and feedback log | Dry run with a dispatcher (or role play) | Acceptance tests mapped to each stakeholder's claim | Go or no go recommendation |
| 6 Iterate | One change from feedback, tests first | Handling of bad nightly files | Regression suite and a defect report | Updated plan and scope call |
| 7 Own | One page handover | Runbook: start, stop, failure, who to call | Release checklist and known issues | Delivery summary to the client sponsor |

## What good looks like for every role

- You state which facts you verified and which are assumptions.
- You can say, in two sentences, why you did not build the dashboard exactly as the email asked.
- Every claim you make about the data is backed by a number from `data/shipments.csv`.
- You used Claude Code, and you read and checked what it produced.
