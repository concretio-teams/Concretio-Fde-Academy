// Checks every resource link in src/content/resources.ts. Run: npm run check:links
// Exit code 1 if any link is broken, so CI can fail on it. YouTube links are checked with oEmbed.
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../src/content/resources.ts', import.meta.url), 'utf8');
const urls = [...src.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1]);
let bad = 0;

async function check(url) {
  const yt = /youtube\.com\/watch|youtu\.be\//.test(url);
  const target = yt ? `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json` : url;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(target, { redirect: 'follow', headers: { 'User-Agent': 'academy-link-check' }, signal: AbortSignal.timeout(20000) });
      if (r.ok) {
        if (yt) {
          const j = await r.json();
          if (!/anthropic/i.test(j.author_name || '')) return `author is "${j.author_name}", expected Anthropic`;
        }
        return '';
      }
      if (attempt === 1) return `HTTP ${r.status}`;
    } catch (e) {
      if (attempt === 1) return String(e.message || e);
    }
  }
  return 'unknown';
}

const results = await Promise.all(urls.map(async (u) => [u, await check(u)]));
for (const [u, err] of results) {
  if (err) { bad++; console.log(`BROKEN  ${u}  (${err})`); } else console.log(`ok      ${u}`);
}
console.log(`\n${urls.length - bad}/${urls.length} links ok`);
process.exit(bad ? 1 : 0);
