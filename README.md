# ESI Website

Corporate website for **Engineering System Integration Co., Ltd. (ESI)**, Rayong — industrial
communication and system integration. A **frontend-only static site**: no backend, database,
CMS or login. All content lives in typed data files, so adding a project or service is a data
edit, not a code change.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · Motion · lucide-react

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Command                                            | What it does                                                                                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                                      | Dev server with hot reload                                                                                                                                                                                                           |
| `npm run build`                                    | Regenerates the sitemap, typechecks, then builds to `dist/`                                                                                                                                                                          |
| `npm run preview`                                  | Serves the production build locally (port 4173)                                                                                                                                                                                      |
| `npm run typecheck`                                | TypeScript, all projects (app + tests)                                                                                                                                                                                               |
| `npm run lint`                                     | oxlint                                                                                                                                                                                                                               |
| `npm run format`                                   | Prettier (incl. Tailwind class sorting)                                                                                                                                                                                              |
| `npm test`                                         | Vitest — data integrity (slugs, categories, image files exist …)                                                                                                                                                                     |
| `npm run audit`                                    | Full QA sweep of every route: accessibility (axe WCAG 2 A/AA), SEO tags, horizontal overflow at 375/768/1024/1440, broken images and links, console errors. Needs the dev server (or `BASE_URL=http://localhost:4173` for the build) |
| `npm run screenshot -- /projects 1440,375 ./shots` | Full-page screenshots via the system Chrome — used for visual review                                                                                                                                                                 |
| `npm run sitemap`                                  | Regenerates `public/sitemap.xml` + `robots.txt` (runs inside `build`)                                                                                                                                                                |

Before pushing anything: `npm run typecheck && npm run lint && npm test && npm run build`.

## Editing content — no code required

| What                      | Where                                                                                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Add a project**         | Append an object to `src/data/projects.ts` (give it the next `id`, a kebab-case `slug`) and drop its photo in `public/images/projects/`. It appears in the grid, the filters, its own detail page, related projects and the sitemap automatically. |
| **Add / edit a solution** | `src/data/services.ts` — the header dropdown, mobile menu, footer, overview page and solution detail page all derive from this file.                                                                                                               |
| **Company details**       | `src/data/company.ts` (address, phone, email, social, map embed). One edit updates the footer, Contact page and SEO.                                                                                                                               |
| **Home / page copy**      | `src/data/home.ts`, `src/data/about.ts`, `src/data/pages.ts`, `src/data/industries.ts`                                                                                                                                                             |
| **Thai UI strings**       | `src/i18n/th.ts` (missing keys fall back to English)                                                                                                                                                                                               |
| **Colours / fonts**       | `src/styles/index.css` — the `@theme` block is the single source of design tokens                                                                                                                                                                  |

Comments `// DRAFT – ESI to approve` and `// to confirm` mark copy and values that still need
ESI's sign-off. `npm test` catches broken slugs, unknown categories and missing image files.

### Image sizes

hero 1920×1080 · page hero 1920×640 · project card 1200×800 (3:2) · industry 800×600 ·
about 1200×900 · OG cover 1200×630. Export WebP, keep hero images under ~350 KB.

## Project layout

```
src/
├── components/
│   ├── layout/    Header, SolutionsMenu, MobileMenu, Footer, CtaBand, RootLayout, ScrollToTop
│   ├── ui/        Button, Container, SectionTitle, PageHero, Breadcrumb, FilterTabs, EmptyState,
│   │              DiagonalLines, NetworkGraphic, Reveal, Seo, Icon, Chip, LangSwitch …
│   ├── cards/     SolutionCard, IndustryCard, ProjectCard, FeatureItem
│   └── sections/  home/* (7 home sections) · shared/* (IndustryShowcase, SolutionFeatures,
│                  RelatedProjects, ContactInfo, MapEmbed)
├── pages/         one component per route
├── data/          ALL site content + data.test.ts
├── i18n/          TH / EN strings and the language switch
├── routes/        React Router configuration (lazy pages, 404 via loaders)
├── styles/        index.css — Tailwind v4 @theme design tokens
└── types/         TypeScript interfaces
public/images/     photos (navy SVG placeholders in public/images/placeholders/)
scripts/           sitemap.mjs · audit.mjs · screenshot.mjs
```

## Deploying

`npm run build` produces a static `dist/` — upload it anywhere. Because routes are client-side,
the host must serve `index.html` for unknown paths. The config for each option is already in the
repo:

| Host                       | File                 | Notes                                                                                      |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| Netlify / Cloudflare Pages | `public/_redirects`  | Copied into `dist/` automatically. Build command `npm run build`, publish directory `dist` |
| Vercel                     | `vercel.json`        | Rewrites + cache headers                                                                   |
| Apache / shared hosting    | `public/.htaccess`   | Copied into `dist/`. Needs `mod_rewrite`; upload the contents of `dist/` to the web root   |
| Nginx                      | `nginx.conf.example` | Copy the `server` block into your site config                                              |

Hosting under a sub-path (e.g. `example.com/esi/`)? Set `base: '/esi/'` in `vite.config.ts` and
pass the same value as `basename` to `createBrowserRouter` in `src/routes/index.tsx`.

**Before the first deploy:** confirm `siteUrl` in `src/data/company.ts` — canonical URLs, the
sitemap and Open Graph tags are all built from it.

## Local project editor

Run `npm run dev`, then open `/admin` directly on the localhost URL printed by Vite.
The editor API accepts requests from the local machine. The page is excluded from public
navigation and the sitemap and carries `noindex, nofollow, noarchive`.

**Website visitors** reads the same cumulative total as the footer on `esi-th.com`.
The local editor proxies a read-only GET to the hosting counter to avoid browser CORS issues.
The card refreshes when opened, when the window regains focus and every minute. Local browsing
and opening the admin page do not add visits. If hosting cannot be reached, the card shows an
unavailable state instead of substituting the old local total in `.esi-admin/traffic.json`.

- **Save draft** saves to the workspace on disk and shows a confirmation. You can reopen
  the draft from another browser on this machine or after restarting Vite.
- **Save & preview** saves and opens the draft using the same layout as a project detail page.
- **Publish** saves your changes and opens the regular project page. The project also
  appears on the local `/projects` list. For an existing published project, visitors see
  the previously published version while you edit a draft.
- **Unpublish** removes the project from the local public pages and keeps it in the editor.
  **Delete project** removes it from both after confirmation.

Choose a JPG, PNG or WebP from your device for the main photo. The optional gallery supports
up to 10 additional photos and is hidden when empty. **Fill sample project** loads a labelled
example with bilingual scope and two gallery images.

Drafts are stored in `.esi-admin/workspace.json`. Published changes are stored in
`src/data/projectContent.json` and overlaid on the original project references. Image uploads
are stored as files in the project. Keep these files together when backing up the workspace.
`npm run build` creates a static `dist/` with the published project pages and sitemap.
The editor runs with Vite locally, and updating hosting requires uploading a new build.

## Website visitor count

For Chaiyo Hosting, run `npm run build:chaiyo` and upload the contents of `dist/` to `httpdocs`
on the PHP-enabled domain. The first public visit creates `.esi-visitor-count/` beside `httpdocs`
and increments the total from zero. PHP needs write access to that private directory and permission
to access it under the domain's `open_basedir` setting. Preserve it across deployments and backups.

The counter counts a given IP address and browser user agent once per day in Thailand and filters
common bot signatures. It stores the total and hashes for the latest counted day. The footer reads
the total through PHP. GET returns only the total without writing files or counting a visitor;
POST records a public visit. Upload the updated `visitor-count.php` for the admin's read-only
lookup to work. The standard `npm run build` is the static build and shows `000000`.

## Quality gates

Current state of the production build (Lighthouse mobile): **Performance 89–92 · Accessibility
100 · Best Practices 100 · SEO 100**, above the project targets of 85/90/90/90.
`npm run audit` reports zero accessibility violations across all 16 routes.

## For AI coding agents

Start with [`AGENTS.md`](AGENTS.md) — the single set of project instructions (constraints,
sources of truth, conventions, verification, git workflow). `CLAUDE.md` points to the same file.

Reference material lives in `.claude/skills/esi-website/`: the design spec, content,
architecture notes and the approved mockup crops. Plan, phase checklists and the decision
log (D1–D26) are in [`PLAN.md`](PLAN.md).
