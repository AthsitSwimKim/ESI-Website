# ESI Website

Corporate website for **Engineering System Integration Co., Ltd. (ESI)**, Rayong — a
frontend-only static site (no backend, database, CMS or login).

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · motion · lucide-react

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

## Check & build

```bash
npm run typecheck    # tsc
npm run lint         # oxlint
npm run format       # prettier
npm run build        # → dist/  (static, upload to any host — see SPA rewrite notes below)
npm run preview      # serve dist/ locally
```

## Project layout

```
src/
├── components/   layout (Header, Footer, CtaBand, RootLayout) · ui · cards · sections
├── pages/        one component per route
├── data/         ALL site content (company, services, industries, projects, …)
├── i18n/         TH / EN UI strings and the language switch
├── routes/       React Router configuration
├── styles/       index.css — Tailwind v4 @theme design tokens
└── types/        TypeScript interfaces
public/images/    photos (placeholders in public/images/placeholders/)
```

## Editing content (no code changes needed)

- **Add a project:** append an object to `src/data/projects.ts` and put its image in
  `public/images/projects/`. It appears in the grid, filters and detail page automatically.
- **Add / edit a solution:** `src/data/services.ts` — the header menu, footer and overview
  page derive from this file.
- **Company details:** `src/data/company.ts`. **Thai UI strings:** `src/i18n/th.ts`.

Comments `// DRAFT – ESI to approve` and `// to confirm` mark copy that still needs sign-off.

## Deploying (SPA)

`npm run build` outputs `dist/`. Because routes are client-side, the host must serve
`index.html` for unknown paths: Netlify/Cloudflare → `_redirects` (`/* /index.html 200`),
Vercel → `vercel.json` rewrites, Apache → `.htaccess` rewrite, Nginx → `try_files $uri /index.html`.
The matching file is added in Phase 8 once the host is chosen.

## Branching & Git graph

Work never lands on `main` directly — every phase/feature gets its own branch and comes back
through a merge commit, so the history shows real branch lines:

```bash
git switch -c feat/phase-5-solutions     # branch from main (feat/…, fix/…, chore/…)
# …commits…
git switch main
git merge feat/phase-5-solutions         # merge.ff=false → always a merge commit (visible line)
git push
```

View the graph in the terminal (`git graph` / `git lg` aliases are set for this repo) or in
VS Code with the recommended **Git Graph** extension (`.vscode/extensions.json`). Run
`git fetch --all` first to see everyone's remote branches.

## For contributors using Claude Code

Project skill: `.claude/skills/esi-website/` (design spec, content, architecture).
Plan and status: `PLAN.md`.
