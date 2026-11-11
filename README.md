# ESI Website

Corporate website for **Engineering System Integration Co., Ltd. (ESI)**, Rayong — industrial
communication and system integration. The public website builds to static files. The local
Admin editor has PHP/MySQL authentication and an optional complete Chaiyo production package.
Project content uses a private file repository; authentication and audit use MySQL.
The owner installs the Hosting package and private config separately.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · Motion · lucide-react

---

## Quick start

```bash
npm install
npm run dev:setup    # first time on Windows x64: portable PHP + MariaDB, verified ZIPs
npm run dev          # http://localhost:5173
```

## Scripts

| Command                                            | What it does                                                                                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                                      | Starts loopback-only PHP/MariaDB authentication and Vite with hot reload                                                                                                                                                             |
| `npm run dev:setup`                                | Downloads official, checksum-verified portable PHP/MariaDB into the ignored local tools directory                                                                                                                                    |
| `npm run dev:auth`                                 | Starts only the private PHP/MariaDB authentication service                                                                                                                                                                           |
| `npm run dev:frontend`                             | Starts only Vite; Admin fails closed if its PHP service is unavailable                                                                                                                                                               |
| `npm run test:auth`                                | PHP security unit checks and actual HTTP/PDO checks in an isolated local database                                                                                                                                                    |
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
The editor redirects to `/admin/login` before showing private data. The Dev account is
`esi_dev_admin`; its generated password is in `.esi-admin/dev/dev-admin-credentials.txt`.
This is separate from the `esi_admin` account on Hosting. The editor API checks the live PHP
session, account status/role and CSRF on every write; it accepts requests from the local machine.
The page is excluded from public
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
up to 10 additional photos and is hidden when empty. **Add project** opens a blank form.

Drafts are stored in `.esi-admin/workspace.json`. Published changes are stored in
`src/data/projectContent.json` and overlaid on the original project references. Image uploads
are stored as files in the project. Keep these files together when backing up the workspace.
`npm run build` creates a static `dist/` with the published project pages and sitemap.
The editor runs with Vite locally, and updating hosting requires uploading a new build.
PHP authentication uses a separate local MariaDB database. Project drafts/uploads/publishing
still use the local data files described above; migrating project storage into MySQL is a later
step. See [`database/dev-auth.md`](database/dev-auth.md) for private configuration and startup.

## Admin database preparation

The owner approved creating the planned Admin schema in Chaiyo's `esithcom_website`
database on 2026-11-06. It has 10 InnoDB/utf8mb4 tables and 15 foreign keys, including
separate draft/published versions and tables for application users and sessions.
The bilingual transaction smoke test passed and rolled back all fixture data.

See [`database/README.md`](database/README.md) for the schema, verification SQL and API
requirements. The first application Admin account `esi_admin` was created on 2026-11-06;
its private credentials are in the gitignored `.esi-admin/initial-admin-credentials.txt`.
PHP Login/Logout and session protection are now implemented in Dev against a separate local
database and account. The complete Chaiyo package now includes production PHP authentication,
project CRUD/uploads/publication and SQL audit (D59). The owner uploads the package and private
config; this does not automatically deploy changes to Hosting.

The owner also approved connecting Dev authentication to Chaiyo on 2026-11-10 (D57).
An explicit Chaiyo profile and read-only connection check are separate from the local database
initializer. The owner enters the MySQL password in a private ignored config. The existing
endpoint uses an explicitly selected legacy transport without TLS; verified TLS is a separate
mode with no automatic downgrade. Activation follows a successful connection check.
The connection is verified: Dev login/logout with `esi_admin` succeeded and a revoked test
session was confirmed in Chaiyo. Project records/photos still use the local file repository.
See [`database/chaiyo-connection.md`](database/chaiyo-connection.md) for commands and the
private settings. Plain `npm run dev` and audit continue to select the local database.

## Admin audit log

Open `/admin/audit-logs` with an `admin` account to inspect real authentication and project
events. Filter by action, result, actor and Bangkok date range; pagination runs in SQL with
25 rows per page. Events use the selected Local/Chaiyo profile. Project writes keep a durable
private outbox and retry without duplicating events. Logs begin when this feature is enabled;
the app does not invent historical records or expose an edit/delete-log endpoint.
See [`database/audit-log.md`](database/audit-log.md) for scope, privacy and recovery behavior.

## Website visitor count

For Chaiyo Hosting, run `npm run build:chaiyo` and use **`ESI-Chaiyo-Hosting.zip`**, which includes
`httpdocs/` and the sibling private `.esi-admin-production/`. Extract at the domain directory
that contains `httpdocs`, then upload the separately prepared private config. **Uploading only
`dist/` omits the Admin backend.** See [`database/chaiyo-production.md`](database/chaiyo-production.md)
for exact placement, PHP 8.1+ requirements and verification. `npm run test:production` tests the
extracted ZIP using disposable local SQL and production HTTPS cookies. It models Apache routing
with a test-only router; actual Hosting rewrite/PHP settings still need checking after upload.

The first public visit creates `.esi-visitor-count/` beside `httpdocs`
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
`npm run audit` reports zero accessibility violations across all 23 audited routes.

## For AI coding agents

Start with [`AGENTS.md`](AGENTS.md) — the single set of project instructions (constraints,
sources of truth, conventions, verification, git workflow). `CLAUDE.md` points to the same file.

Reference material lives in `.claude/skills/esi-website/`: the design spec, content,
architecture notes and the approved mockup crops. Plan, phase checklists and the decision
log (D1–D26) are in [`PLAN.md`](PLAN.md).
