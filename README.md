# Concretio FDE Academy

Interactive, self-paced academy that turns developers into confident AI-assisted engineers with Claude Code, and lays the foundation for our Forward Deployed Engineer (FDE) program.

## What is inside

- 8 modules, 23 lessons, 142 scenario based quiz questions
- 31 playground exercises (pick the command, order the workflow, fix the prompt, find the vulnerability)
- 12 practical assignments and a final assessment (theory exam plus practical tasks)
- Click-to-explore Mermaid diagrams, click-to-learn concepts, prompt builder, simulated Claude Code interface
- 8 curated free resources, progress dashboard, streaks and skills (saved in the browser)

## Run it

```
npm install
npm run dev
npm run build
```

## Structure

- `src/content/modules/mN.ts` : one file per module (schema in `src/content/types.ts`)
- `src/content/final.ts`, `src/content/resources.ts` : final assessment and resources
- `src/ui/index.tsx` : the UI kit. All pages use only this layer, so replacing it with the in-house Focus UI package is a one-folder change.
- `CONTENT_GUIDE.md` : rules for writing and verifying content

## Notes

- Content was checked against code.claude.com/docs on 2026-11-13. Claude Code changes quickly, so re-verify commands and version callouts before each cohort.
- Focus UI is not integrated yet (package location pending).
