// Every required Salesforce item must appear exactly once in the one fixed path, every path module must appear once,
// and the order inside each level must keep the Salesforce courses before the Claude courses and modules.
// Run: npx tsx scripts/check-sf-path.ts
import { SF_PATH, requiredSfItems, sfItemMap } from '../src/lib/sfPath';

let bad = 0;
const fail = (msg: string) => { bad++; console.log('FAIL  ' + msg); };

const ids = SF_PATH.flatMap((s) => (s.t === 'sf' ? s.ids : []));
const req = requiredSfItems().map((i) => i.id);
const all = sfItemMap();
const missing = [...all.values()].filter((i) => i.status === 'Required' && !ids.includes(i.id)).map((i) => i.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
const unknown = ids.filter((id) => !all.has(id));
const mods = SF_PATH.flatMap((s) => (s.t === 'm' ? [s.n] : []));
const modDup = mods.filter((n, i) => mods.indexOf(n) !== i);
if (missing.length) fail(`required items not on the path: ${missing}`);
if (dup.length) fail(`items twice: ${dup}`);
if (unknown.length) fail(`unknown ids: ${unknown}`);
if (modDup.length) fail(`modules twice: ${modDup}`);
if (mods.length !== 9) fail(`expected all 9 modules on the path, found ${mods.length}`);

// Within a level block (between headings): the Salesforce heading comes first, so check heading order.
const heads = SF_PATH.flatMap((s) => (s.t === 'h' ? [s.title] : []));
const want = ['FDE Associate: Salesforce', 'FDE Associate: Claude', 'FDE: Salesforce', 'FDE: Claude', 'Senior FDE: Salesforce', 'Senior FDE: Claude'];
if (heads.length !== want.length || want.some((w, i) => !heads[i]?.startsWith(w))) fail(`heading order is wrong: ${heads.join(' | ')}`);

// Harting's Associate Salesforce order.
const a = SF_PATH.find((s) => s.t === 'sf');
const hart = ['sf-a1', 'sf-a2', 'sf-a3', 'sf-vibes', 'sf-a6', 'sf-a7', 'sf-a8'];
const got = (a && a.t === 'sf' ? a.ids : []).filter((id) => hart.includes(id));
if (got.join() !== hart.join()) fail(`Associate Salesforce order differs from Harting's: ${got}`);

console.log(`${bad ? 'FAIL' : 'PASS'}  fixed path: ${req.length} required Salesforce items, ${mods.length} modules, ${heads.length} blocks`);
process.exit(bad ? 1 : 0);
