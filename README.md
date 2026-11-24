# Concretio FDE Academy

Interactive, self-paced academy that turns developers into confident AI-assisted engineers with Claude Code, and lays the foundation for our Forward Deployed Engineer (FDE) program.

## What is inside

- 9 modules, 25 lessons, 154 scenario based quiz questions (plus 24 in the final exam), ending in an end to end capstone
- 32 playground exercises (pick the command, order the workflow, fix the prompt, find the vulnerability)
- 12 practical assignments and a final assessment (theory exam plus practical tasks)
- Click-to-explore Mermaid diagrams, click-to-learn concepts, prompt builder, simulated Claude Code interface
- **Capstone (Module 9):** one client case, Northwind Parcel, delivered end to end in seven steps by developers, ops, QA and engineering leads. The starter is `starters/fde-capstone` (messy data, a legacy report with hidden defects, a mentor answer key). The lesson also compares it with public FDE programmes (Product School, Maven, Xebia); their figures were taken from their own pages on 2026-11-24 and are linked, not copied.
- **Journey tree:** the Journey page shows every step in order, what is done, and where you are now.
- **Start here page:** three starting levels (new, uses AI assistants, already uses Claude Code) so nobody has to guess where to begin. Each lesson opens with a one sentence "In short" summary, and the path shows honest time estimates.
- **Glossary:** every term used in the lessons, searchable, in plain language.
- **Starter projects:** `starters/shop-app` (five seeded bugs, used by Modules 2, 4 and 6, with `BUG_REPORTS.md` for learners and `ANSWERS.md` as the answer key) and `starters/task-tracker` (a small layered API to explore and plan a feature on, used by Module 3). Both have no dependencies, and each assignment links to its folder on GitHub.
- **Mentor summary:** every assignment can copy a short progress summary to paste to a mentor.
- **Accounts:** sign in with Google to save progress to your account and continue on any device. There are no passwords. Guests keep working with browser-only saving, and guest progress is merged into the account on first sign-in.
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
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | for sign in | From a Google Cloud OAuth client of type Web application. See "Google sign in" below. |
| `APP_URL` | for sign in | Public address, for example `https://claude-code-academy.onrender.com`. Locally `http://localhost:5173`. |
| `ALLOWED_EMAIL_DOMAINS` | recommended | Comma separated, for example `concret.io`. Empty allows any Google account. |
| `ADMIN_EMAILS` | no | Comma separated emails that can open the **Cohort** page (`#/admin`) and download progress as CSV. Empty means nobody. |
| `PGSSL` | no | `disable` if your Postgres has no TLS |

See `.env.example`.

## Google sign in

1. Google Cloud Console, then APIs and Services, then Credentials, then Create credentials, then OAuth client ID, type **Web application**. If asked, set up the consent screen as **Internal** so only your Workspace can sign in.
2. Add these **Authorised redirect URIs** (one per environment you use):
   - `http://localhost:5173/api/auth/google/callback` for local development
   - `https://claude-code-academy.onrender.com/api/auth/google/callback` for production
3. Put the Client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (Render Environment tab, or `.env` locally), and set `APP_URL` to the same address as the redirect URI without the path.
4. Open the app, go to Sign in, and choose **Continue with Google**.

**People who already had a password account:** the first time they sign in with Google using the same email, that account is claimed and all their progress is kept. After that the account is tied to that Google identity.

## Checks

```
npm run typecheck     # app and server
npm run test:api      # Google sign in flow (against a fake Google), progress merge, admin access, origin check
npm run check:links   # every resource link, YouTube authors included; CI also runs it every Monday
```

GitHub Actions (`.github/workflows/ci.yml`) runs these plus the starter project tests on every push.

**Day 1 proof:** the Module 2 assignment (`m2-a1`) requires pasted evidence of a real Claude Code session. Modules 3 and later show a banner and the "Continue" button points to it until it is done.

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
3. In the service Environment tab, set `DATABASE_URL` to the Neon pooled connection string, plus `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `ADMIN_EMAILS`. `JWT_SECRET` is generated for you and `APP_URL` is set in `render.yaml`.
4. Check `https://<your-service>/api/health`: it should report `"storage":"postgres"`.

Notes: free Render web services sleep when idle, so use a paid plan for anything long lived.

## Deploy on Vercel

1. Use the same Neon database and copy its pooled connection string.
2. Import the repo in Vercel. Build settings come from `vercel.json`.
3. Add environment variables `JWT_SECRET`, `DATABASE_URL`, `ALLOWED_EMAIL_DOMAINS`.
4. Deploy, then open `/api/health` to confirm `"storage":"postgres"`.

The API runs as one serverless function (`api/index.ts`); `/api/*` is rewritten to it in `vercel.json`. Do not deploy to Vercel without `DATABASE_URL`: its filesystem is ephemeral.

## Security notes

- **Sign in is Google only** (OpenID Connect, authorization code flow with PKCE, state and nonce). The server checks the ID token signature, audience, issuer and nonce, requires a verified email, and enforces `ALLOWED_EMAIL_DOMAINS` itself, so the domain hint sent to Google is not what protects you. Each account is bound to one Google identity, so a different Google account with the same email is refused. There are no passwords to store, reset or leak, and the old password endpoints no longer exist.
- Sessions are signed, HttpOnly, SameSite=Lax cookies (Secure in production); state changing requests are same-origin checked; sign in is rate limited per server instance.
- Old password hashes in the database are left in place and unused. They can be removed later with `UPDATE academy_users SET password_hash = NULL`.
- Progress is stored in Neon as readable data. If you need it encrypted at rest, see the `feat/sso-rbac` branch (encryption and roles), which is not part of this change.

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
