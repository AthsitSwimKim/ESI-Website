# ESI Website — Design Spec (derived from the approved homepage mockup)

This is the source of truth for how the site **looks**. Where this text and the mockup
disagree, the mockup wins; where the mockup and the project spec (`spec-source.md`)
disagree on *content or structure*, the spec wins. Before implementing any section, open
the matching crop with the Read tool — a picture beats prose:

| Asset | What it shows |
|---|---|
| `../assets/homepage-mockup.png` | Full homepage (1086×1448) — overall rhythm and proportions |
| `../assets/mockup-header-hero.jpg` | Header + Hero |
| `../assets/mockup-solutions.jpg` | "Our Solutions" card row + diagonal corner decorations |
| `../assets/mockup-about.jpg` | About ESI split layout with 2×2 feature grid |
| `../assets/mockup-industries-projects.jpg` | Industry image cards + horizontal project cards |
| `../assets/mockup-process-cta.jpg` | Horizontal process timeline + navy CTA band |
| `../assets/mockup-footer.jpg` | 4-column navy footer |
| `../assets/esi-logo.png` / `esi-logo-white.png` | Logo, transparent background (blue / white) |

The mockup is vertically compressed (it is a thumbnail of a long page). Use the **heights and
spacing given here**, not pixel-measured ones from the image — the proportions, alignment,
colours and hierarchy are what must match.

---

## 1. Design tokens

### Colours (Tailwind v4 `@theme` names)

| Token | Hex | Where it is used |
|---|---|---|
| `esi-blue` | `#123B72` | Primary brand. Section titles (h2), filled buttons, links, icons on light surfaces, industry label bars, title underline bars, active nav |
| `esi-navy` | `#061D38` | Hero overlay base, footer, CTA band, dark headings on white |
| `esi-secondary` | `#1D65B7` | Gradient partner for navy surfaces, primary-button hover |
| `esi-accent` | `#358FE8` | Hover borders, focus rings, network-graphic lines/nodes, highlight bars |
| `esi-light` | `#F5F8FC` | Alternating section backgrounds, About text panel, icon tiles |
| `esi-text` | `#172033` | Body text |
| `esi-muted` | `#5B6577` | Descriptions, captions, breadcrumb (derived — not in the spec; keep it the only grey) |
| `esi-border` | `#DCE4EF` | Card borders, dividers, dotted timeline (derived) |
| `white` | `#FFFFFF` | Header, cards, text on dark |

Do not introduce other hues. Tints are these colours at an opacity (`bg-esi-navy/85`, `text-white/75`).

Gradients (define once as CSS custom properties / utilities):

```css
/* Hero overlay – solid navy on the left, photo shows through on the right */
--gradient-hero: linear-gradient(90deg, #061D38 0%, rgba(6,29,56,.88) 38%, rgba(6,29,56,.45) 68%, rgba(6,29,56,.20) 100%);
--gradient-hero-bottom: linear-gradient(180deg, transparent 70%, rgba(6,29,56,.55) 100%);
/* Dark surfaces (CTA band, Why ESI, page heroes) */
--gradient-dark: linear-gradient(100deg, #061D38 0%, #0C2D5E 55%, #123B72 100%);
```

### Typography

Fonts (Google Fonts; self-host later if needed):

- **Display — `Kanit`** (Latin + Thai in one family, has true italics). Used for h1/h2/CTA lines,
  always **bold + italic + uppercase**. The forward slant echoes the italic ESI logo — this is
  the single most recognisable typographic trait of the mockup, so never render a section
  title upright.
- **Body — `Inter`, with `Noto Sans Thai` as the Thai fallback**. Regular 400 / medium 500 / semibold 600.

| Role | Font | Size (desktop → mobile) | Weight / style | Colour |
|---|---|---|---|---|
| Hero h1 | display | `clamp(2.25rem, 4.2vw, 3.75rem)` (36–60px), line-height 1.05 | 800 italic uppercase | white |
| Page-hero h1 | display | `clamp(2rem, 3.2vw, 2.75rem)` | 800 italic uppercase | white |
| Section title h2 | display | `clamp(1.375rem, 2vw, 1.75rem)` (22–28px) | 700 italic uppercase | `esi-blue` (white on dark) |
| CTA band line 2 | display | `clamp(1.5rem, 2.6vw, 2.25rem)` | 800 italic uppercase | white |
| CTA band line 1 / eyebrow | body | 14–16px, tracking `.04em` | 500 italic uppercase | white/85 |
| Card title h3 | body | 16–17px | 600–700 | `esi-blue` (project) / `esi-navy` (solution) |
| Body | body | 16px / 1.6 | 400 | `esi-text` |
| Description | body | 14–15px / 1.6 | 400 | `esi-muted` |
| Nav link | body | 15px | 500 | `esi-navy`, active/hover `esi-blue` |
| Button | body | 15px (sm 14px) | 600 | — |
| Label / eyebrow | body | 13px, tracking `.08em` | 600 uppercase | `esi-accent` or `esi-muted` |

### Spacing, radius, elevation

- Container: `max-w-[1280px]`, padding `px-5` (mobile) → `px-8` (≥1024). Mockup content spans ~93% of the viewport, so the container should feel wide.
- Section padding: `py-20` (80px) desktop, `py-14` (56px) mobile. Section title margin-bottom 32–40px.
- Grid gaps: 24px cards, 20px industry cards.
- Radius: buttons **4px**, solution/project/feature cards **4px**, industry cards **0** (sharp), icon circles full. Nothing larger than 6px anywhere — big radii read as "generic SaaS", not industrial.
- Shadows: card `0 6px 20px rgba(6,29,56,.08)`; card hover `0 14px 32px rgba(6,29,56,.14)`; scrolled header `0 4px 20px rgba(6,29,56,.10)`.
- Borders: cards `1px esi-border`; hover `esi-accent`.

### Breakpoints (from spec)

| Name | Range | Tailwind |
|---|---|---|
| Mobile | < 640 | default |
| Tablet | 640–1023 | `sm:` / `md:` |
| Laptop | 1024–1439 | `lg:` / `xl:` (1280) |
| Large desktop | ≥ 1440 | `2xl:` (1536 in Tailwind — add a custom 1440 breakpoint only if a layout actually needs it) |

---

## 2. Signature "angular" elements

The logo's italic, forward-leaning letterforms are the brand. The mockup repeats that slant
as small, disciplined decorations — never as loud backgrounds. Build these once as
components/utilities and reuse them:

1. **Logo panel (header)** — the logo sits in a white parallelogram whose right edge is
   slanted, with a 2px `esi-blue` stroke along that slanted edge.
   `clip-path: polygon(0 0, 100% 0, calc(100% - 28px) 100%, 0 100%)`; draw the stroke with a
   rotated pseudo-element (≈ −20°) or an inline SVG line.
2. **`<DiagonalLines>`** — 3–4 parallel 2px lines at 45°, 60–90px long, `esi-blue` (or
   `white/40` on dark). Placed at section *corners* only: Solutions (bottom-left and
   bottom-right), Industries (bottom-left), Process (bottom-right), CTA band (bottom-right),
   page heroes (top-right). Implement as one SVG with `direction` and `tone` props.
3. **Section title bar** — 40×3px `esi-blue` bar under every h2 (left-aligned; `esi-accent` on
   dark sections).
4. **Card bottom bar** — solution cards end with a centred 40×3px `esi-blue` bar that grows to
   64px and turns `esi-accent` on hover. This *is* the "link" affordance on the home cards.
5. **Buttons** — 4px radius and a `ChevronRight` icon that translates +4px on hover (the spec's
   "arrow movement"). Every CTA carries the chevron.
6. **`<NetworkGraphic>`** — an SVG "constellation": 25–40 nodes (r 2–3) joined by thin lines,
   stroke `esi-accent`, overall opacity .25–.4. Used in the hero (right half), the CTA band
   (centre-right), Why-ESI section and footer (very faint, .12). Nodes pulse opacity slowly
   (4–6s) — subtle, never distracting; disabled under reduced motion.
7. **Slanted image mask** (optional, inner pages) — `clip-path: polygon(0 0, 100% 0, 96% 100%, 0 100%)`
   for the About image or page-hero photos. The home mockup uses straight edges; use the
   mask sparingly and only when it does not crop important image content.

---

## 3. Global components

### Header (`components/layout/Header.tsx`)

- Sticky top, `h-20` (80px); once scrolled ≥ 12px: `h-[68px]` + scrolled shadow, 250ms
  transition. **Solid white in both states** — the spec's "white + backdrop blur" was tried and
  rejected by the client (D21): the translucent header read as grey over the navy hero and made
  the solid-white logo panel look like a box. At rest: 1px `esi-border` bottom.
  (The spec allows a transparent hero header, but the mockup shows white — follow the mockup.)
- Left: logo panel (element 1 above), logo image `h-10` (`esi-logo.png`), links to `/`. The panel
  ends **flush with the header's bottom border** — the mockup lets it dip a few px into the hero,
  but with a centred 1280px container on wide screens that reads as a floating white block
  (client feedback 2026-09-22), so only the slanted stroke carries the angular cue.
- Centre (≥1024): nav `gap-10`; items `text-[15px] font-medium text-esi-navy`; hover `text-esi-blue`;
  active item `text-esi-blue` plus a 2px `esi-blue` bar 6px under the text (bar animates width 0→100%).
  Order: Home, About, Solutions, Industries, Projects — **no Contact link** in the header: the
  `Contact ESI` button beside it is the contact affordance (client decision D19; the mockup
  shows both). Use `headerNav` from `navigation.ts`; the footer's Quick Links keep Contact.
- **Solutions dropdown** (desktop): opens on hover *and* focus/click; white panel, 1px border,
  4px radius, shadow, 12px padding, 2 columns × 3 items; each item = 20px icon + name, hover
  `bg-esi-light`. Keyboard: Escape closes, arrow keys move.
- Right: `Contact ESI` primary button (sm) with chevron, then the language switch
  `TH | EN` — 13px semibold, inactive `esi-muted`, active `esi-navy`, 1px `esi-border`
  separator; `role="group"`, `aria-pressed` on the active button.
- Mobile (<1024): logo + hamburger (`Menu`/`X`, 44×44 tap target, `aria-expanded`). Drawer
  slides in from the right (max-w 320px, full height, white), navy/50 overlay behind. Contains:
  nav list from `headerNav` (18px/500, 52px rows), Solutions as an accordion (chevron rotates
  90°, sub-items 16px indented), full-width `Contact ESI` button (this is the drawer's contact
  link — D19), language switch. Locks body scroll, traps
  focus, closes on route change and Escape.

### Footer (`components/layout/Footer.tsx`)

- `bg-esi-navy` with a faint `<NetworkGraphic>` on the right (opacity .12). `pt-14 pb-6`, white text.
- Grid ≥1024: `[1.4fr_1.2fr_1fr_1fr]`, columns separated by 1px `white/12` left borders with
  40px inner padding; 2 columns on tablet; single column on mobile.
- Col 1: `esi-logo-white.png` `h-12`; company name 15px/700; tagline 14px `white/75` max-w 30ch;
  social row (LinkedIn, Facebook, YouTube — inline SVGs, not Lucide brand icons) as 40px
  circles with 1.5px `white/70` border; hover fills white with `esi-navy` icon. Hide icons
  whose URL is empty.
- Col 2 `CONTACT US`: 14px/700 uppercase heading (tracking .06em); rows with 18px icons
  (`Phone`, `Mail`, `MapPin`) and `tel:` / `mailto:` links; multi-line address.
- Col 3 `QUICK LINKS`: two-column list of the main nav (14px `white/85`, hover white + underline offset 4px).
- Col 4 `SOLUTIONS`: the six solution links (the spec requires solution links in the footer).
- Certifications: the mockup shows ISO badges but the spec does not mention any. Render a
  badge row above the copyright bar **only** if `company.certifications` has real entries —
  never ship placeholder certificates.
- Bottom bar: `border-t white/12 mt-10 pt-5`, copyright 13px `white/60` right-aligned
  (centred on mobile): `© {currentYear} Engineering System Integration Co., Ltd. All rights reserved.`
- No calendar, search widget, or "Powered by" text.

### CTA band (`components/layout/CtaBand.tsx`)

- `--gradient-dark` background, `py-12` (mobile `py-10`), `<NetworkGraphic>` centre-right (.35),
  `<DiagonalLines tone="light">` bottom-right.
- Row: left text block — line 1 (eyebrow style, italic) `HAVE AN INDUSTRIAL SYSTEM CHALLENGE?`,
  line 2 (display) `LET'S ENGINEER THE RIGHT SOLUTION TOGETHER.`; right — `Contact ESI` button,
  variant `light` (white bg, `esi-navy` text, hover `esi-light`). Stacks with a full-width
  button below 768px.
- Rendered by the root layout above the footer on every page except Contact and 404.

### Page hero (`components/ui/PageHero.tsx`) — inner pages

- `min-h-[280px]` (mobile 220px); background photo per page (industrial), overlay
  `--gradient-dark` at ~.85 opacity, `<NetworkGraphic>` .25, `<DiagonalLines tone="light">` top-right.
- Content bottom-aligned inside the container: `<Breadcrumb>` (13px, `white/70`, chevron
  separators, current page white) → h1 (page-hero display style) → optional lead paragraph
  16–18px `white/85`, max-w 60ch.

### Buttons (`components/ui/Button.tsx`)

`inline-flex items-center gap-2 h-12 px-6 rounded-[4px] text-[15px] font-semibold transition
duration-200` (`size="sm"`: `h-10 px-[18px] text-sm`). Focus: `focus-visible:ring-2
ring-esi-accent ring-offset-2`. Always render a real `<button>` or `<Link>`/`<a>` (`to` / `href`
prop decides) — never a div with an onClick. Default trailing icon: `ChevronRight` 18px that
moves `translate-x-1` on hover.

| Variant | Style | Hover |
|---|---|---|
| `primary` | `bg-esi-blue text-white` | `bg-esi-secondary` |
| `outline-light` (on dark) | `border-[1.5px] border-white text-white` | `bg-white/10` |
| `light` (on dark, solid) | `bg-white text-esi-navy` | `bg-esi-light` |
| `outline` (on light) | `border-[1.5px] border-esi-blue text-esi-blue` | `bg-esi-blue text-white` |
| `link` | `text-esi-blue text-[13px] font-semibold` + chevron | underline offset 4px |

### Section title (`components/ui/SectionTitle.tsx`)

`h2` in the display style + 40×3 bar (`mt-2.5`). Props: `eyebrow?` (13px uppercase tracking
.1em `esi-accent`, above), `subtitle?` (16px `esi-muted`, below, max-w 60ch), `align`
(`left` default — the mockup never centres a title; `center` only for the 404/empty states),
`tone` (`dark` → white text, `esi-accent` bar), `action?` (right-aligned link slot, e.g.
"View all projects ›" on the Featured Projects row).

### Icons

`lucide-react` everywhere except social brand marks. Sizes: card hero icons **56px, strokeWidth
1.25** (this thin, large stroke is what makes them look like the mockup's line illustrations);
feature icons 40px / 1.5; inline 18–20px / 2. Colour `esi-blue` on light, white on dark.

Mapping (keep in `src/data/icons.ts` so data files reference icons by name):

| Item | Lucide |
|---|---|
| Industrial Network / CCTV & Security / Access Control | `Network` / `Cctv` / `DoorClosed` |
| Communication System / Cybersecurity / Maintenance & Support | `RadioTower` / `ShieldCheck` / `Wrench` |
| Oil & Gas / Petrochemical / Power & Energy / Manufacturing / Industrial Infrastructure | `Droplet` / `Hexagon` / `Zap` / `Factory` / `Building2` |
| About: Reliability / Expertise / Integration / Lifecycle | `Award` / `HardHat` / `Workflow` / `Headset` |
| Process 1–6 | `MessagesSquare` / `DraftingCompass` / `Package` / `Wrench` / `CircleCheck` / `Headset` |
| Why ESI 1–6 | `Factory` / `HardHat` / `ShieldCheck` / `Workflow` / `LifeBuoy` / `BadgeCheck` |
| UI | `ChevronRight`, `ArrowUpRight`, `Menu`, `X`, `Phone`, `Mail`, `MapPin`, `Clock` |

---

## 4. Home page — section by section

Order (spec §13): Hero → Solutions → About ESI → Industries → Featured Projects → Why ESI →
Process → CTA → Footer. Background rhythm: navy → light → white/light split → white → light →
navy (Why ESI) → white → navy (CTA) → navy (footer).

### 4.1 Hero (`sections/home/HeroSection.tsx`)

- Height `min-h-[clamp(520px,72vh,720px)]`; mobile `min-h-[480px]`. Full-bleed.
- Background: industrial photo (petrochemical plant at dusk in the mockup), `object-cover`,
  focal point right-centre, wrapped in a layer that scales 1 → 1.08 over ~20s ease-out once on
  mount (the spec's "slow background zoom"). Above it: `--gradient-hero` then
  `--gradient-hero-bottom`; `<NetworkGraphic>` covering the right ~55% at opacity .35; a single
  thin diagonal line decoration top-left (white/30).
- Content: container, `max-w-[640px]`, vertically centred. `h1` on three lines —
  `ENGINEERING THE / CONNECTION THAT / INDUSTRY RELIES ON.` (use `<br className="hidden md:block">`;
  natural wrap on mobile). Sub-line 18–20px/400 `white/90`, `mt-5`:
  `Reliable Industrial Communication & System Integration Solutions.`
  Buttons `mt-8 gap-4`: `Explore Solutions` (primary → `/solutions`), `View Projects`
  (outline-light → `/projects`); stacked full-width below 640px.
- Entrance: h1 fade + slide-up (y 24→0, 600ms, delay 100ms), sub-line delay 250ms, buttons 400ms.
- Bottom edge: 1px line `esi-accent/40`.

### 4.2 Our Solutions (`sections/home/SolutionsSection.tsx`)

- `bg-esi-light`; `<DiagonalLines>` bottom-left and (mirrored) bottom-right; title `OUR SOLUTIONS`.
- Grid: 6 columns ≥1280, 3 columns 640–1279, 1 column below 640 (spec: one card per row on
  mobile). Gap 24.
- **Home card** (matches mockup): white, 1px border, 4px radius, card shadow, `py-7 px-4`,
  centred, `min-h-[200px]`; icon 56/1.25 `esi-blue`; name 16px/600 `esi-navy` `mt-4` (may wrap
  to 2 lines: "Industrial / Network"); bottom bar (element 4) `mt-4`. The whole card is a
  `<Link to="/solutions/<slug>">` with an `aria-label`.
- Hover (250ms): `-translate-y-1.5`, border `esi-accent`, hover shadow, icon `scale-110`, bar
  widens + `esi-accent`.
- Reveal: stagger 80ms fade-up when 25% in view.
- The `/solutions` overview page uses the *rich* variant of the same card: adds a 2-line
  description (14px muted) and a `Learn more ›` link row — see §5.

### 4.3 About ESI (`sections/home/AboutSection.tsx`)

- Two equal columns, no gap, `bg-esi-light` on the text side, white outside.
- Left: photo bleeds to the viewport's left edge (engineer at control-room consoles in the
  mockup — ESI branding on helmet/uniform), `object-cover`, fills the column height
  (≈ 4:3 at desktop). Optional slanted right edge (element 7) — only if the photo tolerates it.
- Right: `px-14 py-16` (mobile `px-5 py-12`); title `ABOUT ESI`; paragraph 16px/1.7 max-w 60ch
  (copy in `content.md`); 2×2 feature grid `gap-x-8 gap-y-7`: 40px icon left, title 16px/600
  `esi-blue`, description 14px muted. Items: Reliability You Can Trust · Engineering Expertise ·
  End-to-End Integration · Lifecycle Support. Optional `Learn more about ESI ›` link below.
- Mobile: stack, image first (16:10).
- Reveal: image fade + scale .98→1; text block staggered.

### 4.4 Industries We Serve (`sections/home/IndustriesSection.tsx`)

- White; title `INDUSTRIES WE SERVE`; `<DiagonalLines>` bottom-left.
- Grid: 5 columns ≥1024 (gap 20), 3 columns 640–1023, and on mobile a horizontal
  `scroll-snap` row (card width 78vw, `snap-x snap-mandatory`, gutter padding, hidden scrollbar)
  — the spec allows "1 per row or horizontal scroll"; scroll keeps the row feeling.
- Card: overall ≈ 4:3, radius 0, overflow hidden, `<Link to="/industries#<slug>">`. Top 62% photo;
  bottom 38% label bar `bg-esi-blue` with a 28px white icon and the name in 15px/700 uppercase
  white (two lines allowed: "INDUSTRIAL / INFRASTRUCTURE").
- Hover: image `scale-[1.06]` (500ms), an `esi-blue/35` overlay fades over the image, an
  `ArrowUpRight` slides in at the label bar's right edge.

### 4.5 Featured Projects (`sections/home/FeaturedProjectsSection.tsx`)

- `bg-esi-light`; title `FEATURED PROJECTS` with the `action` slot `View all projects ›` (desktop).
- Shows `projects.filter(p => p.featured)` (3–6). Grid 3 / 2 / 1 columns, gap 24.
- **Horizontal project card** (mockup): white, border, 4px radius, card shadow, `grid-cols-[45%_1fr]`;
  image `object-cover` full height (`min-h-[220px]`); body `p-6`: title 17px/700 `esi-blue`
  (line-clamp 3, e.g. "Map Ta Phut / Tank Terminal – / CCTV Explosion-Proof"), description
  14px muted `mt-2` (line-clamp 3), `View Project ›` link variant pinned to the bottom (`mt-auto`).
  Optional 12px chips for industry/category above the title.
- Below 640px the card becomes vertical (image on top, 16:10).
- Hover: `-translate-y-1`, hover shadow, image `scale-[1.04]`, chevron `translate-x-1`.

### 4.6 Why Partner With ESI (`sections/home/WhyEsiSection.tsx`) — spec §31, not in mockup

- Dark section: `--gradient-dark`, faint `<NetworkGraphic>`, title (`tone="dark"`)
  `WHY PARTNER WITH ESI`, optional subtitle.
- 3×2 grid (2 columns tablet, 1 mobile), gap 24. Item: `bg-white/5 border border-white/10`
  4px radius `p-6`; 48px icon tile `bg-white/10` with 26px `esi-accent` icon; title 17px/600
  white; description 14px `white/75`. Hover: border `esi-accent/60`, `-translate-y-1`.
- Six items (copy in `content.md`): Industrial Experience · Engineering Expertise · Reliable
  Solutions · End-to-End Integration · Long-Term Support · Professional Service.

### 4.7 Our Process (`sections/home/ProcessSection.tsx`)

- White; title `OUR PROCESS`, subtitle `From concept to reliable operation.` (the spec's
  heading, kept as the subtitle so both texts appear); `<DiagonalLines>` bottom-right.
- Desktop ≥1024 — horizontal timeline, 6 equal columns: a 2px **dotted** `esi-border` line at
  icon-centre height spanning the row; between columns a 16px `ChevronRight` in `esi-accent`
  sitting on the line; each step: 72px white circle with 2px `esi-blue` border (bg white so
  the line is hidden behind it) containing a 30px/1.5 `esi-blue` icon; label `1. CONSULT`
  15px/700 uppercase `esi-navy` `mt-5`; description 14px muted, 2 lines, centred.
- Below 1024 — vertical timeline: 56px circles on a left rail with a dotted vertical line;
  label + description to the right; 32px between steps.
- Animation when in view: the line draws (`scaleX` 0→1, 900ms, origin left), then steps
  stagger 120ms fade-up.

### 4.8 CTA band — see §3.

---

## 5. Inner pages

Every inner page = `<Seo>` + `<PageHero>` + sections + (CTA band + footer from the layout).

- **About** (`/about`): PageHero ("About ESI", lead) → Company Introduction (2-col: text +
  photo with slanted mask) → Company Overview (stats strip optional — only real numbers) →
  Expertise (6 solution cards, rich variant) → Mission / Vision (2 cards on `esi-light`, icon +
  title + text) → Core Values (4-column icon grid) → Why ESI (dark section, reused) →
  Industries Served (industry cards, reused) → CTA.
- **Solutions overview** (`/solutions`): PageHero → intro paragraph → 3×2 grid of **rich**
  solution cards (icon, name, 2-line description, `Learn more ›`) → Process section (reused) → CTA.
- **Solution detail** (`/solutions/:slug`, one template): PageHero (solution name, breadcrumb
  Home › Solutions › Name) → Overview (2-col: description + image, slanted mask) → "What we
  deliver": the feature list as a 3-column checklist grid (`CircleCheck` 20px `esi-blue` +
  16px text, `esi-light` tiles 4px radius) → Industries served (chips `bg-esi-light text-esi-blue`
  13px uppercase) → Related Projects (`getProjectsByCategory`, up to 3 horizontal cards; hide the
  block if none) → prev/next solution links → CTA. Unknown slug → 404.
- **Industries** (`/industries`): PageHero → for each industry an alternating 2-column block
  (photo / text with `id=<slug>` anchor): name as h2 (display style), description, "Typical
  scope" chips from spec §25, `See related projects ›` → CTA.
- **Projects** (`/projects`): PageHero → filter tabs (All, Network, CCTV, Access Control,
  Communication, Cybersecurity, Maintenance): pill buttons 14px/600, active `bg-esi-blue text-white`,
  inactive `bg-white border esi-border text-esi-navy` hover `border-esi-accent`; `aria-pressed`;
  filter state in the URL (`?category=cctv`) so links are shareable; horizontally scrollable on
  mobile. Grid: **vertical** project card variant — image 16:10 on top, body: chips, title,
  1-line client/location in muted, `View Project ›`; 3 / 2 / 1 columns; results animate with
  `AnimatePresence` (fade, 200ms). Empty state: centred message + "Show all projects" button.
- **Project detail** (`/projects/:slug`): PageHero using the project image (title, breadcrumb
  Home › Projects › Title) → meta strip (`bg-esi-light`, 4 cells: Client · Industry · Location ·
  Services, 13px uppercase labels + 16px/600 values) → Project Overview (description) → Scope of
  Work (checklist, if `scope`) → Solution (the related solution cards for `categories`) →
  Gallery (if `gallery`: grid 3/2/1, images 4:3, click opens a simple lightbox with keyboard
  support — or skip the lightbox if it adds a dependency) → Related Projects (same category,
  excluding self, 3 cards) → CTA. Unknown slug → 404.
- **Contact** (`/contact`): PageHero → 2-column: left card (`bg-esi-light`, 4px radius) with
  company name, address, phone (`tel:`), email (`mailto:`), business hours, each with a 20px
  icon; primary button `Email us` (`mailto:info@esi-th.com?subject=...`) and outline `Call
  038-623-000` (`tel:`); right: Google Maps `<iframe>` (embed URL built from the address, no
  API key) `min-h-[420px]`, 4px radius, `title`, `loading="lazy"`,
  `referrerPolicy="no-referrer-when-downgrade"`. Mobile: stack, card first. No CTA band on this page.
- **404** (`/*`): dark full-height section (`--gradient-dark` + network graphic), centred:
  eyebrow `404 — PAGE NOT FOUND`, display h1 `The page you are looking for may have been moved
  or no longer exists.`, `Back to Home` (light button). Returns a proper `<title>404 | ESI</title>`.

---

## 6. Motion spec

Library: `motion` (`import { motion, useReducedMotion, AnimatePresence } from 'motion/react'`).

```ts
export const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: .6, ease: [.22, 1, .36, 1] } } };
export const stagger = (delay = .08) => ({ hidden: {}, show: { transition: { staggerChildren: delay } } });
// viewport: { once: true, amount: .25, margin: '-80px' }
```

- A `<Reveal>` wrapper applies `fadeUp` + viewport-once so sections don't hand-roll it.
- **The first block under a page hero passes `immediate`** so it renders already revealed.
  Fading in content that sits in the first viewport makes the page read as empty for a few
  hundred milliseconds after a route change (client feedback 2026-09-29). Everything below
  the fold still reveals on scroll.
- Hover transitions 200–250ms ease-out; hero zoom 20s; navbar 250ms; timeline line 900ms.
- Animate only `transform` and `opacity` (no layout-shifting properties). No spring/bounce, no
  parallax, no scroll-jacking, no marquee. The brand feeling is "precise", not "playful".
- `useReducedMotion()` → transforms disabled, opacity-only fades; hero zoom and node pulse off.
- Route change: scroll to top instantly (`<ScrollToTop>`); optional 200ms page fade.

---

## 7. Responsive matrix

| Element | ≥1280 | 1024–1279 | 640–1023 | <640 |
|---|---|---|---|---|
| Header | full nav + button + lang | full nav (gap 28) | logo + hamburger | logo + hamburger |
| Hero | 520–720px, text 640px wide | same | 520px | 480px, buttons stacked full width |
| Solution cards | 6 | 3 | 3 | 1 |
| About | 50/50 split, image bleeds left | same | stacked | stacked |
| Industry cards | 5 | 5 | 3 | horizontal snap scroll |
| Project cards (home/grid) | 3 | 3 | 2 | 1 (vertical card) |
| Why ESI | 3 | 3 | 2 | 1 |
| Process | horizontal 6 | horizontal 6 | vertical | vertical |
| CTA band | row | row | row | stacked, full-width button |
| Footer | 4 columns | 4 columns | 2 columns | 1 column |

---

## 8. Do / Don't

**Do**: left-align section titles with the bar; keep italic uppercase display type; use the
diagonal decorations at corners; use thin large line icons; keep cards flat-white on light
grey; use industrial photography (plants, control rooms, switchgear, fibre, CCTV in hazardous
areas); keep text over photos on a navy overlay with ≥ 4.5:1 contrast; use `content.md` copy.

**Don't**: big radii (`rounded-xl`+), purple/teal/orange accents, glassmorphism cards, emoji
or filled-blob icons, centred-everything layouts, heavy drop shadows, hero text over an
un-overlaid photo, upright section titles, lorem ipsum in committed data, stock photos of
office handshakes, "Powered by" footers, animated gradients or floating blobs.
