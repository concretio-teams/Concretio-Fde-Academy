// Career tiers, taken from the draft FDE roadmap (one member's research, not final).
// This is display data only. Nothing here is saved, gated or sent to the server.
// Course links are left out on purpose: the draft gave none and they must be verified before learners see them.

export type Coverage = 'academy' | 'partial' | 'external' | 'gap';
export type Area = 'Technical' | 'Client skills' | 'Both';

export interface RoadmapItem {
  title: string;
  area: Area;
  hours?: number; // planned hours from the draft; undefined when the draft gives none
  status: 'Mandatory' | 'Recommended' | 'Optional' | 'Gate';
  cover: Coverage;
  module?: string; // academy module that covers it (fully or in part)
  note?: string;
}

export interface Gate { name: string; detail: string }

export interface Tier {
  n: number;
  years: string;
  title: string;
  outcome: string;
  exit: string;
  hours: string; // total from the draft
  weeks: string;
  modules: string[]; // academy modules that belong to this tier
  built: boolean; // false: no academy content or item list yet
  gates: Gate[];
  items: RoadmapItem[];
  topics?: string; // short line for tiers without an item list
}

const it = (title: string, area: Area, hours: number | undefined, status: RoadmapItem['status'], cover: Coverage, module?: string, note?: string): RoadmapItem =>
  ({ title, area, hours, status, cover, module, note });

export const TIERS: Tier[] = [
  {
    n: 1,
    years: '0 to 2 years',
    title: 'Builds components under guidance',
    outcome: 'Build Claude powered components (API calls, tools, RAG, MCP) under guidance, and run a structured customer conversation.',
    exit: 'Claude Certified Developer, Foundations exam, plus an accepted capstone',
    hours: '88 to 98 hours',
    weeks: '18 to 25 weeks at 4 to 5 hours a week',
    modules: ['m1', 'm2', 'm3', 'm4'],
    built: true,
    gates: [
      { name: 'Certification', detail: 'Claude Certified Developer, Foundations exam (draft says $125, 53 questions, pass 720 of 1000)' },
      { name: 'Capstone', detail: 'A RAG and tool use app with an evaluation set (30 to 40 hours). Two senior reviewers score it against a written rubric.' },
      { name: 'Practice drill', detail: 'Two mock customer calls and a one page summary for each. One senior reviewer, "meets bar" on a 4 point scale.' },
      { name: 'Live engagement', detail: 'Shadow one real engagement. The engagement lead signs off.' },
    ],
    items: [
      it('AI Capabilities and Limitations', 'Technical', 4, 'Mandatory', 'academy', 'm1'),
      it('AI Fluency: Framework and Foundations', 'Technical', 4, 'Mandatory', 'academy', 'm1', 'Linked as a resource in Module 1'),
      it('Claude Platform 101', 'Technical', 3, 'Mandatory', 'gap'),
      it('Building with the Claude API', 'Technical', 14, 'Mandatory', 'gap', undefined, 'Largest hole: the academy teaches Claude Code, not building with the API'),
      it('Claude Code 101', 'Technical', 3, 'Mandatory', 'academy', 'm2'),
      it('Introduction to Model Context Protocol', 'Technical', 2, 'Mandatory', 'academy', 'm5'),
      it('Introduction to agent skills', 'Technical', 1.5, 'Mandatory', 'academy', 'm5'),
      it('Build with Retrieval-Augmented Generation', 'Technical', 3, 'Mandatory', 'gap'),
      it('Developer exam prep (5 courses)', 'Technical', undefined, 'Mandatory', 'gap', undefined, 'Hours not stated in the draft'),
      it('Claude Certified Developer, Foundations exam', 'Technical', 2, 'Gate', 'external'),
      it('How to Talk to Users (Y Combinator video)', 'Client skills', 1, 'Mandatory', 'partial', 'm8', 'Module 8 teaches requirement discovery'),
      it('How to Speak (MIT OpenCourseWare video)', 'Client skills', 1, 'Mandatory', 'external'),
      it('Technical Writing One (Google)', 'Client skills', 3, 'Mandatory', 'external'),
      it('Write Simply (Paul Graham essay)', 'Client skills', 0.25, 'Mandatory', 'external'),
      it('Project kickoff play (Atlassian)', 'Client skills', 0.5, 'Mandatory', 'external'),
      it('What is a forward deployed engineer? (PostHog)', 'Client skills', 0.25, 'Mandatory', 'partial', 'm8'),
      it('Discovery drill: two mock customer calls', 'Client skills', 4, 'Gate', 'partial', 'm8', 'Module 8 has the discovery lesson and prompt, not a reviewed mock call'),
      it('Scope AI Solutions (OpenAI)', 'Both', 1.5, 'Mandatory', 'partial', 'm8', 'Module 8 covers scoping and estimating'),
      it('Capstone: RAG and tool use app with an evaluation set', 'Both', 35, 'Gate', 'gap', undefined, 'Not the same as the Module 9 capstone'),
    ],
  },
  {
    n: 2,
    years: '2 to 4 years',
    title: 'Designs and delivers agentic solutions',
    outcome: 'Design, evaluate and secure multi agent solutions, and frame decisions for client leads.',
    exit: 'Claude Certified Architect, Foundations exam, plus an accepted capstone',
    hours: 'about 92 hours',
    weeks: '18 to 23 weeks at 4 to 5 hours a week',
    modules: ['m5', 'm6', 'm7', 'm8', 'm9'],
    built: true,
    gates: [
      { name: 'Certification', detail: 'Claude Certified Architect, Foundations exam (draft says $125, 60 questions, pass 720 of 1000)' },
      { name: 'Capstone', detail: 'A multi agent system with an MCP server, an evaluation suite and a red team report (40 hours). Two senior reviewers.' },
      { name: 'Practice drill', detail: 'A one page decision memo and a 10 minute executive readout. One senior reviewer.' },
      { name: 'Live engagement', detail: 'Shadow one real engagement. The engagement lead signs off.' },
    ],
    items: [
      it('Claude Code in Action', 'Technical', 2, 'Mandatory', 'academy', 'm2'),
      it('Model Context Protocol: Advanced Topics', 'Technical', 3, 'Mandatory', 'partial', 'm5'),
      it('Introduction to subagents', 'Technical', 1.5, 'Mandatory', 'academy', 'm5'),
      it('Evaluate AI Applications (OpenAI)', 'Technical', 2.5, 'Mandatory', 'gap'),
      it('Design and Build Agentic Systems (OpenAI)', 'Technical', 3.5, 'Mandatory', 'gap'),
      it('Evaluating AI Agents (DeepLearning.AI)', 'Technical', 4, 'Mandatory', 'gap', undefined, 'Free only during the provider beta, per the draft'),
      it('Red Teaming LLM Applications (DeepLearning.AI)', 'Technical', 2.5, 'Mandatory', 'partial', 'm7', 'Module 7 covers threat modelling and review of AI code'),
      it('Architect Foundations exam prep', 'Technical', 10, 'Mandatory', 'gap'),
      it('Claude Certified Architect, Foundations exam', 'Technical', 2, 'Gate', 'external'),
      it('Customer Interviews (Teresa Torres)', 'Client skills', 0.5, 'Mandatory', 'partial', 'm8'),
      it('The Mom Test with Rob Fitzpatrick', 'Client skills', 1, 'Mandatory', 'partial', 'm8'),
      it('Think Fast, Talk Smart (Stanford GSB)', 'Client skills', 1, 'Mandatory', 'external'),
      it('Technical Writing Two (Google)', 'Client skills', 2, 'Mandatory', 'external'),
      it('Pyramid Principle: answer first and SCQA', 'Client skills', 0.5, 'Mandatory', 'external'),
      it('Making decisions (Open University)', 'Client skills', 4, 'Mandatory', 'external'),
      it('Amazon 2015 shareholder letter: one way and two way doors', 'Client skills', 0.5, 'Mandatory', 'external'),
      it('DACI decision making play (Atlassian)', 'Client skills', 0.5, 'Mandatory', 'external'),
      it('Stakeholder communication plan play (Atlassian)', 'Client skills', 0.5, 'Mandatory', 'external'),
      it('Decision drill: decision memo and executive readout', 'Client skills', 6, 'Gate', 'partial', 'm8', 'Module 8 teaches the lightweight architecture decision record'),
      it('Claude FDE path: Delivery Methodology and Driving Enterprise Adoption', 'Both', undefined, 'Mandatory', 'external', undefined, 'Partner courses, hours not stated'),
      it('The AI-native SDLC playbook', 'Both', 1, 'Recommended', 'external'),
      it('Capstone: multi agent system, MCP server, evaluation suite, red team report', 'Both', 40, 'Gate', 'partial', 'm9', 'Module 9 is a client delivery capstone, a different shape'),
    ],
  },
  {
    n: 3,
    years: '4 to 6 years',
    title: 'Owns production architecture',
    outcome: 'Own production architecture on one cloud, including governance, security and cost, and negotiate scope with the client.',
    exit: 'Accepted capstone (AWS track) or capstone plus Google Professional Agentic Architect (Google track)',
    hours: 'about 65 hours (AWS) or about 135 hours (Google)',
    weeks: '13 to 16 weeks (AWS) or 27 to 34 weeks (Google)',
    modules: [],
    built: false,
    topics: 'Claude on Bedrock or Vertex AI, enterprise governance and rollout, negotiation and stakeholders, change management, decision making techniques, thresholds from business requirements.',
    gates: [
      { name: 'Certification', detail: 'Google track only: Google Professional Agentic Architect. The draft says it is new and its terms should be re-checked in December 2026.' },
      { name: 'Capstone', detail: 'A cloud deployment covering identity and access, governance and cost (40 hours). Two senior reviewers.' },
      { name: 'Practice drill', detail: 'A negotiation role play on scope, timeline and price, plus a stakeholder map. One senior reviewer.' },
      { name: 'Live engagement', detail: 'Deliver one real engagement. The engagement lead signs off.' },
    ],
    items: [],
  },
  {
    n: 4,
    years: '6+ years',
    title: 'Leads enterprise engagements',
    outcome: 'Lead enterprise engagements end to end, set AI adoption strategy with client executives, and review other FDEs architectures.',
    exit: 'Claude Certified Architect, Professional exam, plus an accepted capstone',
    hours: 'about 69 hours',
    weeks: '14 to 17 weeks at 4 to 5 hours a week',
    modules: [],
    built: false,
    topics: 'Professional exam prep, AI leadership and adoption strategy, mental models, human and agent teams, architecture review boards, blameless reviews, defending thresholds with executives.',
    gates: [
      { name: 'Certification', detail: 'Claude Certified Architect, Professional exam (draft says $175, 63 questions)' },
      { name: 'Capstone', detail: 'An architecture review of a live engagement and an enterprise rollout plan (40 hours). Two senior reviewers.' },
      { name: 'Practice drill', detail: 'A steering committee review and an adoption plan with success metrics. One senior reviewer.' },
      { name: 'Live engagement', detail: 'Deliver one real engagement. The engagement lead signs off.' },
    ],
    items: [],
  },
];

export const COVER_LABEL: Record<Coverage, string> = {
  academy: 'In the academy',
  partial: 'Partly in the academy',
  external: 'External',
  gap: 'Not covered yet',
};

export function coverCounts(t: Tier): Record<Coverage, number> {
  const c: Record<Coverage, number> = { academy: 0, partial: 0, external: 0, gap: 0 };
  for (const i of t.items) c[i.cover]++;
  return c;
}
