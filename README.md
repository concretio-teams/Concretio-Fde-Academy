# Concretio FDE Academy

Interactive, self-paced academy that turns developers into confident AI-assisted engineers with Claude Code, and lays the foundation for our Forward Deployed Engineer (FDE) program.

## What is inside

- 8 modules, 24 lessons, 148 scenario based quiz questions (plus 24 in the final exam)
- 32 playground exercises (pick the command, order the workflow, fix the prompt, find the vulnerability)
- 12 practical assignments and a final assessment (theory exam plus practical tasks)
- Click-to-explore Mermaid diagrams, click-to-learn concepts, prompt builder, simulated Claude Code interface
- **Start here page:** three starting levels (new, uses AI assistants, already uses Claude Code) so nobody has to guess where to begin. Each lesson opens with a one sentence "In short" summary, and the path shows honest time estimates.
- **Glossary:** every term used in the lessons, searchable, in plain language.
- **Starter project:** `starters/shop-app` is a small dependency free app with five seeded bugs, used by the Module 2, 4 and 6 assignments (`BUG_REPORTS.md` for learners, `ANSWERS.md` for the answer key).
- **Mentor summary:** every assignment can copy a short progress summary to paste to a mentor.
- **Accounts:** sign up or sign in to save progress to your account and continue on any device. Guests keep working with browser-only saving, and guest progress is merged into the account on first sign-in.
- **Global search:** `Ctrl/Cmd + K` or `/` searches lessons, concepts, exercises, assignments and resources.
- **Easy journey:** the sidebar always shows the single best next step. Press `C` to continue from anywhere.
- **Collapsible navigation** (`[` key) and keyboard shortcuts (`?` for the list).

## Run it locally

```
npm install
npm run dev:full      # web on :5173, API on :3001 (proxied)
```

Without `DATABASE_URL` the API stores accounts in `.data/db.json`. That is for local development only.
`npm run dev` alone starts just the web app; accounts then show as unavailable and progress saves in the browser.

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | production | 16+ random characters, signs login cookies. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_URL` | production | Neon Postgres connection string (use the pooled one). Tables are created automatically. |
| `ALLOWED_EMAIL_DOMAINS` | recommended | Comma separated, for example `concret.io`. Empty allows any email. |
| `PGSSL` | no | `disable` if your Postgres has no TLS |

See `.env.example`.

## Database: Neon

Neon (https://neon.com) is the primary database for accounts and progress: project `concretio-fde-academy`, database `academy`, region `aws-ap-southeast-1` (Singapore). It does not expire with the web service.

Get the connection string with the Neon CLI:

```
neonctl login
neonctl connection-string --project-id <project-id> --database-name academy --role-name academy_owner --pooled
```

To copy data from another Postgres (read only on the source, verified row by row, safe to re-run):

```
SRC_DATABASE_URL=... DST_DATABASE_URL=... node scripts/migrate-db.mjs --dry   # count first
SRC_DATABASE_URL=... DST_DATABASE_URL=... node scripts/migrate-db.mjs
```

## Deploy on Render (app and API in one service)

1. Push this repo to GitHub and install the Render GitHub app on the organisation.
2. Create the web service from `render.yaml` (Blueprint) or with the Render CLI. The database is Neon, so no Render database is needed.
3. In the service Environment tab, set `DATABASE_URL` to the Neon pooled connection string. `JWT_SECRET` is generated for you.
4. Check `https://<your-service>/api/health`: it should report `"storage":"postgres"`.

Notes: free Render web services sleep when idle, so use a paid plan for anything long lived.

## Deploy on Vercel

1. Use the same Neon database and copy its pooled connection string.
2. Import the repo in Vercel. Build settings come from `vercel.json`.
3. Add environment variables `JWT_SECRET`, `DATABASE_URL`, `ALLOWED_EMAIL_DOMAINS`.
4. Deploy, then open `/api/health` to confirm `"storage":"postgres"`.

The API runs as one serverless function (`api/index.ts`); `/api/*` is rewritten to it in `vercel.json`. Do not deploy to Vercel without `DATABASE_URL`: its filesystem is ephemeral.

## Security notes

- Passwords are hashed with bcrypt; sessions are signed, HttpOnly, SameSite=Lax cookies (Secure in production); state changing requests are same-origin checked; auth endpoints are rate limited per server instance.
- **Email addresses are not verified.** The domain allowlist stops outsiders using other domains, but anyone could register someone else's `@concret.io` address. The data at stake is learning progress only. Add email verification or SSO before storing anything sensitive.
- There is no password reset flow yet.

## Structure

- `src/content/modules/mN.ts` : one file per module (schema in `src/content/types.ts`)
- `src/content/final.ts`, `src/content/resources.ts` : final assessment and resources
- `src/ui/index.tsx` : the UI kit. All pages use only this layer, so replacing it with the in-house Focus UI package is a one-folder change.
- `server/` : Express API (`app.ts`), storage (`store.ts`), standalone server (`index.ts`); `api/index.ts` is the Vercel entry
- `shared/progress.ts` : progress shape and merge logic used by both browser and server
- `CONTENT_GUIDE.md` : rules for writing and verifying content
- `public/brand/` : Concretio logo and balloon icon (taken from concret.io). Brand colors and the Poppins font are set at the top of `src/styles.css`. Swap the files here if marketing supplies official assets.

## Notes

- Content was checked against code.claude.com/docs on 2026-11-13. Claude Code changes quickly, so re-verify commands and version callouts before each cohort.
- Focus UI is not integrated yet (package location pending).
