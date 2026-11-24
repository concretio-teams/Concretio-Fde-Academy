import type { Assignment, Module } from '../types';

const opt = (text: string, why: string) => ({ text, why });
const STARTER = 'starters/fde-capstone';

const step = (n: number, title: string, minutes: number, brief: string, steps: string[], deliverable: string, checklist: string[], extra: Partial<Assignment> = {}): Assignment => ({
  id: `m9-a${n}`,
  title: `Step ${n}: ${title}`,
  minutes,
  starter: STARTER,
  brief,
  steps,
  deliverable,
  checklist,
  ...extra,
});

export const module: Module = {
  id: 'm9',
  number: 9,
  title: 'Capstone: Deliver a Client Project End to End',
  tagline: 'One real client case, seven steps, the whole FDE cycle. Developers, ops, QA and engineering leads each play their part.',
  level: 'Professional',
  requires: ['m8'],
  outcomes: [
    'Turn a one paragraph client email into a problem statement the sponsor agrees with',
    'Find the defects in an existing system by reading it and the data, with Claude Code as a research partner',
    'Choose a solution that respects the client constraints and record why',
    'Build and test a thin slice on real, messy data',
    'Validate it with stakeholders who disagree with each other',
    'Hand over something an operations team can run without you',
  ],
  skills: ['Requirement discovery', 'Solution design', 'Rapid prototyping', 'Client delivery'],
  lessons: [
    {
      id: 'm9-l1',
      title: 'The Northwind Parcel case: how the capstone works',
      minutes: 25,
      summary: 'You get one client email, one messy CSV and one legacy report. By the end you have delivered the whole FDE cycle on it.',
      objectives: [
        'Know the case, the seven steps and what you hand in at each',
        'Pick the role that matches your day job: developer, ops, QA or engineering lead',
        'Set up the starter project and run its tests and the legacy report',
        'Recognise the traps built into the case before you meet them',
      ],
      blocks: [
        {
          type: 'text',
          md: `You are the forward deployed engineer for **Northwind Parcel**, a regional freight forwarder. The head of dispatch has emailed you one paragraph: "We keep missing delivery promises. Please build us a dashboard that shows late deliveries by carrier."

That is all the requirement you get. The finance team, the data owner and the CEO each have different ideas of what "late" means and what success looks like. Your job is what an FDE does: **find the real problem, build the smallest thing that solves it, prove it with the people who will use it, and hand it over so it keeps working.**

This is a four week engagement compressed into about **6 to 8 hours** of focused work. Work with Claude Code throughout, and read what it produces.`,
        },
        {
          type: 'workflow',
          title: 'The seven steps (click each one)',
          steps: [
            { id: 'discover', title: 'Discover', what: 'Turn the email into a problem statement, an assumption log and the questions you still need answered.', why: 'The email asks for a dashboard. The real problem is hiding behind it.', ask: 'Here is the client email and my interview notes. Draft a problem statement, list my assumptions, and mark which are unverified. Do not suggest a solution yet.' },
            { id: 'explore', title: 'Explore', what: 'Read the legacy report and the data, find what is wrong with both, and quantify it.', why: 'Integration surprises and dirty data are the biggest source of delay on client work.', ask: 'In plan mode, read legacy/report.js and data/shipments.csv. List every way the report could give wrong numbers, with the file and line, and check each against the data. Do not edit anything.' },
            { id: 'decide', title: 'Decide', what: 'Compare two or three options against the client constraints and record the decision.', why: 'A written decision with its trade-offs is defensible to a client and to your own team.', ask: 'Given these constraints, compare three options with cost, risk and maintenance. I will make the decision.' },
            { id: 'prototype', title: 'Prototype', what: 'Build the thinnest end to end slice on the real CSV, with tests that fail on the legacy report.', why: 'It tests the riskiest assumptions and gives stakeholders something concrete to react to.', ask: 'Plan the smallest slice that meets these acceptance criteria. List what is hard coded. Wait for my approval before editing.' },
            { id: 'validate', title: 'Validate', what: 'Put it in front of the stakeholders (or role play them) and record what they say.', why: 'It turns opinions into evidence, and exposes conflicts such as two definitions of late.', ask: 'Turn these demo notes into a ranked list of changes and flag which contradict earlier requirements.' },
            { id: 'iterate', title: 'Iterate', what: 'Make one change from the feedback, tests first, and keep the scope under control.', why: 'Short cycles keep the client confident and the scope honest.', ask: 'Implement change 2 only. Update tests first, then code, then run the full suite.' },
            { id: 'own', title: 'Own and hand over', what: 'Write the handover: how to run it, what breaks, who owns it, what it does not do.', why: 'The client judges you on the problem going away, not on a merged change.', ask: 'Review the diff for security and error handling, then draft a one page runbook for the operations team.' },
          ],
        },
        {
          type: 'tabs',
          tabs: [
            { label: 'Developer', md: 'You build the fix. Hand in a problem statement and assumption log, a map of the legacy code, a decision record, a working slice with tests, a demo script, one feedback-driven change and a one page handover.' },
            { label: 'Ops', md: 'You make it runnable and reliable. Hand in the morning routine it supports, where the data comes from and how fresh it is, a run model with a failure alert, a dry run with a dispatcher, handling of a bad nightly file and a runbook.' },
            { label: 'QA', md: 'You make it trustworthy. Hand in testable versions of each claim, a list of ways the legacy report can be wrong, a test strategy, tests that fail on the legacy report and pass on the fix, acceptance tests per stakeholder, a regression suite and a release checklist.' },
            { label: 'Engineering lead', md: 'You make the calls. Hand in a stakeholder map, risks and unknowns, options with cost and effort, a review of the prototype against the decision, a go or no go, a scope decision and a delivery summary for the sponsor.' },
          ],
        },
        {
          type: 'compare',
          title: 'How this capstone compares with public FDE programmes',
          columns: ['Product School FDE Certification', 'Maven FDE Bootcamp', 'Xebia FDE Training', 'This academy'],
          rows: [
            { label: 'Format', cells: ['3 weeks part time, 6 live sessions of 2 hours', '6 weeks, 2 hours live a week plus projects', 'Three tracks (Delivery, AI, Domain). Hours not published', 'Self paced, about 6 to 8 hours for the capstone'] },
            { label: 'Price (as published)', cells: ['$2,999', '$2,750', 'Not published, contact form', 'Free, internal'] },
            { label: 'Capstone', cells: ['One client case ("Marlow", a regional bank), six artifacts, graded practical', 'Named projects (LUMINA, ARGUS) and a capstone, mostly agent systems', 'Not named. Mentions practical scenarios and projects', 'One client case (Northwind Parcel), seven steps, four roles'] },
            { label: 'Aimed at', cells: ['Engineers who already use a coding agent', 'Software and ML engineers, plus PMs and founders', 'Client facing and internal engineering teams', 'Developers, ops, QA and engineering leads'] },
            { label: 'Emphasis', cells: ['Fit test, workflow, access boundary, build, staged rollout, handover', 'Agent loop, subagents, agentic RAG, observability', 'Delivery, AI, and domain consulting skills', 'Discovery, messy data, decisions, validation, handover'] },
          ],
        },
        {
          type: 'text',
          md: `Figures are taken from each provider's own page on 2026-11-24 and may change: [Product School](https://productschool.com/courses/forward-deployed-engineering-certification), [Maven](https://maven.com/boring-bot/ai-system-design), [Xebia](https://xebia.com/artificial-intelligence/forward-deployed-engineering/training/). They are marketing pages, so treat counts and ratings as the provider's own claims.

**What we took from them.** Product School's case based design is the closest to ours, and it showed two gaps in the first version of this capstone: an explicit **access boundary** (what you will and will not touch, and who grants it) and a **staged rollout** (pilot with one person, then one team, then everyone). Both are now in Steps 3 and 5.`,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Set up (10 minutes)',
          md: `1. Copy the \`${STARTER}\` folder out of the academy repository, so you work in your own copy.
2. Run \`npm test\` (3 tests pass) and \`npm run report\` (it prints late % by carrier).
3. Open \`CLIENT_BRIEF.md\` and \`ROLES.md\`, then start Step 1 in **Assignments**.

The folder has no packages to install and needs Node 18 or newer. Do not open \`ANSWERS.md\` until you have written your own handover.`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'The case has traps on purpose',
          md: 'Real client work is untidy. Expect people who disagree, data that is dirty and a report that looks fine and is wrong. Finding these yourself, and saying so plainly, is the exercise. You will be asked to prove each claim with a number from the data.',
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'Maya emails: "Please build us a dashboard that shows late deliveries by carrier." You have not spoken to anyone else yet.',
          q: 'What is the best first move?',
          options: [
            opt('Ask Claude Code to build the dashboard from the email and refine it afterwards', 'You would build the requested solution before knowing the problem. It may be exactly what she asked for and still miss what she needs.'),
            opt('Interview the sponsor, finance and the data owner, then restate the problem and get agreement before designing', 'Correct. Discovery comes first. Different stakeholders hold different facts, and agreement on the problem prevents rework.'),
            opt('Tell Maya that a dashboard is the wrong answer and propose your own design', 'You do not have the evidence yet. Challenge with questions and data, not a verdict.'),
            opt('Fix the legacy report first, because everyone agrees it is wrong', 'It is wrong, but fixing it before understanding the need may polish the wrong deliverable.'),
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'Maya says late means after the promised date. Dan in finance says customers get 24 hours of grace, so late means more than 24 hours after.',
          q: 'What should you do?',
          options: [
            opt('Use Maya\'s definition, because she is the sponsor', 'Silently choosing one side hides a conflict that affects the penalty figures Dan reports to the board.'),
            opt('Use Dan\'s definition, because it matches the contract', 'You have only his word for it, and Maya has not heard it. Check the contract and bring both to the table.'),
            opt('Show both definitions side by side, tell both people, and get one agreed before it goes in a report', 'Correct. A conflict about a core definition is a client decision. Make it visible and get it settled.'),
            opt('Average the two so that both are partly right', 'There is no average of two definitions. It would satisfy nobody and mislead everyone.'),
          ],
          answer: 2,
        },
        {
          id: 'q3',
          scenario: 'You run the legacy report. It shows NorthRoute at 55% late and "swiftline" at 80%, with SwiftLine at 33%. A colleague says the report is fine because the tests pass.',
          q: 'What is the most useful reply?',
          options: [
            opt('Agree: the tests pass, so the numbers are probably correct', 'Passing tests only prove the code does what the tests check. These tests do not cover dirty data.'),
            opt('Point out that "swiftline" and "SwiftLine" are one carrier written two ways, so the report splits and distorts the numbers, then show the corrected figure from the data', 'Correct. A specific, checkable finding backed by the data beats opinion. The tests cover only clean rows.'),
            opt('Rewrite the whole report from scratch immediately', 'You have not yet listed what is wrong, so you cannot judge a rewrite against a targeted fix.'),
            opt('Ask Claude whether the report is right and trust the answer', 'Claude can help find defects, but you verify each one against the data. A confident answer is not evidence.'),
          ],
          answer: 1,
        },
        {
          id: 'q4',
          scenario: 'Ravi says there is no API access, only a nightly CSV drop. IT adds: no new vendor accounts and nothing leaves the company network. A teammate suggests a hosted BI tool because it looks great.',
          q: 'How do you respond?',
          options: [
            opt('Go ahead; a better looking tool is worth asking for an exception', 'You would be asking the client to break a stated constraint for your preference.'),
            opt('Reject it with the reason: it breaks two stated constraints, so choose an option that works with a nightly file inside the network', 'Correct. Constraints are part of the problem. Naming the reason shows you listened and keeps the decision defensible.'),
            opt('Build it anyway and get forgiveness later', 'It creates a security and compliance problem for the client, who then owns your shortcut.'),
            opt('Ignore the constraint until the demo', 'Hidden constraints surface at the worst time. Raise them when you decide.'),
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'In the demo, Maya says "great, that is exactly right" and Dan says nothing. Later you learn Dan expected the 24 hour grace to be applied.',
          q: 'What does this tell you about validation?',
          options: [
            opt('The demo went well; silence means agreement', 'A polite demo is not agreement. Silence from someone with a different expectation is a warning.'),
            opt('Validate with each stakeholder separately and ask specific questions, such as "which of these numbers would you put in the board pack?"', 'Correct. Specific questions to each person turn opinions into evidence and uncover mismatched expectations early.'),
            opt('Run the demo again with the same group and the same slides', 'It repeats the setup that hid the disagreement.'),
            opt('Skip validation, since the sponsor approved it', 'The sponsor is one stakeholder. Finance and operations own different parts of the outcome.'),
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'You have finished a working report. The nightly file sometimes arrives late or with a broken header. You are about to move on to the next client.',
          q: 'What does ownership require?',
          options: [
            opt('Nothing more; the report works on today\'s file', 'Working today is not working in operation. A bad file will break it without warning.'),
            opt('Handle a missing or malformed file with a clear message, document how to run and recover it, name an owner and say what it does not do', 'Correct. Ownership means the problem stays solved after you leave, and the next person can run it.'),
            opt('Tell the client to make sure the file is always perfect', 'You cannot control that, and the client will blame the report when it fails.'),
            opt('Add a more complex dashboard to cover it', 'More features do not fix an unhandled failure.'),
          ],
          answer: 1,
        },
      ],
    },
  ],
  assignments: [
    step(
      1, 'Discover: from an email to an agreed problem', 60,
      'Read `CLIENT_BRIEF.md`. The client asked for a dashboard of late deliveries. Work out what the problem really is, what you do not yet know, and what you would ask next. Use Claude Code to prepare, but do not let it invent facts about the client.',
      [
        'Read `CLIENT_BRIEF.md` fully, including all four sets of notes.',
        'Ask Claude Code to draft a problem statement and an assumption log from the notes, and to mark which items are unverified. Tell it not to propose a solution yet.',
        'Rewrite the problem statement in your own words in two sentences. State what you are NOT sure about.',
        'List every disagreement or conflict between stakeholders.',
        'Write five questions you would ask next, and who you would ask each of.',
        'Role deliverable: Developer, the assumption log. Ops, the morning routine this must support. QA, three requirements rewritten so they can be tested. Engineering lead, a stakeholder map with who decides what.',
      ],
      'A short document with: the problem statement, the assumption log (each assumption marked verified or not), the stakeholder conflicts you found, five follow-up questions with who to ask, and your role deliverable.',
      [
        'Problem statement is about the business problem, not about a dashboard',
        'Found that "late" is defined differently by two stakeholders',
        'Noted that the sponsor wants to know before a shipment is late',
        'Treated the CEO\'s "zero late" as an ambition, not an acceptance criterion',
        'Assumptions are marked verified or unverified',
        'Role deliverable included',
      ],
      { hint: 'Compare what Maya wants (a warning before it is late) with what she asked for (a report of past lateness). That gap is the finding.' },
    ),
    step(
      2, 'Explore: what is wrong with the existing report', 75,
      'Nobody trusts `legacy/report.js`. Read it and the data without editing anything, list every way it can give wrong numbers, and prove each one against `data/shipments.csv` with a count.',
      [
        'Run `npm test` and `npm run report`. Note that the tests pass.',
        'Start Claude Code in plan mode. Ask it to read `legacy/report.js` and `data/shipments.csv` and list the ways the report can be wrong, with the file and line. Do not let it edit anything.',
        'For each suspected defect, check it yourself with a command or a few lines of script, and write down the count. For example: how many dates are written DD/MM/YYYY, how many rows share an id, how many shipments are still in transit.',
        'Work out the corrected late percentage by carrier. Compare it with what the report prints.',
        'Rank the defects by how much each distorts the answer.',
        'Role deliverable: Developer, a map of the code and the data flow. Ops, where the data comes from and how fresh it is. QA, a list of ways the report can be wrong. Engineering lead, risks, dependencies and unknowns.',
      ],
      'A findings list: each defect, how you proved it (command and count), its effect on the numbers, the corrected late percentages by carrier, and your role deliverable. Paste the commands and their output.',
      [
        'Found at least four distinct defects in the report or the data',
        'Every defect is backed by a count you checked yourself',
        'Found the carrier name problem (case and trailing space)',
        'Found the mixed date formats and the duplicate rows',
        'Noticed in transit and missing delivery date rows',
        'Compared your corrected percentages with the legacy output',
        'Did not edit the data file or the report in this step',
      ],
      { hint: 'Do not trust a number Claude gives you. Ask it for the command that produces the number, run it, and read the output.' },
    ),
    step(
      3, 'Decide: choose a solution and write down why', 45,
      'Pick the solution to build, given what you learned. Compare at least three options against the client constraints and record the decision, including why you rejected the others.',
      [
        'List the client constraints from the brief (data access, network, vendors, time to act, who reads it).',
        'Describe at least three options. For each give strengths, weaknesses, rough effort and what you would have to hard code.',
        'Check each option against every constraint. Reject any that break one, and say which.',
        'Choose one and write a decision record: context, decision, alternatives, consequences, and what would make you revisit it.',
        'Write an access boundary: which files, systems and data you will use, which you will not touch, and who would have to approve anything beyond that.',
        'Write one paragraph that explains to Maya, in plain language, why you did not build exactly the dashboard she asked for.',
        'Role deliverable: Developer, the decision record. Ops, the run model: where it runs and who restarts it. QA, the test strategy for the chosen option. Engineering lead, options compared with cost and effort.',
      ],
      'A decision record (one page) with the constraint check, the options considered, the choice and the revisit trigger, plus the plain language paragraph for Maya and your role deliverable.',
      [
        'At least three options compared',
        'Rejected any option that breaks a stated constraint, and said which one',
        'The decision record includes what would make you revisit it',
        'The paragraph to Maya has no jargon',
        'Stated what the solution deliberately does not do',
        'Wrote an access boundary: what you will and will not touch, and who approves more',
        'Role deliverable included',
      ],
      { hint: 'A hosted dashboard tool may look attractive. Check it against "no new vendor accounts" and "nothing leaves the network" before you get attached to it.' },
    ),
    step(
      4, 'Prototype: build the thinnest working slice', 120,
      'Build the smallest version that gives Maya something useful on the real CSV: a corrected late percentage by carrier, plus a morning list of open shipments at risk. Write the tests first so you can see them fail on the legacy report.',
      [
        'Copy your plan into Claude Code in plan mode and ask for the smallest slice that meets your acceptance criteria. Ask it to list what is hard coded. Approve only when you agree.',
        'Write tests first for the defects you found (carrier names, date formats, duplicates, in transit, missing delivery date). Run them against the legacy report and confirm they fail.',
        'Implement the fix in small steps. Run `npm test` after each step.',
        'Add the morning list: open shipments that are close to their promised date, with carrier and service level. State the rule you use, and keep it simple.',
        'Run it on the real CSV and check the numbers against your Step 2 findings.',
        'Read the full diff yourself before moving on.',
        'Role deliverable: Developer, the working slice. Ops, a scheduled run with a failure alert. QA, tests that fail on the legacy report and pass on the fix. Engineering lead, a review against the decision record.',
      ],
      'Your changed code and tests, the passing `npm test` output, the output of your report on the real CSV, and your role deliverable. Include the "before" failing test output on the legacy code.',
      [
        'Tests were written first and failed on the legacy report',
        'Carrier names, date formats and duplicates are handled',
        'In transit and missing delivery dates are handled and reported, not silently dropped',
        'The numbers match your Step 2 findings',
        'The at-risk rule is written down in one sentence',
        'Read the whole diff before accepting it',
        'Did not edit `data/shipments.csv`',
      ],
      { hint: 'If the fix feels bigger than a page of code, you are probably building more than the thin slice. Cut it down.' },
    ),
    step(
      5, 'Validate: test it against the people who disagree', 45,
      'Run the demo for the stakeholders. If you are doing this alone, role play each of them, asking the specific questions that would expose a mismatch. Record what each would say.',
      [
        'Write a short demo script: the problem, what you built, and what it does not do.',
        'For each stakeholder (Maya, Dan, Ravi, the CEO) write the specific question you would ask, such as "which of these two numbers would you put in the board pack?".',
        'Show both definitions of "late" side by side with the figures each produces.',
        'Record, in a feedback log, what each stakeholder says or would likely say, and mark the points that contradict an earlier requirement.',
        'Decide what you will change and what you will not, and give a reason for each.',
        'Write a staged rollout: who uses it first (one dispatcher), who next (the dispatch team), then everyone. For each stage say what you will watch and what would make you pause.',
        'Role deliverable: Developer, the demo script and feedback log. Ops, a dry run of the morning routine. QA, acceptance tests mapped to each stakeholder claim. Engineering lead, a go or no go recommendation.',
      ],
      'A demo script, the feedback log with each stakeholder\'s reaction and the contradictions you found, and a list of changes you will and will not make, with reasons. Add your role deliverable.',
      [
        'Asked each stakeholder a specific question, not "any feedback?"',
        'Showed both definitions of late with their figures',
        'Recorded where a stakeholder contradicts an earlier requirement',
        'Decided what you will not change and why',
        'Said plainly what the solution does not do',
        'Wrote a staged rollout with a pause condition at each stage',
        'Role deliverable included',
      ],
    ),
    step(
      6, 'Iterate: change one thing, safely', 45,
      'Take the single most important change from your feedback log and make it, tests first. The point is controlled change, not a rewrite.',
      [
        'Choose one change. Write down why it ranks above the others.',
        'Write or update the test first and watch it fail.',
        'Make the change with Claude Code, in small steps. Run the whole test suite.',
        'Check that your Step 4 numbers still hold, or explain why they changed.',
        'Handle a bad nightly file: a missing file, an empty file and a file with a broken header. The program should say what is wrong and not crash or print wrong numbers.',
        'Role deliverable: Developer, the change with tests. Ops, handling of bad nightly files. QA, a regression suite and one defect report. Engineering lead, the updated plan and a scope decision.',
      ],
      'The change, the tests, the passing full suite, the output for a missing, empty and broken file, and your role deliverable.',
      [
        'Only one change was made, and the reason is written down',
        'The test was written first and failed first',
        'The full test suite passes',
        'A missing, empty or broken header file gives a clear message',
        'Earlier numbers still hold, or the difference is explained',
        'Role deliverable included',
      ],
    ),
    step(
      7, 'Own it: hand it over', 60,
      'Write the handover that lets someone else run, fix and trust this without you. Then open `ANSWERS.md` and compare it with your own work, honestly.',
      [
        'Write a one page handover: what it does, how to run it, where the nightly file lands, what happens when it fails, who owns it and who to call.',
        'List what it does not do (it is not live tracking) and the data issues that should be fixed at the source with Ravi.',
        'State the agreed definition of "late" and the open question for Dan.',
        'Ask Claude Code to review your diff for security and error handling. Read its findings and decide which are real.',
        'Write a delivery summary for Maya: three short paragraphs covering what changed, what you found about the data, and what you recommend next.',
        'Now open `ANSWERS.md`. List what you caught, what you missed and what you would do differently.',
        'Role deliverable: Developer, the handover. Ops, the runbook. QA, the release checklist and known issues. Engineering lead, the delivery summary to the sponsor.',
      ],
      'The handover, the delivery summary for Maya, your self-review against `ANSWERS.md` (caught, missed, would change), and your role deliverable.',
      [
        'The handover tells a stranger how to run and recover it',
        'It states what the solution does not do',
        'It names an owner',
        'The delivery summary is short and written for the sponsor, not for engineers',
        'Read the answer key only after finishing the handover',
        'Self-review lists at least one thing you missed',
        'Role deliverable included',
      ],
      { hint: 'Finding that you missed something is the point of the self-review. It is not a failure.' },
    ),
  ],
};
