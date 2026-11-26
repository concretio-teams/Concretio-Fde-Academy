import type { FinalAssessment } from './types';

const o = (text: string, why: string) => ({ text, why });

// The Salesforce exam: for learners on the Concretio Salesforce FDE program.
// It tests judgment when Claude Code writes or changes Salesforce work, not Apex or Flow basics (everyone here knows those).
// DRAFT: written by us, not by a Salesforce expert. Harting or another Salesforce lead must review every question
// for accuracy before it is used to assess people. Questions avoid version specific numbers on purpose.
export const finalSalesforce: FinalAssessment = {
  passMark: 75,
  questions: [
    {
      id: 'sf1',
      module: 'sf',
      scenario: 'Claude Code wrote an Apex trigger on Opportunity that runs a SOQL query and a DML statement inside a for loop over Trigger.new. It passes the single record test Claude wrote.',
      q: 'What is the right next step before this goes anywhere near production?',
      options: [
        o('Deploy it, because the test passed and Salesforce will report an error if there is a real problem', 'A one record test cannot show a bulk problem. Governor limit failures appear only when many records arrive at once, often in production.'),
        o('Ask Claude to rewrite the loop so queries and DML happen once per transaction, then prove it with a test that inserts and updates many records at once', 'Correct. Bulk safety is the first thing to check in AI written Apex, and only a bulk test proves it.'),
        o('Add a try and catch around the loop so a limit error is handled quietly', 'Limit exceptions cannot be handled this way, and hiding failures makes the problem harder to find.'),
        o('Keep the trigger as it is and tell users to update records one at a time', 'This pushes a design flaw onto users. Data loads, integrations and Flows all update many records at once.'),
      ],
      answer: 1,
    },
    {
      id: 'sf2',
      module: 'sf',
      scenario: 'To deploy to production you need enough Apex test coverage. Claude generates tests that call each method but contain no assertions. Coverage looks fine.',
      q: 'How should you treat these tests?',
      options: [
        o('Accept them: coverage is the deployment requirement and they meet it', 'Coverage only shows the code ran. Tests without assertions pass even when the code is wrong.'),
        o('Reject all AI written tests and write every test by hand from now on', 'Overcorrection. AI can draft good tests when it is told what behavior to check.'),
        o('Ask Claude to add a second, longer set of tests with the same style so the totals look stronger', 'More of the same does not check behavior.'),
        o('Add assertions on real outcomes (field values, records created, errors thrown), include bulk and negative cases, and check that a test fails when the code is broken', 'Correct. A useful test fails when the behavior is wrong. Coverage is a by-product, not the goal.'),
      ],
      answer: 3,
    },
    {
      id: 'sf3',
      module: 'sf',
      scenario: 'A teammate wants to try a vibe coding session with Claude Code and has a terminal already connected to the client\'s production org.',
      q: 'What should happen first?',
      options: [
        o('Let them go ahead, since Claude asks for approval before each command', 'Approval prompts are a safety net, not a plan. One approved command against production can still delete or change real data.'),
        o('Move the session to a sandbox or scratch org seeded with sample data, keep the code in version control, and promote changes only through review and a normal deployment', 'Correct. Experiment in a safe org, keep source control as the truth, and deploy deliberately.'),
        o('Use production but only for read queries', 'Reading customer data into an AI session is still a data risk, and one wrong command is easy.'),
        o('Run it in production out of business hours so fewer users are affected', 'Timing does not reduce the risk to data, and fixing damage costs more than preventing it.'),
      ],
      answer: 1,
    },
    {
      id: 'sf4',
      module: 'sf',
      scenario: 'To debug a case routing issue, a colleague wants to export 200 real Case records, with customer names and emails, and paste them into a Claude prompt.',
      q: 'What is the best way to proceed?',
      options: [
        o('Paste them: it is the fastest way for Claude to see the real pattern', 'Customer personal data does not belong in a prompt without approval and a data handling agreement. Speed is not a reason.'),
        o('Paste only the first 20 records so less data leaves the company', 'Fewer records is still personal data in a prompt.'),
        o('Build a small set of fake or masked records that reproduces the pattern, share the routing rules and the symptom, and keep real data in the org', 'Correct. A masked sample usually reproduces the logic, and no customer data leaves the system.'),
        o('Ask the customer to approve it in a quick chat message', 'Informal approval is not a data handling decision. Follow the client\'s agreed rules.'),
      ],
      answer: 2,
    },
    {
      id: 'sf5',
      module: 'sf',
      scenario: 'Claude wrote an Apex class that queries Account and Contact records and returns them to a Lightning component. It is declared to run without regard to the current user\'s sharing, and it does not check object or field access.',
      q: 'What should the review conclude?',
      options: [
        o('It is a security finding: users could see records and fields their profile or sharing rules would hide, so enforce sharing and object and field access, then test as a restricted user', 'Correct. AI written code often skips access enforcement. Prove the fix by running the code as a user with limited permissions.'),
        o('It is fine, because the component is only shown to internal users', 'Internal users still have different access. Sharing and field security exist for exactly this.'),
        o('It is fine as long as the class is not used by guest users', 'The risk is not limited to guest users. Many internal users should not see everything.'),
        o('It is a style issue, so note it and fix it in a later release', 'Data exposure is a security defect, not a style issue.'),
      ],
      answer: 0,
    },
    {
      id: 'sf6',
      module: 'sf',
      scenario: 'A client needs an email sent when a field on a custom object changes. Claude proposes a new Apex trigger with a helper class and tests. A teammate says a record triggered Flow could do it.',
      q: 'How should you decide?',
      options: [
        o('Take Claude\'s plan, because code is always more flexible than a Flow', 'Flexibility has a cost: someone has to maintain the code. Match the tool to the requirement and the client\'s team.'),
        o('Compare both against the requirement, the complexity and who will maintain it at the client, and choose the simpler option that meets it; use Claude to build or review either one', 'Correct. The choice is an engineering decision. Claude can help with a Flow or with code, but it does not decide who maintains it.'),
        o('Always choose the Flow, because declarative tools are always better', 'Not always. Some needs (complex logic, heavy volume) fit code better.'),
        o('Build both and let the client choose after seeing them', 'This doubles the work and avoids making a recommendation, which is your job.'),
      ],
      answer: 1,
    },
    {
      id: 'sf7',
      module: 'sf',
      scenario: 'Your team can use both Agentforce Vibes and Claude Code for Salesforce work. Half the team wants one standard tool and says the other is a waste of time.',
      q: 'What is the most sensible way to decide?',
      options: [
        o('Pick whichever tool a senior person likes best', 'Preference is not evidence, and different tasks may suit different tools.'),
        o('Pick the one with the longer feature list', 'Features that do not help your tasks do not matter.'),
        o('Run both on the same two or three real, low risk tasks in a sandbox, then compare the quality of the result, review effort and cost with the same checks', 'Correct. A small fair trial on your own work gives better evidence than opinion, and the same review standard applies to both tools.'),
        o('Ban both until the vendors prove the tools are safe', 'This gives up the benefit and does not remove the need to review any code. Safe use comes from process.'),
      ],
      answer: 2,
    },
    {
      id: 'sf8',
      module: 'sf',
      scenario: 'You want Claude Code to read from a client\'s Salesforce org during development, through an MCP server and an integration user.',
      q: 'How should access be set up?',
      options: [
        o('Use a system administrator user so nothing is ever blocked', 'This gives the AI session far more power than it needs, including the power to change or delete data.'),
        o('Reuse a developer\'s own login so the setup is quick', 'Shared personal logins hide who did what and carry that developer\'s full access.'),
        o('Use the production org so the data is realistic', 'Use realistic but non-production data. Production access adds avoidable risk.'),
        o('Use a dedicated integration user in a sandbox with only the objects and fields needed, read only where possible, and review what the session did', 'Correct. Least privilege in a safe org, with a separate identity so actions can be traced.'),
      ],
      answer: 3,
    },
    {
      id: 'sf9',
      module: 'sf',
      scenario: 'Claude Code has changed twelve metadata files in your project. A teammate suggests deploying straight away to save time.',
      q: 'What should happen first?',
      options: [
        o('Deploy to the sandbox right away to see if it works, then fix errors as they appear', 'Deploying unread changes can overwrite things you did not mean to change, and some mistakes do not produce errors.'),
        o('Review the full diff in version control, check that only the intended files changed, run the tests, and deploy through the normal pipeline', 'Correct. Read what changed, confirm the scope, test, then deploy. The diff is your review point.'),
        o('Ask Claude to summarize what it changed and deploy if the summary sounds right', 'A summary is not the change. You need to see the diff.'),
        o('Deploy only the largest file first, since it carries the most risk', 'File size does not equal risk, and partial deploys can break dependencies.'),
      ],
      answer: 1,
    },
    {
      id: 'sf10',
      module: 'sf',
      scenario: 'A vibe coded prototype built in a sandbox impresses the client. They ask when it can be live.',
      q: 'What is the best answer?',
      options: [
        o('"Next week: it already works"', 'It works in a demo. Production readiness (tests, security review, deployment and support) has not been done.'),
        o('"We cannot use AI generated work in production"', 'Overcorrection. The issue is review and verification, not the tool.'),
        o('"Soon, once we add tests, review security and access, plan the deployment and agree who supports it. Here is the plan and a date for each step"', 'Correct. It acknowledges the value, names what turns a prototype into a product, and gives the client a clear plan.'),
        o('"Let\'s ask Claude when it will be ready"', 'The estimate is yours to make from the work that remains.'),
      ],
      answer: 2,
    },
    {
      id: 'sf11',
      module: 'sf',
      scenario: 'You built an Agentforce agent for a client\'s service team. In the demo it answers well, but you have only tried ten questions that you wrote yourself.',
      q: 'What should you do before go-live?',
      options: [
        o('Go live: the demo went well and the client is happy', 'Ten friendly questions do not show how the agent behaves with real, messy or tricky ones.'),
        o('Build a set of test cases from real past requests, including edge cases and attempts to make it misbehave, run them repeatedly, fix the failures and agree what the agent must never do', 'Correct. Agents need structured testing and clear boundaries before real customers use them.'),
        o('Ask the agent to rate its own answers', 'An agent grading itself is weak evidence.'),
        o('Add more instructions to the prompt until it stops making mistakes in the demo', 'Tuning to the demo hides problems that real use will reveal.'),
      ],
      answer: 1,
    },
    {
      id: 'sf12',
      module: 'sf',
      scenario: 'A junior on the Associate path finished Claude Code 101 and the Agentblazer trails. They ship a Flow and an Apex class written by Claude and cannot explain how either one works.',
      q: 'What should the lead do?',
      options: [
        o('Praise the speed and let them continue, since the output works', 'Working output is not understanding. Someone must own and be able to fix it.'),
        o('Stop them using AI for Salesforce work', 'This removes a learning tool. The problem is missing understanding, not the tool.'),
        o('Move them off Salesforce work until they pass an exam', 'This is too blunt and does not teach the skill.'),
        o('Require them to explain each change in review, trace it with debug logs or a test, and say in a sentence what would break if it were wrong, with Claude used to teach, not only to produce', 'Correct. Ownership means understanding. Use review and tracing to build that, and use the tool to learn as well as to build.'),
      ],
      answer: 3,
    },
  ],
  practical: [
    {
      id: 'sp1',
      title: 'Vibe code a small Salesforce change in a sandbox',
      brief:
        'In a sandbox or scratch org (never production), use Claude Code to add one small change, such as a record triggered Flow or Apex trigger that updates a related field, or a small Lightning web component. Plan first, build in small steps, review every diff, and deploy with the Salesforce CLI from version control.',
      criteria: [
        'The work was done in a sandbox or scratch org with sample data, and the project is in version control',
        'A plan was made first (plan mode) and agreed before any code was written',
        'You read the full diff before deploying and noted at least one thing you changed or rejected',
        'Tests prove real behavior with assertions, include a bulk case, and fail when the code is broken',
        'You can explain in your own words how the change works and what would break if it were wrong',
      ],
    },
    {
      id: 'sp2',
      title: 'Review AI written Apex for bulk safety and access',
      brief:
        'Take (or have Claude write) a small Apex class and trigger for a realistic requirement. Review it as a reviewer: look for bulk safety, access enforcement and error handling. Write findings ranked by severity, fix the top issues and prove each fix.',
      criteria: [
        'You found at least three real issues, such as queries or DML in loops, missing sharing and field access checks, hard coded IDs, or weak error handling',
        'Findings are ranked by severity with the impact of each explained',
        'Each fix is proved by a test that fails before and passes after, including a many record case and a restricted user case',
        'You judged any automated review output on its merits and noted false positives',
        'A short note says what would still need review before production (security, deployment and support)',
      ],
    },
  ],
};
