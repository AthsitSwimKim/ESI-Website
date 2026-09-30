# AGENTS.md — ESI Website

Instructions for any AI coding agent working in this repository. This is the tool-agnostic
entry point; `CLAUDE.md` points here so there is only one copy to keep current.

---

## The project

Corporate website redesign for **Engineering System Integration Co., Ltd. (ESI)** — an
industrial communication and system-integration company in Rayong, Thailand. The site is an
online company profile: Home, About, Solutions (+6 detail pages), Industries, Projects
(+detail), Contact, 404. English first, with a TH/EN switch.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · motion ·
lucide-react · oxlint · Prettier · Vitest · Playwright.

**Hard constraint — do not design around it:** this is a **frontend-only static site**. No
backend, API, database, auth, login, CMS, admin panel or file upload, ever. `npm run build`
produces a static `dist/` that is uploaded to any host. If a request implies a server, say so
and offer the static alternative (`mailto:`, an embed, or static data).

## Read these before changing anything

Everything below is committed to the repo — plain Markdown, images and TypeScript. The
`.claude/` folder name is only a location; the files are not Claude-specific and any tool can
read them.

| When you need…                                                                         | Read                                                                                                                                                |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Where the project stands, what is next, past decisions**                             | `PLAN.md` — phase checklists and the decision table **D1–D26**. Start here, and tick boxes / add decisions as you finish work.                      |
| How anything should **look** — tokens, components, every section, motion, responsive   | `.claude/skills/esi-website/references/design-spec.md` plus the matching `assets/mockup-*.jpg` crop. **Open the image**: the mockup outranks prose. |
| Any **copy or data** — company info, services, industries, projects, SEO, Thai strings | `.claude/skills/esi-website/references/content.md`. Never invent content; unapproved drafts are marked ✏️.                                          |
| Stack, folder layout, routes, types, i18n, SEO, deployment                             | `.claude/skills/esi-website/references/architecture.md`                                                                                             |
| The client's original requirements, verbatim (Thai/English), incl. Definition of Done  | `.claude/skills/esi-website/references/spec-source.md`                                                                                              |
| Commands, how to add a project or service, deploy targets, image sizes                 | `README.md`                                                                                                                                         |
| Task workflow, stack pitfalls, verification checklist                                  | `.claude/skills/esi-website/SKILL.md`                                                                                                               |

**When sources conflict:** mockup (visual) > design-spec > spec-source (content/structure) >
content.md drafts. `PLAN.md` § "ประเด็นที่ตัดสินใจแล้ว" records how known conflicts were
already resolved — check it before re-litigating one.

## Conventions

- **Content lives in `src/data/*.ts`**, never hardcoded in JSX. UI strings go through `t()`,
  with entries in both `src/i18n/en.ts` and `src/i18n/th.ts` (Thai falls back to English).
- **Colours only from the `@theme` tokens** in `src/styles/index.css` (`esi-blue`, `esi-navy`,
  `esi-accent`, `esi-light`, `esi-muted`, `esi-border`). No raw hex in components.
- Section titles are Kanit, **bold italic uppercase**, left-aligned with the 40×3 bar.
- Adding a project or a service is a **data edit**, not a code change — the nav, footer,
  overview pages, filters, detail pages and sitemap all derive from those files. Keep it that way.
- Keep non-component exports out of component files — oxlint's `only-export-components` rule
  is on. Helpers go in `src/lib/` (see `src/lib/pagination.ts`).

## Verifying your work

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Then, with `npm run dev` running:

```bash
npm run audit
```

`npm run audit` drives the system Chrome over every route and fails on accessibility violations
(axe, WCAG 2 A/AA), missing SEO tags, horizontal overflow at 375/768/1024/1440, broken images or
links, and console errors. **It must stay clean.** `npm run screenshot -- /projects 1440,375`
takes full-page screenshots for visual review.

Current baseline, to not regress: audit clean across all routes; Lighthouse mobile
Performance 89–92 · Accessibility 100 · Best Practices 100 · SEO 100.

## Stack pitfalls that have already cost time

- **Tailwind v4:** `translate-*` and `scale-*` compile to the individual `translate` / `scale`
  CSS properties, so `transition-[transform,…]` will **not** animate them. Name `translate`
  explicitly, or use plain `transition-transform`.
- **motion:** `<AnimatePresence initial={false}>` silently disables the children's entrance
  animation. Every content block is supposed to have motion — see design-spec §6.
- **React 19** hoists `<title>` and `<meta>` natively (the `Seo` component); do not add a
  helmet library, and do not duplicate per-page tags in `index.html` — that produces conflicting
  duplicates that the audit will flag.
- **Windows / Git Bash:** heredocs over roughly 8 KB get truncated — write larger files with the
  editor tool or a script file instead.

## Git workflow

- **Do not create branches unprompted** — the owner decides. When asked: `git switch -c
feat/<name>` from `main`, commit there, merge back with a merge commit (`merge.ff=false` is
  set) and push both, so the graph shows the line.
- **Commit and push only when asked.**
- **Commit messages are written in Thai** (English technical terms are fine): a descriptive
  subject line plus a short body explaining the why, e.g.
  `เพิ่มหน้า Solutions และ template รายละเอียด 6 หน้า (Phase 5)`.

## Talking to the owner

The owner writes in Thai. **Reply in Thai, keeping English technical terms** (component names,
props, commands). Before building anything visual, they generally want to see a rendered mockup
or screenshot first rather than a description.

## Known external issues (not caused by this repo)

- The **old site `esi-th.com` is compromised** — every WordPress post contains obfuscated
  JavaScript that opens `ushort.observer`. Only plain text and images were extracted from it,
  with all `<script>` stripped. ESI has been told to clean it up and rotate credentials (D23).
- **ESI's Google Business profile shows the wrong street.** This site is correct
  (Chanthaudom Road, Choengnoen); ESI must fix it on Google's side (D24).
- Some project photos were hot-linked by the old site from other companies' websites. The
  client authorised reusing them and each is credited in `src/data/projects.ts`, but
  **copyright still belongs to the source** — replace them with ESI's own photos when available (D25).
