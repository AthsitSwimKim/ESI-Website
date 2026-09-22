---
name: esi-website
description: Project skill for the ESI corporate website (Engineering System Integration Co., Ltd., Rayong) — a frontend-only React 19 + TypeScript + Vite + Tailwind v4 static site whose look must match the approved homepage mockup (ESI blue, italic uppercase display type, angular/diagonal details, industrial photography). Use this skill for ANY work in this repo — building or editing pages, sections, components, header/footer, styling, colours, fonts, animation, static data (projects/services/industries), the TH/EN switch, SEO, images, responsive fixes, build or deployment — even for a small tweak, because every change must stay consistent with the brand spec, the mockup and the phase plan in PLAN.md.
---

# ESI Website

Corporate website redesign for **Engineering System Integration Co., Ltd. (ESI)** — an
industrial communication & system-integration company in Rayong, Thailand. The site is an
online company profile: Home, About, Solutions (6 detail pages), Industries, Projects (+ detail),
Contact, 404. English first, with a TH/EN switch.

**Hard constraints (spec §1, §7):** frontend only. No backend, API, database, auth, login,
CMS, admin, or file upload. Content lives in `src/data/*.ts`; `npm run build` produces a
static `dist/` that is uploaded to any host. If a request implies a server, say so and offer
the static alternative (mailto, embed, static data).

## Sources of truth (read in this order, only what the task needs)

| When you need… | Read |
|---|---|
| Where the project is, what is next, open decisions | `PLAN.md` at the repo root (phase checklists — update it as you finish tasks) |
| How anything should **look** (tokens, components, every section, motion, responsive) | `references/design-spec.md` + the matching `assets/mockup-*.jpg` crop (open the image — the mockup outranks prose) |
| Any **copy or data** (company info, services, industries, projects, process, CTA, SEO, Thai strings) | `references/content.md` — never invent content; drafts are marked ✏️ |
| Stack, folder layout, routes, types, i18n, SEO, deployment, verification commands | `references/architecture.md` |
| The client's original requirements, verbatim (Thai/English), incl. Definition of Done | `references/spec-source.md` |
| Logo files (blue / white, transparent) | `assets/esi-logo.png`, `assets/esi-logo-white.png` → copy to `src/assets/logo/` |

Priority when they conflict: mockup (visual) > design-spec > spec-source (content/structure) >
content.md drafts. `PLAN.md` § "decisions" records how known conflicts were resolved (e.g. the
mockup footer's address/phone/email differ from the spec's Contact table — the spec wins).

## Workflow for a task

1. **Locate the task in `PLAN.md`.** Work in phase order unless the user asks otherwise; a
   section built before its shared components exist (Button, SectionTitle, Container,
   Reveal, DiagonalLines, NetworkGraphic) gets rebuilt later — do the foundations first.
2. **Open the reference for the exact section** you are building: the design-spec subsection
   *and* its mockup crop. Build from the mockup's proportions, not from memory of "a corporate site".
3. **Put content in data files, not JSX.** Sections read from `src/data/*`; UI strings go
   through `t()` (see architecture § i18n). This is how ESI adds projects/services later
   without touching components (spec §50–51).
4. **Implement with the shared primitives** (`Button`, `SectionTitle`, `Container`, `Reveal`,
   `PageHero`, cards). If a primitive is missing, add it in `components/ui` or `cards` rather
   than styling inline — the mockup's consistency comes from reuse.
5. **Verify** — `npm run typecheck && npm run lint && npm run build`, then run the dev server in
   the browser tool: no console errors, side-by-side with the mockup crop, at 375 / 768 / 1024 /
   1440 widths, keyboard through any interactive element you touched.
6. **Update `PLAN.md`** checkboxes (and the decisions/content-needed tables if you resolved or
   discovered something), then summarise what changed and what is still open.

## Non-negotiables

- **Brand tokens only.** Colours come from the `@theme` tokens (`esi-blue`, `esi-navy`,
  `esi-secondary`, `esi-accent`, `esi-light`, `esi-text`, `esi-muted`, `esi-border`, white).
  No new hues, no arbitrary hex in components. Tints are tokens at an opacity.
- **Display type is Kanit, bold, italic, uppercase** for h1/h2/CTA lines, left-aligned with the
  40×3 bar. Body is Inter (+ Noto Sans Thai). An upright or centred section title is a bug.
- **Angular details, small and at corners**: slanted logo panel, `DiagonalLines` at section
  corners, card bottom bars, chevron buttons, faint `NetworkGraphic`. Never big slanted
  backgrounds, blobs, glass, or radii above 6px.
- **Photography is industrial** (plants, terminals, control rooms, switchgear, hazardous-area
  CCTV) with a navy overlay under any text. Placeholders are the navy SVGs in
  `public/images/placeholders/` — never hotlink stock images.
- **Motion is precise**: `motion` (`motion/react`) with the shared `fadeUp`/`stagger` variants,
  transform/opacity only, 200–600ms, viewport-once reveals, `useReducedMotion` respected.
  No spring, bounce, parallax or looping decoration beyond the slow hero zoom and node pulse.
- **Semantic, accessible HTML**: `header/nav/main/section/article/footer`, real buttons and
  links, alt text, focus rings, `aria-current`/`aria-pressed`, contrast ≥ 4.5:1, keyboard-
  operable menus and filters.
- **Static data integrity**: unique kebab-case slugs, `categories` limited to the six
  `ProjectCategory` values, image paths that exist under `public/images/`, `featured` 3–6
  projects. Don't add fictional projects or certifications — only ESI-supplied references.
- **Routes** exactly as spec §9; unknown `:slug` renders the 404 page; every page renders
  `<Seo>` first; CTA band on every page except Contact and 404.

## Stack reminders (details in architecture.md)

React 19 · TypeScript strict · Vite · Tailwind **v4** (`@tailwindcss/vite`, `@theme` in
`src/styles/index.css`, no `tailwind.config.js`) · `react-router-dom` v7
(`createBrowserRouter`, lazy pages) · `motion` (Framer Motion's current package) ·
`lucide-react` (56px / strokeWidth 1.25 for card icons; social marks as inline SVG) ·
React 19 native `<title>/<meta>` hoisting for SEO (no Helmet) · CSS scroll-snap (no Swiper).

Pitfalls seen with this stack: forgetting the SPA rewrite on Apache/Nginx/Netlify (deep links
404 after deploy); using `framer-motion` and `motion` together; Tailwind v3 syntax
(`tailwind.config.js`, `@tailwind base`) with v4; `esi-accent` used as body text on white
(fails contrast); centred titles; hero text without overlay; hardcoding the solutions list in
the nav instead of deriving it from `services.ts`; a Button's own `inline-flex` overriding a
`hidden sm:…` you pass in `className` (wrap it instead); writing files with shell heredocs while
`npm run dev` runs on Windows (Vite may cache the empty file — use the Write tool, then `touch`
or restart the server if the page goes blank).

## Talking to the user

The user writes Thai; reply in Thai with English technical terms (as the spec does). When a
request would break the spec (e.g. "add a login"), say what the spec says, offer the
frontend-only alternative, and proceed only on their decision. When content is missing
(photos, Thai copy, project references, social URLs, real address confirmation), build with
clearly marked placeholders/drafts and list them under "content needed" in `PLAN.md` rather
than blocking.
