# ESI Website — Architecture & Conventions

Frontend-only static site. There is **no backend, database, auth, CMS, admin, or upload** —
if a task seems to need one, it is out of scope (spec §7); solve it with static data, a
`mailto:` link, an embed, or an external service the user explicitly approves.

## 1. Stack (use current stable versions — do not pin to old majors)

| Concern | Choice | Notes |
|---|---|---|
| Framework | React 19 + TypeScript (strict) | `npm create vite@latest . -- --template react-ts` |
| Build | Vite | `@` alias → `src/` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | CSS-first config with `@theme` in `src/styles/index.css`; **no** `tailwind.config.js`, no `postcss.config` |
| Routing | `react-router-dom` v7 (declarative `createBrowserRouter` + `RouterProvider`) | The spec names "React Router DOM"; v7 re-exports `react-router`. |
| Animation | `motion` (the current package name of Framer Motion) | `import { motion, useReducedMotion, AnimatePresence } from 'motion/react'` |
| Icons | `lucide-react` | social brand marks as inline SVG (Lucide brand icons are deprecated) |
| Fonts | Google Fonts: Kanit (display), Inter + Noto Sans Thai (body) | `<link rel="preconnect">` + one stylesheet link in `index.html`; self-host in Phase 8 if Lighthouse flags it |
| SEO | React 19 native `<title>` / `<meta>` / `<link>` hoisting via a `<Seo>` component | replaces the optional React Helmet Async — no extra dependency |
| Carousel | none — CSS `scroll-snap` | replaces the optional Swiper |
| Lint/format | **oxlint** (what create-vite 9 ships instead of ESLint; config `.oxlintrc.json`) + Prettier with `prettier-plugin-tailwindcss` | keep defaults; no custom rule wars |
| Tests | **Vitest** — data integrity only (`src/data/data.test.ts`, `npm test`) | unique slugs/ids, kebab-case, valid categories/industries/icons, image files exist, featured 3–6, related excludes self |

Installed on 2026-09-22 (Phase 1): React 19.3 · Vite 8.3 · TypeScript 6.0 · Tailwind 4.3 ·
react-router-dom 7.18 · motion 13.4 · lucide-react 1.47 · oxlint 1.85 · Node 22 / npm 10.

Install (already done — for reference / a fresh clone use `npm install`):

```bash
npm create vite@latest . -- --template react-ts   # scaffold in an empty dir, then copy in
npm i react-router-dom motion lucide-react
npm i -D tailwindcss @tailwindcss/vite prettier prettier-plugin-tailwindcss
```

`package.json` scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `typecheck`
(`tsc -b --noEmit`), `lint` (`oxlint`), `format` / `format:check` (Prettier), `test` / `test:watch`
(Vitest), `screenshot` (visual QA).
TypeScript 6 notes: `strict` is on; `erasableSyntaxOnly` forbids `enum`/namespaces (use
`as const` unions — see `src/types`); `baseUrl` is deprecated, so the alias is
`"paths": { "@/*": ["./src/*"] }` alone.

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  // base: '/subfolder/'  ← only if hosted under a sub-path
});
```

`tsconfig.app.json` → `"paths": { "@/*": ["./src/*"] }` (no `baseUrl` — deprecated in TS 6).

`src/styles/index.css` (tokens come from `design-spec.md` §1):

```css
@import "tailwindcss";

@theme {
  --color-esi-blue: #123B72;
  --color-esi-navy: #061D38;
  --color-esi-secondary: #1D65B7;
  --color-esi-accent: #358FE8;
  --color-esi-light: #F5F8FC;
  --color-esi-text: #172033;
  --color-esi-muted: #5B6577;
  --color-esi-border: #DCE4EF;
  --font-display: "Kanit", "Inter", system-ui, sans-serif;
  --font-sans: "Inter", "Noto Sans Thai", system-ui, sans-serif;
  --shadow-card: 0 6px 20px rgba(6, 29, 56, 0.08);
  --shadow-card-hover: 0 14px 32px rgba(6, 29, 56, 0.14);
  --shadow-header: 0 4px 20px rgba(6, 29, 56, 0.10);
}

@layer base {
  html { scroll-behavior: smooth; }
  body { @apply font-sans text-esi-text bg-white antialiased; }
  :focus-visible { @apply outline-none ring-2 ring-esi-accent ring-offset-2; }
}

@utility clip-slant-right { clip-path: polygon(0 0, 100% 0, calc(100% - 28px) 100%, 0 100%); }
@utility clip-slant-img { clip-path: polygon(0 0, 100% 0, 96% 100%, 0 100%); }
@utility display-title { @apply font-display font-bold italic uppercase; }
```

Usage: `bg-esi-blue`, `text-esi-navy`, `border-esi-border`, `font-display`, `shadow-card`.

## 2. Folder structure (spec §39, refined)

```
esi-website/
├── public/
│   ├── images/{hero,about,solutions,industries,projects,placeholders}/
│   ├── favicon.svg  og-cover.jpg  robots.txt  sitemap.xml
│   └── _redirects            (Netlify SPA rewrite — see §9)
├── src/
│   ├── assets/logo/          esi-logo.png, esi-logo-white.png (copied from the skill assets)
│   ├── components/
│   │   ├── layout/           Header, SolutionsMenu, MobileMenu, NavUnderline, navStyles.ts, Footer, CtaBand,
│   │   │                     RootLayout, ScrollToTop                                   (Phase 2 ✅)
│   │   ├── ui/               Button, Container, SectionTitle, PageHero, Breadcrumb, DiagonalLines, NetworkGraphic,
│   │   │                     Reveal/RevealItem, LangSwitch, Seo, SocialIcon, Icon, Chip  (Phase 2 ✅)
│   │   │                     FilterTabs, EmptyState                                     (Phase 6 ✅)
│   │   ├── cards/            SolutionCard, IndustryCard, ProjectCard, FeatureItem
│   │   └── sections/
│   │       ├── home/         HeroSection, SolutionsSection, AboutSection, IndustriesSection,
│   │       │                 FeaturedProjectsSection, WhyEsiSection, ProcessSection
│   │       └── shared/       IndustryShowcase, SolutionFeatures, RelatedProjects   (Phases 4–6 ✅)
│   │                             ContactInfo, MapEmbed                             (Phase 7)
│   ├── pages/                HomePage, AboutPage, SolutionsPage, SolutionDetailPage, IndustriesPage,
│   │                         ProjectsPage, ProjectDetailPage, ContactPage, NotFoundPage
│   │                         (PageStub.tsx is Phase-1 scaffolding — delete when no page imports it)
│   ├── data/                 company (incl. map coords/embedUrl), navigation, services, industries, projects (+ data.test.ts), process,
│   │                         about (aboutFeatures, whyEsi, aboutPage), home (hero, homeSections, ctaBand),
│   │                         pages (pageHeroes, notFound), seo, icons (iconMap)
│   ├── types/                index.ts (all interfaces + PROJECT_CATEGORIES / INDUSTRY_SLUGS consts)
│   ├── hooks/                useScrolled, useLockBodyScroll, useMediaQuery
│   ├── i18n/                 context.ts (LangContext, TKey), LangProvider.tsx, en.ts, th.ts, useT.ts, index.ts
│   ├── lib/                  motion.ts (fadeUp, fadeIn, scaleIn, stagger, viewportOnce), utils.ts (cn, localize, getPath, storage), social.ts
│   ├── routes/               index.tsx (router)
│   ├── styles/index.css
│   ├── App.tsx  main.tsx
├── scripts/screenshot.mjs    (visual QA — see §12)
├── index.html  package.json  tsconfig*.json (app/node/test)  vite.config.ts  vitest.config.ts
├── .oxlintrc.json  .prettierrc  .gitattributes  README.md
```

Content lives in `src/data/*.ts`; the `// DRAFT – ESI to approve` and `// to confirm` comments
mark copy/values that still need ESI's sign-off (mirrors ✏️ in content.md).

Rules: one component per file, named export matching the file; `pages/` compose `sections/`;
`sections/` read from `data/`; `cards/` are pure presentational (props in, JSX out).
**No content strings in JSX** except trivial UI chrome that goes through `t()`.

## 3. Routes (spec §9)

| Path | Page | Notes |
|---|---|---|
| `/` | HomePage | |
| `/about` | AboutPage | |
| `/solutions` | SolutionsPage | overview |
| `/solutions/:slug` | SolutionDetailPage | one template, data from `services.ts`; unknown slug → NotFound |
| `/industries` | IndustriesPage | anchors `#oil-gas` … |
| `/projects` | ProjectsPage | `?category=` filter in the URL |
| `/projects/:slug` | ProjectDetailPage | unknown slug → NotFound |
| `/contact` | ContactPage | no CTA band |
| `*` | NotFoundPage | `<title>404 | ESI</title>` |

```tsx
// src/routes/index.tsx (implemented in Phase 1)
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootLayout errorBoundary />,   // 404 renders INSIDE the normal layout
    HydrateFallback: PageSkeleton,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', lazy: () => import('@/pages/AboutPage').then(m => ({ Component: m.AboutPage })) },
      { path: 'solutions/:slug', loader: requireService, lazy: … },   // unknown slug → throw 404 Response
      { path: 'contact', handle: { hideCta: true }, lazy: … },
      { path: '*', loader: notFound },                                 // any unknown path → 404
    ],
  },
])
```

**404 pattern:** detail routes have a tiny `loader` that throws `new Response('Not Found',
{ status: 404 })` when the slug is unknown; the root `errorElement` re-renders `RootLayout`
in `errorBoundary` mode, which shows `NotFoundPage` (or a generic error) inside the header/
footer and hides the CTA band. Page components therefore never need their own "not found"
branch. Routes that must not show the CTA band declare `handle: { hideCta: true }`
(`RootLayout` reads it via `useMatches()`).

`RootLayout` = skip-link → `<ScrollToTop/> <Header/> <main id="main"><Suspense><Outlet/></Suspense></main> {!hideCta && <CtaBand/>} <Footer/>`.

## 4. Data model (`src/types/index.ts`)

```ts
export type Lang = 'en' | 'th';
export type Localized = { en: string; th?: string };          // th falls back to en
export type ProjectCategory = 'network' | 'cctv' | 'access-control' | 'communication' | 'cybersecurity' | 'maintenance';
export type IndustrySlug = 'oil-gas' | 'petrochemical' | 'power-energy' | 'manufacturing' | 'industrial-infrastructure';
export type IconName = keyof typeof iconMap;                    // from data/icons.ts

export interface Project {            // spec §29, extended
  id: number;
  slug: string;
  title: string;
  client: string;
  categories: ProjectCategory[];
  industry: IndustrySlug;
  location: string;
  image: string;                      // '/images/projects/<slug>.webp'
  description: string;
  scope?: string[];
  gallery?: string[];
  featured?: boolean;                 // shown on Home (3–6)
  year?: number;
}

export interface Service {
  slug: string;                       // route segment
  name: Localized;
  tagline: Localized;
  description: Localized;
  icon: IconName;
  features: Localized[];
  image: string;
  category?: ProjectCategory;         // only if a historical project category matches
  industries: IndustrySlug[];
  brandIds: string[];                 // ids from profileAssets.ts
  sourceSlide: number;                // slide 5–11 in the supplied Company Profile
  gallery: { src: string; width: number; height: number; caption: Localized }[];
}

export interface Industry { slug: IndustrySlug; name: Localized; description: Localized; scope: string[]; icon: IconName; image: string; }
export interface ProcessStep { step: number; name: Localized; description: Localized; icon: IconName; }
export interface Feature { title: Localized; description: Localized; icon: IconName; }
export interface NavItem { label: string /* t() key */; to: string; children?: NavItem[]; }
export interface Company { name: string; shortName: string; tagline: Localized; description: Localized; address: string; addressLines: string[]; phone: string; phoneHref: string; email: string; hours: Localized; social: { linkedin?: string; facebook?: string; youtube?: string }; certifications: { name: string; image: string }[]; siteUrl: string; }
```

Data helpers live next to the data (`src/data/projects.ts`): `getProjectBySlug`,
`getFeaturedProjects`, `getProjectsByCategory`, `getRelatedProjects(project, n = 3)`
(same category first, then same industry, never itself); `src/data/services.ts`:
`getServiceBySlug`, `getAdjacentServices`. Keep them pure and synchronous — no fetching.

Adding a project (spec §50) = append one object to `projects.ts` + drop the image in
`public/images/projects/`. Adding a service (§51) = one object in `services.ts` + a nav entry
is derived automatically from `services` (never duplicate the list in `navigation.ts`).

## 5. i18n (TH / EN switch, spec §11)

Lightweight, no library:

- `LangProvider` holds `lang` (default `'en'`, persisted in `localStorage['esi-lang']` via the
  guarded `storage` helper), sets `document.documentElement.lang`, exposes `setLang`.
- `useT()` returns `t(key)` typed against `en.ts` dotted keys (`TKey`; `th.ts` is
  `DeepPartial<Dictionary>`, missing keys fall back to English), `l(value: Localized | string)`
  for data fields, and `label(navLabelKey)` which also resolves the `service:<slug>` keys that
  `navigation.ts` generates from `services.ts`.
- UI chrome (nav, buttons, labels, footer headings, filter names, empty states) always goes
  through `t()`. Long-form content uses `Localized` fields with EN fallback.
- Section titles remain English in both languages (brand typography) unless ESI asks otherwise.

## 6. SEO (spec §44)

```tsx
export function Seo({ title, description, path, image = '/og-cover.jpg', type = 'website' }: SeoProps) {
  const url = company.siteUrl + path;
  return (<>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={url} />
    <meta property="og:type" content={type} /><meta property="og:title" content={title} />
    <meta property="og:description" content={description} /><meta property="og:url" content={url} />
    <meta property="og:image" content={company.siteUrl + image} />
    <meta name="twitter:card" content="summary_large_image" />
  </>);
}
```

React 19 hoists these into `<head>` from anywhere in the tree. Every page renders `<Seo>` first.
`public/robots.txt` + `public/sitemap.xml` are **generated** by `scripts/sitemap.mjs` (reads the
slugs straight out of `src/data/services.ts` and `projects.ts` and the `siteUrl` from
`company.ts`); it runs as the first step of `npm run build`, so the sitemap can never drift from
the data. `index.html` also carries static `og:*` fallbacks for crawlers that don't run JS —
`<Seo>` overrides them per page. Social preview image: `public/og-cover.jpg` (1200×630). Semantic landmarks:
`header > nav`, `main`, `section` (each with an `aria-labelledby` pointing to its h2),
`article` for cards/detail bodies, `footer`.

## 7. Accessibility (spec §45–46)

Alt text on every image (decorative → `alt=""`), keyboard-operable header/menu/dropdown/filters,
visible focus ring (`esi-accent`), real `<button>`/`<a>`, `aria-current="page"` on the active nav
link, `aria-pressed` on toggles, colour contrast ≥ 4.5:1 (white on `esi-blue` and `esi-navy`
passes; `esi-muted` on white passes; `esi-accent` on white does **not** for body text — use it
only for decoration/large text), `prefers-reduced-motion` respected, text resizes without
overflow at 200%.

## 8. Performance & images (spec §43, §47)

- Route-level code splitting (lazy pages), one font stylesheet, no runtime CSS-in-JS.
- Images: WebP (AVIF optional), sized: hero 1920×1080 ≤ 350 KB, page heroes 1920×640, industries
  800×600, project cards 1200×800, gallery 1600×1200, about 1200×900, OG 1200×630. Always set
  `width`/`height` (or aspect-ratio classes) to avoid CLS; `loading="lazy"` everywhere except the
  hero (`fetchpriority="high"`, preload in `index.html`).
- Until real photos arrive, use `public/images/placeholders/*.svg` (navy gradient + subtle
  network lines + label) — never external stock URLs in committed code.
- Targets (Lighthouse, mobile): Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.

## 9. Deployment (spec §52)

`npm run build` → `dist/` — upload as-is. SPA fallbacks (a deep link like `/projects/x` must
serve `index.html`):

- Netlify: `public/_redirects` → `/*  /index.html  200`
- Vercel: `vercel.json` → `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Cloudflare Pages: same `_redirects` file works.
- Apache: `public/.htaccess` with `RewriteEngine On` / `RewriteCond %{REQUEST_FILENAME} !-f` /
  `RewriteRule ^ index.html [L]`.
- Nginx: `location / { try_files $uri $uri/ /index.html; }`.
- Sub-path hosting → set `base` in `vite.config.ts` and use `<BrowserRouter basename>`/`createBrowserRouter(routes, { basename })`.
- Cache: hashed assets immutable (1y), `index.html` no-cache.

## 10. Dev-server gotcha (Windows)

Writing a file with a shell heredoc (`cat > file <<EOF`) while `npm run dev` is running can make
Vite cache the *empty* file (it reads at truncation time and the watcher misses the final write)
— the browser then shows "does not provide an export named …" or a blank page. Write files with
the Write tool / Python instead, and if it happens, `touch` the file or restart the dev server.

## 11. Tests

`npm test` (Vitest, `vitest.config.ts`) runs `src/data/*.test.ts`. Test files are excluded from
`tsconfig.app.json` and typechecked by their own `tsconfig.test.json` (node + vitest types), so
`npm run typecheck` covers them without pulling node types into the app bundle. These tests are
the safety net for hand-edited data — run them after touching anything in `src/data/`.

## 12. Visual QA screenshots (Phase 3+)

`npm run screenshot -- <path> <widths> [outDir]` (`scripts/screenshot.mjs`, Playwright package
driving the **system Chrome/Edge** — no browser download) saves full-page PNGs of the running
dev server, scrolling slowly first so viewport reveals have fired. From Git Bash prefix with
`MSYS_NO_PATHCONV=1` so `/` is not turned into a Windows path. Open the PNGs with the Read tool
(crop tall pages into ~1000px strips with Pillow first). The Browser pane's own screenshots are
too small/stale for layout checks when the pane is narrow or hidden — use this instead.

Lighthouse: `npm run build && npx vite preview --port 4173`, then
`CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx lighthouse http://localhost:4173/ --output=json --form-factor=mobile --chrome-flags="--headless=new"`.
Baseline after Phase 3: 86 / 100 / 100 / 92.

## 13. Verification before calling anything done

```bash
npm run typecheck && npm run lint && npm run build
```

Then run `npm run dev`, open the page in the browser tool, and check: no console errors,
compare the section against its mockup crop, resize to 375 / 768 / 1024 / 1440, tab through
the header and menu with the keyboard, and (Phase 8) run Lighthouse via `npm run preview`.
