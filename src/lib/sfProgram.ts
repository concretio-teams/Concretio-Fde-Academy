// The Concretio Salesforce FDE program, version 2.2 (3 Nov 2026, owners Abhinav Gupta and Harting Harris).
// Display and tracking data only. Learners tick items off; nothing is locked and nothing is graded here.
// Changes agreed in review with Harting (25 Nov 2026) are marked "review".
// Minutes come from the program. "est" means the program itself estimates, because the provider publishes no duration.

import type { SfLevel } from './store';

export type SfKind = 'Trail' | 'Superbadge' | 'Course' | 'Exam prep' | 'Workshop' | 'Exam';
export type SfStatus = 'Required' | 'Optional' | 'Decision pending';

export interface SfItem {
  id: string;
  title: string;
  minutes?: number; // undefined: duration not checked
  est?: boolean;
  kind: SfKind;
  provider: string;
  status: SfStatus;
  url: string;
  note?: string;
  module?: string; // academy module that teaches the matching skill
  login?: boolean; // the page needs a free login to open
  partner?: boolean; // the Partner Learning Camp: a person has to be invited to the partner portal first
}

export interface SfStage { id: string; title: string; sub?: string; items: SfItem[] }
export interface SfLevelInfo { id: SfLevel; title: string; years: string; owns: string; stages: SfStage[] }

const TH = 'Trailhead';
const AA = 'Anthropic Academy';
const PLC = 'Partner Learning Camp';
const APA = 'Anthropic Partner Academy';

// Agreed in review: required for everyone on the program (Harting, 26 Nov 2026). Duration 8 h 20 min per Harting.
const vibes = (status: SfStatus): SfItem => ({
  id: 'sf-vibes',
  title: 'Get started with Agentforce Vibes (trailmix)',
  kind: 'Trail', provider: TH, status, login: true, minutes: 500,
  url: 'https://trailhead.salesforce.com/users/teamtrailhead/trailmixes/get-started-with-agentforce-vibes',
  note: 'Salesforce vibe coding tool. Review: required. 8 h 20 min per Harting.',
  module: 'm1',
});

export const SF_LEVELS: SfLevelInfo[] = [
  {
    id: 'associate', title: 'FDE Associate', years: '0 to 2 years', owns: 'Build pieces of a solution under guidance.',
    stages: [{
      id: 'associate', title: 'Associate', items: [
        { id: 'sf-a1', title: 'Agentblazer Champion 2026', minutes: 643, kind: 'Trail', provider: TH, status: 'Required', url: 'https://trailhead.salesforce.com/content/learn/trails/become-an-agentblazer-champion-2026', note: 'Skip if already earned.' },
        { id: 'sf-a2', title: 'Agentblazer Innovator 2026', minutes: 1110, kind: 'Trail', provider: TH, status: 'Required', url: 'https://trailhead.salesforce.com/content/learn/trails/become-an-agentblazer-innovator-2026' },
        { id: 'sf-a3', title: 'Agentblazer Legend 2026', minutes: 1048, kind: 'Trail', provider: TH, status: 'Required', url: 'https://trailhead.salesforce.com/content/learn/trails/become-an-agentblazer-legend-2026', note: 'Prep for the Specialist exam. Includes two superbadges, the Testing Center and agent monitoring.' },
        { id: 'sf-a4', title: 'Superbadge: Flow Fundamentals', minutes: 100, kind: 'Superbadge', provider: TH, status: 'Required', login: true, url: 'https://trailhead.salesforce.com/content/learn/superbadges/superbadge_flow_basics_sbu', note: 'Graded hands-on.' },
        { id: 'sf-a5', title: 'Claude Platform 101', minutes: 90, kind: 'Course', provider: AA, status: 'Optional', url: 'https://anthropic.skilljar.com/claude-platform-101', note: 'Review: optional. It teaches API use, not vibe coding.' },
        { id: 'sf-a6', title: 'Agentforce Implementation Ready', minutes: 175, kind: 'Course', provider: PLC, status: 'Required', partner: true, url: 'https://sfdc.co/afieplc', note: '10 courses, 2 h 55 min.' },
        { id: 'sf-a7', title: 'Agentforce Specialist exam prep', minutes: 600, est: true, kind: 'Exam prep', provider: 'Self study', status: 'Required', url: 'https://trailhead.salesforce.com/credentials/agentforcespecialist', note: 'Exam guide and practice tests.' },
        { id: 'sf-a8', title: 'Agentforce Specialist exam', kind: 'Exam', provider: 'Salesforce', status: 'Required', url: 'https://trailheadacademy.salesforce.com/certificate/exam-agentforce-specialist---AI-201', note: '60 questions. Sitting time is not counted. Completes Legend status.' },
        // Added in review (Harting, 25 Nov 2026): the Claude Code courses and Agentforce Vibes for Associates.
        { id: 'sf-a9', title: 'Claude 101', minutes: 60, est: true, kind: 'Course', provider: AA, status: 'Required', url: 'https://anthropic.skilljar.com/claude-101', note: 'Review: added. Everyday use and core features.', module: 'm1' },
        { id: 'sf-a10', title: 'AI Fluency: Framework and Foundations', minutes: 90, est: true, kind: 'Course', provider: AA, status: 'Required', url: 'https://anthropic.skilljar.com/ai-fluency-framework-foundations', note: 'Review: added. When to trust AI output and when to check it.', module: 'm1' },
        { id: 'sf-a11', title: 'Claude Code 101', minutes: 60, est: true, kind: 'Course', provider: AA, status: 'Required', url: 'https://anthropic.skilljar.com/claude-code-101', note: 'Review: added. Claude Code in a daily workflow, the core of vibe coding.', module: 'm2' },
        { id: 'sf-a12', title: 'Claude Code in Action', minutes: 60, est: true, kind: 'Course', provider: AA, status: 'Required', url: 'https://anthropic.skilljar.com/claude-code-in-action', note: 'Review: added. Steer, configure, automate and verify long sessions.', module: 'm3' },
        vibes('Required'),
      ],
    }],
  },
  {
    id: 'fde', title: 'FDE', years: '2 to 6 years', owns: 'Build, test and then design a full agent solution.',
    stages: [
      {
        id: 'fde1', title: 'Stage 1: data and build', sub: 'About 2 to 4 years', items: [
          { id: 'sf-f1', title: 'Data 360 Learning Journey', minutes: 1500, est: true, kind: 'Trail', provider: TH, status: 'Required', url: 'https://trailhead.salesforce.com/data-cloud-trail', note: '3 trails. Includes the Data Stream Fundamentals superbadge.' },
          { id: 'sf-f2', title: 'Superbadge: Apex Callouts', minutes: 225, kind: 'Superbadge', provider: TH, status: 'Required', login: true, url: 'https://trailhead.salesforce.com/content/learn/superbadges/superbadge-apex-callouts-sbu', note: 'Graded hands-on.' },
          { id: 'sf-f3', title: 'Headless Development on the Platform', minutes: 2080, kind: 'Trail', provider: TH, status: 'Required', url: 'https://trailhead.salesforce.com/content/learn/trailhead-journey/agentforce-360-platform', note: 'New in v2.2. 3 trails: Establish the Agentic Enterprise, Build with Low-Code Tools, Build with Pro-Code Tools (Apex, Agentforce DX, CLI, testing).' },
          { id: 'sf-f4', title: 'Data 360 Implementation Ready', minutes: 319, kind: 'Course', provider: PLC, status: 'Required', partner: true, url: 'https://sfdc.co/d360ieplc', note: '14 courses, 5 h 19 min.' },
          { id: 'sf-f5', title: 'Data 360 Consultant prep', minutes: 360, kind: 'Exam prep', provider: PLC, status: 'Required', url: 'https://cloud.mail.salesforce.com/datacloudpartnerpocketguide', note: 'Videos and pocket guide.' },
          { id: 'sf-f6', title: 'Data 360 Consultant exam', kind: 'Exam', provider: 'Salesforce', status: 'Required', url: 'https://trailheadacademy.salesforce.com/certificate/exam-data-cloud---Data-Con-101', note: '60 questions. Sitting time is not counted.' },
        ],
      },
      {
        id: 'fde2', title: 'Stage 2: Claude, security and FDE Ready', sub: 'About 4 to 6 years', items: [
          { id: 'sf-g1', title: 'Superbadge: Apex Web Services', minutes: 280, kind: 'Superbadge', provider: TH, status: 'Required', login: true, url: 'https://trailhead.salesforce.com/content/learn/superbadges/superbadge-custom-api-sbu', note: 'Graded hands-on.' },
          { id: 'sf-g2', title: 'Superbadge: Data Categorization and Access', minutes: 95, kind: 'Superbadge', provider: TH, status: 'Required', login: true, url: 'https://trailhead.salesforce.com/content/learn/superbadges/superbadge_data_categorization_sbu', note: 'Graded hands-on.' },
          { id: 'sf-g3', title: 'Superbadge: Access Governance', minutes: 95, kind: 'Superbadge', provider: TH, status: 'Required', login: true, url: 'https://trailhead.salesforce.com/content/learn/superbadges/superbadge_governing_access_sbu', note: 'Graded hands-on.' },
          { id: 'sf-g4', title: 'Building with the Claude API', minutes: 540, kind: 'Course', provider: AA, status: 'Required', url: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api', note: '67 lessons, Python.' },
          { id: 'sf-g5', title: 'Introduction to MCP', minutes: 60, kind: 'Course', provider: AA, status: 'Required', url: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol', note: '10 lessons and a quiz. The academy lists this as 90 minutes: the two numbers need reconciling.', module: 'm5' },
          { id: 'sf-g6', title: 'Agentforce FDE Ready workshop', minutes: 960, est: true, kind: 'Workshop', provider: 'Salesforce', status: 'Decision pending', url: 'https://cloud.mail.salesforce.com/workshop-listing', note: 'In person, 2 days, selection based, South India only. Decision pending in the program.' },
          { id: 'sf-g7', title: 'Claude Developer exam prep', minutes: 774, kind: 'Exam prep', provider: APA, status: 'Required', url: 'https://anthropic-partners.skilljar.com/page/claude-certification-exam-prep-courses', note: '5 modules including evals and security.' },
          { id: 'sf-g8', title: 'Claude Certified Developer, Foundations exam', kind: 'Exam', provider: 'Anthropic (Pearson)', status: 'Required', url: 'https://anthropic-partners.skilljar.com/page/partner-certifications', note: 'Proctored. Sitting time is not counted.' },
        ],
      },
    ],
  },
  {
    id: 'senior', title: 'Senior FDE', years: '6+ years', owns: 'Own the client relationship, architecture and rollout.',
    stages: [{
      id: 'senior', title: 'Senior', items: [
        { id: 'sf-s1', title: 'Integration and Platform Orchestration for the Agentic Era', minutes: 558, kind: 'Trail', provider: TH, status: 'Required', url: 'https://trailhead.salesforce.com/content/learn/trails/agentic-integration-platform-orchestration', note: 'MuleSoft, MCP and A2A, multi agent orchestration, agent governance.' },
        { id: 'sf-s2', title: 'Deploying Claude Enterprise with Confidence', minutes: 120, est: true, kind: 'Course', provider: AA, status: 'Required', url: 'https://anthropic.skilljar.com/deploying-claude-enterprise-with-confidence', note: 'Rollout decisions. Review: link fixed, the program linked the catalog root.' },
        { id: 'sf-s3', title: 'AI Leadership', minutes: 180, kind: 'Course', provider: 'OpenAI Academy', status: 'Required', url: 'https://academy.openai.com/pages/courses', note: 'Strategy, governance and adoption.' },
        { id: 'sf-s4', title: 'Claude Architect Professional exam prep', minutes: 733, kind: 'Exam prep', provider: APA, status: 'Required', url: 'https://anthropic-partners.skilljar.com/page/claude-certification-exam-prep-courses', note: '5 modules including stakeholder discovery and safety.' },
        { id: 'sf-s5', title: 'Claude Certified Architect, Professional exam', kind: 'Exam', provider: 'Anthropic (Pearson)', status: 'Required', url: 'https://anthropic-partners.skilljar.com/page/partner-certifications', note: 'Proctored. Content changes on 7 Dec. Sitting time is not counted.' },
      ],
    }],
  },
];

export const SF_LABEL: Record<SfLevel, string> = { associate: 'FDE Associate', fde: 'FDE', senior: 'Senior FDE' };

export const sfItems = (l: SfLevelInfo) => l.stages.flatMap((s) => s.items);

/** Hours that count toward the level: required items with a known duration. Exams carry no learning hours. */
export const sfMinutes = (items: SfItem[]) => items.filter((i) => i.status === 'Required').reduce((s, i) => s + (i.minutes ?? 0), 0);

export const fmtHours = (min: number) => {
  return `${Math.round((min / 60) * 10) / 10} h`;
};
