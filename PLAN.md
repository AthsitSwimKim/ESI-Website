# แผนพัฒนาเว็บไซต์ ESI — Corporate Website Redesign

> **สถานะปัจจุบัน:** Phase 4 เสร็จ ✅ — หน้า About และ Industries ครบ (PageHero, anchor deep-link) · ถัดไป: **Phase 5 — Solutions**
> **อัปเดตล่าสุด:** 2026-09-22
> **Skill:** `.claude/skills/esi-website/` (โหลดอัตโนมัติเมื่อทำงานในโปรเจกต์นี้)
> **Spec ต้นฉบับ:** `.claude/skills/esi-website/references/spec-source.md` · **Mockup:** `.claude/skills/esi-website/assets/homepage-mockup.png`

---

## 1. สรุปโครงการ

| หัวข้อ | รายละเอียด |
|---|---|
| โครงการ | เว็บไซต์องค์กรใหม่ของ Engineering System Integration Co., Ltd. (ESI) จ.ระยอง |
| ประเภท | Corporate / Industrial System Integration Website — ใช้เป็น Online Company Profile |
| ขอบเขต | **Frontend only** — ไม่มี Backend, Database, Login, CMS, Admin, Upload (spec §7) |
| Stack | React 19 + TypeScript · Vite · Tailwind CSS v4 · React Router DOM v7 · motion (Framer Motion) · Lucide React |
| ข้อมูล | Static data ใน `src/data/*.ts` — เพิ่ม Project/Service โดยแก้ไฟล์ data (spec §50–51) |
| ภาษา | EN เป็นหลัก + สวิตช์ TH/EN (โครง i18n พร้อม, รอ copy ภาษาไทยจาก ESI) |
| หน้าตา | **ยึดตาม mockup หน้า Home** ทุก section แล้วขยาย design language เดียวกันไปหน้าอื่น (รายละเอียดใน `design-spec.md`) |
| หน้า | Home, About, Solutions (+6 detail), Industries, Projects (+detail), Contact, 404 — route ตาม spec §9 |
| Deploy | `npm run build` → `dist/` ขึ้น Vercel / Netlify / Cloudflare Pages / Apache / Nginx ได้ทันที |

## 2. หลักการทำงานทุก Phase

1. เริ่มงานทุกครั้ง: อ่านสถานะในไฟล์นี้ → เปิด `design-spec.md` section ที่จะทำ **พร้อมรูป mockup crop** → เปิด `content.md` สำหรับข้อความ
2. ทำตามลำดับ Phase (พื้นฐาน → global components → Home → หน้าอื่น) เพราะทุกหน้าใช้ component ร่วมกัน
3. ข้อความ/ข้อมูลทั้งหมดอยู่ใน `src/data` — ห้าม hardcode ใน JSX
4. ทุก Phase ต้องผ่าน **เกณฑ์ผ่าน** ของตัวเองก่อนไป Phase ถัดไป (typecheck + build ผ่าน, ไม่มี console error, เทียบกับ mockup แล้ว)
5. ทำเสร็จให้ติ๊ก checkbox ในไฟล์นี้ และบันทึกการตัดสินใจใหม่ ๆ ในตารางข้อ 3

## 3. ประเด็นที่ตัดสินใจแล้ว / ต้องยืนยันกับ ESI

ค่าเริ่มต้นด้านล่างจะถูกใช้ทันทีถ้าไม่มีการแก้ — ยืนยันหรือเปลี่ยนได้ทุกเมื่อ

| # | ประเด็น | ค่าเริ่มต้นที่ใช้ | สถานะ |
|---|---|---|---|
| D1 | **ข้อมูลติดต่อไม่ตรงกัน** — spec: 69/13 ถ.จันทอุดม ต.เชิงเนิน อ.เมือง ระยอง 21000 / 038-623-000 / info@esi-th.com — mockup footer: 55/9 ม.3 ต.ตาสิทธิ์ อ.ปลวกแดง 21140 / +66 (0) 38 683 615-8 / info@esi.co.th | ใช้ตาราง Contact ใน spec (§34) — **ยืนยันแล้วจากเว็บเดิม esi-th.com** (ที่อยู่/โทร/แฟกซ์ 038-623-001/อีเมล/ชื่อไทย/เลขผู้เสียภาษี 0215560000858 ตรงกัน) | ✅ ยืนยันแล้ว (2026-09-22) |
| D2 | Footer ใน mockup มี Certifications (ISO 9001 / ISO 27001) แต่ spec ไม่กล่าวถึง | ไม่ใส่จนกว่าจะได้ไฟล์ใบรับรองจริง (ห้ามใส่ badge ปลอม) — คอลัมน์ 4 ของ footer ใช้ Solutions links ตาม spec | ⏳ รอ ESI |
| D3 | Footer ใน mockup มี Blog / Careers | ไม่ทำ — ไม่อยู่ใน sitemap (spec §8) | ✅ ตัดสินใจแล้ว |
| D4 | หน้า Home ใน spec มี section "Why ESI" แต่ mockup ไม่มี | ทำตาม spec (ใส่ระหว่าง Featured Projects กับ Process) ออกแบบเป็น dark section ให้เข้ากับ mockup | ✅ ตัดสินใจแล้ว |
| D5 | TH/EN switch มีใน header แต่ spec ไม่มี copy ภาษาไทย | สร้างระบบ i18n จริง (ไม่ใช้ library) — UI strings มี TH, เนื้อหายาว fallback เป็น EN จนกว่าจะได้คำแปล; Section title คงเป็นภาษาอังกฤษ (เป็นส่วนหนึ่งของ visual identity) | ⏳ รอ copy TH |
| D6 | รูปภาพ (hero, about, industries ×5, projects, page heroes) — mockup ใช้ภาพ AI | ใช้ placeholder SVG โทน navy ก่อน แล้วเปลี่ยนเป็นภาพจริง/ภาพลิขสิทธิ์ใน Phase 8 | ⏳ รอรูปจาก ESI |
| D7 | โลโก้ต้นฉบับเป็น PNG พื้นขาว | ทำเวอร์ชันพื้นโปร่งใส (น้ำเงิน/ขาว) ไว้ใน skill assets แล้ว — ขอไฟล์ SVG/AI ต้นฉบับถ้ามี | ⏳ ขอไฟล์ vector |
| D8 | Project มีชื่อแค่ 3 โครงการ (spec ตัวอย่างใช้ `id: 15`) | **ใส่ 22 โครงการจริง** จากหน้า Site Reference ของเว็บเดิม (2017–2024) ใน `src/data/projects.ts` — ชื่อปรับเป็นรูปแบบ "ลูกค้า – ระบบ", scope ตามข้อความเดิม, สถานที่บางส่วนอนุมาน (`// to confirm`); ลูกค้าที่ไม่ใช่อุตสาหกรรม (รีสอร์ต/สำนักงาน/หน่วยงานรัฐ) จัดในหมวด Industrial Infrastructure | ✅ ได้ข้อมูลแล้ว — รอ ESI ตรวจรายละเอียด |
| D9 | Social media (LinkedIn, Facebook, YouTube) ไม่มี URL | Facebook: facebook.com/engineeringsystemintegration (จากเว็บเดิม) · LinkedIn/YouTube ยังไม่มี → ไอคอนซ่อนอัตโนมัติ | ✅ บางส่วน (2026-09-22) |
| D10 | Domain / hosting ยังไม่ระบุ | Domain จริงคือ **esi-th.com** (เว็บเดิมเป็น WordPress) → `siteUrl = https://esi-th.com`; ต้องยืนยันว่าจะ deploy ทับ domain เดิมและ hosting ที่ใช้ | ✅ domain ยืนยัน · ⏳ hosting |
| D11 | Font ไม่ระบุใน spec | Display: **Kanit** (bold italic uppercase — รองรับไทย, เอียงตามโลโก้) · Body: **Inter + Noto Sans Thai** | ✅ เสนอใช้ (เปลี่ยนได้) |
| D12 | Contact form | ไม่ทำฟอร์ม — ใช้ปุ่ม `mailto:` + `tel:` ตาม spec §35 แนะนำ (ถ้าต้องการฟอร์มจริงค่อยเพิ่ม EmailJS/Formspree ภายหลัง) | ✅ ตัดสินใจแล้ว |
| D13 | Google Maps | ใช้ iframe embed จากที่อยู่ ไม่ต้องใช้ API key | ✅ ตัดสินใจแล้ว |
| D14 | Header บน Hero | ใช้พื้นขาวตาม mockup (spec อนุญาตโปร่งใสได้ แต่ mockup เป็นสีขาว) เมื่อ scroll เพิ่ม shadow + blur | ✅ ตัดสินใจแล้ว |
| D15 | Library ที่ spec ระบุเป็น optional (Swiper, React Helmet Async) | ไม่ใช้ — ใช้ CSS scroll-snap และ React 19 native `<title>/<meta>` แทน (ลด dependency) | ✅ ตัดสินใจแล้ว |
| D16 | Linter — template create-vite 9 เปลี่ยนมาใช้ oxlint แทน ESLint | ใช้ oxlint ตาม template (`npm run lint`) + Prettier (+ tailwind plugin) สำหรับ format | ✅ ตัดสินใจแล้ว (2026-09-22) |
| D17 | การจัดการ 404 สำหรับ slug/URL ที่ไม่มี | ใช้ route `loader` โยน `Response 404` → root `errorElement` แสดง `NotFoundPage` ใน layout ปกติ (มี header/footer, ไม่มี CTA band) | ✅ ตัดสินใจแล้ว (2026-09-22) |
| D18 | Favicon — โลโก้เป็น wordmark กว้าง อ่านไม่ออกที่ 32px | ใช้ตัว **E** เอียงจากโลโก้เป็น monogram สีขาวบนพื้น ESI Blue (`public/favicon-32.png`, `icon-192.png`, `apple-touch-icon.png`) | ✅ ตัดสินใจแล้ว (2026-09-22) |
| D19 | ลิงก์ "Contact" ในเมนู header ซ้ำกับปุ่ม "Contact ESI" ที่อยู่ติดกัน | **เอาออกจาก header/เมนูมือถือ** (ใช้ `headerNav`) — ปุ่ม Contact ESI เป็นทางเข้าหน้า Contact; footer Quick Links ยังมี Contact ตามเดิม (mockup/spec มีทั้งคู่ แต่ลูกค้าตัดสินใจตัด) | ✅ ตัดสินใจแล้ว (2026-09-22) |
| D20 | Google Maps embed | ใช้พิกัดสำนักงานจริง 12.68721, 101.2745016 (จากลิงก์แผนที่ของเว็บเดิม) แทนข้อความที่อยู่ → embed แม่นยำกว่า + ลิงก์ "เปิดใน Google Maps" | ✅ ตัดสินใจแล้ว (2026-09-22) |
| D21 | Header ตอน scroll — spec ระบุ white + backdrop blur | **ขาวทึบทั้งสองสถานะ** (ลูกค้าเห็นว่าแบบโปร่ง 90% + blur ดูเป็นสีเทาบน hero และทำให้ panel โลโก้ดูเป็นกรอบ) คงเงาตอน scroll | ✅ ตัดสินใจแล้ว (2026-09-22) |

### ข้อมูลที่ต้องขอจาก ESI (content needed)

- [x] ยืนยันที่อยู่ / โทร / อีเมล (D1) — ตรงกับเว็บเดิม · Facebook ได้แล้ว (D9) — [ ] LinkedIn/YouTube ถ้ามี
- [ ] รูปภาพ: Hero (โรงงานปิโตรเคมี/Oil & Gas), About (วิศวกรในห้องควบคุม), Industries 5 ภาพ, Project แต่ละโครงการ (+gallery), page hero แต่ละหน้า
- [x] รายการ Project — ได้ 22 โครงการจากเว็บเดิม · [ ] ESI ตรวจชื่อลูกค้า/สถานที่ที่ทำเครื่องหมาย `to confirm` และส่งรูปแต่ละโครงการ
- [ ] Copy ภาษาไทย (ถ้าต้องการให้ TH แสดงเนื้อหาไทยเต็มรูปแบบ)
- [ ] ตรวจ/อนุมัติ draft copy ที่ทำเครื่องหมาย ✏️ ใน `content.md` (คำอธิบาย solution, industries, Mission/Vision/Core Values, Why ESI)
- [ ] ไฟล์โลโก้ vector (SVG/AI) ถ้ามี · ใบรับรอง (ถ้าจะแสดง) · Domain/hosting ที่จะใช้

---

## 4. แผนงานตาม Phase

ประมาณการเป็น "session" การทำงานกับ Claude (1 session ≈ งานต่อเนื่อง 1 รอบ) — เป็นค่าคร่าว ๆ

### Phase 1 — Project Foundation (≈ 1 session)

**เป้าหมาย:** โปรเจกต์รันได้ พร้อม theme, font, โครงสร้างโฟลเดอร์, โลโก้, และ data/type ครบ

- [x] `git init` + `.gitignore` (node_modules, dist)
- [x] สร้างโปรเจกต์ `npm create vite@latest . -- --template react-ts` และติดตั้ง `react-router-dom`, `motion`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`, `prettier`
- [x] ตั้งค่า `vite.config.ts` (tailwind plugin, alias `@`), `tsconfig` paths, scripts `typecheck` / `lint` / `format`
- [x] `src/styles/index.css`: `@theme` tokens สี/ฟอนต์/เงา, base styles, utilities `clip-slant-*`, `display-title` (ตาม `architecture.md` §1)
- [x] `index.html`: lang, font links (Kanit, Inter, Noto Sans Thai), favicon, meta พื้นฐาน
- [x] สร้างโฟลเดอร์ตาม `architecture.md` §2 และคัดลอกโลโก้จาก skill assets → `src/assets/logo/`
- [x] `src/types/index.ts` ครบทุก interface · `src/data/icons.ts` (icon map) · `src/data/*.ts` ทั้งหมดจาก `content.md` (company, navigation, services, industries, projects, process, whyEsi, about, seo)
- [x] `src/i18n/` (LangProvider, en.ts, th.ts, useT) · `src/lib/motion.ts` (fadeUp, stagger) · `src/lib/utils.ts` (cn, localize)
- [x] Placeholder images: `public/images/placeholders/*.svg` (navy gradient + label) สำหรับทุกช่องรูป
- [x] Router โครงร่าง: `RootLayout` + ทุก route ชี้ไปหน้า stub (แสดงชื่อหน้า) + 404

**เกณฑ์ผ่าน:** `npm run dev` เปิดได้ทุก route · `npm run typecheck && npm run build` ผ่าน · ฟอนต์และสีแสดงตาม token · ไม่มี console error

> ✅ **ผ่านแล้ว 2026-09-22** — ตรวจในเบราว์เซอร์: ทุก route เปิดได้, slug/URL ที่ไม่มีได้หน้า 404 ใน layout ปกติ, `<title>` ถูกทุกหน้า, สวิตช์ TH/EN เปลี่ยน nav + `<html lang>` และจำค่าหลัง reload, ฟอนต์ 3 ตระกูลโหลดครบ, ไม่มี console error · typecheck / oxlint / build ผ่าน · หน้าทุกหน้ายังเป็น stub (ทำจริงใน Phase 3–7) · favicon/touch icon สร้างจากตัว E ของโลโก้แล้ว

### Phase 2 — Global Components (≈ 1–2 sessions)

**เป้าหมาย:** ส่วนที่ทุกหน้าใช้ร่วมกัน ตรงตาม mockup (`mockup-header-hero.jpg`, `mockup-footer.jpg`, `mockup-process-cta.jpg`)

- [x] `Button` (ทุก variant + chevron animation), `SectionTitle` (bar, eyebrow, subtitle, action, tone dark), `Chip`, `Icon`, `SocialIcon`, `LangSwitch`
- [x] `DiagonalLines`, `NetworkGraphic` (SVG constellation + pulse, reduced-motion), `Reveal` / `RevealItem` (+ `MotionConfig reducedMotion="user"` ใน App)
- [x] `Header`: logo panel เฉียง + เส้นน้ำเงิน, เส้นบน 3px, nav + active bar ที่ขอบล่าง, `SolutionsMenu` dropdown (hover/click/คีย์บอร์ด: Enter/ลูกศร/Esc), ปุ่ม Contact ESI, `LangSwitch`, sticky + scrolled state (68px, blur, shadow)
- [x] `MobileMenu`: drawer ขวา (motion), Solutions accordion, body scroll lock, focus trap, ปิดเมื่อเปลี่ยน route/Esc/คลิก overlay, คืน focus ไป hamburger
- [x] `Footer`: 4 คอลัมน์ + divider, โลโก้ขาว, social (inline SVG ซ่อนเมื่อไม่มี URL — ตอนนี้แสดง Facebook), contact, quick links (รวม Contact), solutions, ชื่อไทย + Tax ID, copyright — ไม่มี calendar/search/powered by
- [x] `CtaBand` (network graphic + diagonal lines + Button light), `PageHero` + `Breadcrumb` (พร้อมใช้ใน Phase 4–7)
- [x] `Seo`, `ScrollToTop`, skip-link, `Container` (ทำล่วงหน้าใน Phase 1)
- [x] `hooks/`: `useScrolled`, `useLockBodyScroll`, `useMediaQuery`

**เกณฑ์ผ่าน:** Header/Footer/CTA เทียบกับ mockup crop แล้วใกล้เคียง · เมนูมือถือใช้งานได้ที่ 375px · ใช้คีย์บอร์ดเปิด/ปิด dropdown และ drawer ได้ · สลับ TH/EN แล้ว nav เปลี่ยนภาษาและจำค่าไว้

> ✅ **ผ่านแล้ว 2026-09-22** — ตรวจในเบราว์เซอร์: header ตรง mockup (logo panel เฉียง, active bar, ปุ่ม, TH|EN), scrolled state ทำงาน, dropdown เปิดด้วย hover/คลิก/คีย์บอร์ดและปิดด้วย Esc/เลื่อนออก/คลิกข้างนอก, drawer 375px: accordion + focus trap + Esc + overlay ทำงาน, footer 4 คอลัมน์ + Facebook + Tax ID · typecheck / oxlint / build ผ่าน · **หมายเหตุ:** อย่าเขียนไฟล์ด้วย heredoc ขณะ dev server รัน (Vite บน Windows อาจ cache ไฟล์ว่าง → ต้อง restart) · ใช้ Write tool หรือ python แทน

### Phase 3 — Home Page (≈ 2 sessions) — หน้าที่ต้องเหมือน mockup ที่สุด

ทำทีละ section เทียบกับ crop ทุกครั้ง (`design-spec.md` §4)

- [x] `HeroSection` — ภาพ + gradient overlay + network graphic + zoom ช้า, h1 3 บรรทัด, 2 ปุ่ม, entrance animation
- [x] `SolutionsSection` — 6 การ์ด (icon 56/1.25, ชื่อ, bar), hover ตาม spec, diagonal lines 2 มุม (`SolutionCard` มี variant `rich` สำหรับ Phase 5 ด้วย)
- [x] `AboutSection` — ภาพ bleed ซ้าย / panel ขวา บน `esi-light`, ย่อหน้า + feature 2×2 (`FeatureItem`)
- [x] `IndustriesSection` — 5 image cards (`IndustryCard` สัดส่วน 5:4 ตาม mockup) + label bar น้ำเงิน, hover zoom/overlay/arrow, mobile scroll-snap
- [x] `FeaturedProjectsSection` — 3 การ์ดแนวนอน (`ProjectCard` variant horizontal; มี vertical สำหรับ Phase 6), ลิงก์ View all projects
- [x] `WhyEsiSection` — dark section 3×2 (ตาม spec, D4) — reuse ได้ในหน้า About
- [x] `ProcessSection` — timeline แนวนอน 6 ขั้น (เส้นประ + chevron) / แนวตั้งบนมือถือ, line-draw animation — reuse ได้ในหน้า Solutions
- [x] ประกอบ `HomePage` + `Seo` (site title/description ตาม spec §44)

**เกณฑ์ผ่าน:** ภาพหน้าจอ desktop วางเทียบ `homepage-mockup.png` แล้วลำดับ/สัดส่วน/สี/ตัวอักษรตรงกัน · responsive ครบ 375/768/1024/1440 · animation นุ่ม ไม่รบกวน, ปิดได้ด้วย reduced-motion · Lighthouse mobile เบื้องต้น ≥ 80

> ✅ **ผ่านแล้ว 2026-09-22** — full-page screenshot 1440/375 (ผ่าน `npm run screenshot`) เทียบ mockup ทีละ section: ลำดับ/สัดส่วน/สี/ตัวอักษรตรง · reveal/stagger/line-draw ทำงาน, `MotionConfig reducedMotion="user"` · **Lighthouse mobile (production build): Performance 86 · Accessibility 100 · Best Practices 100 · SEO 92** (SEO ตกเฉพาะ robots.txt → Phase 7) · แก้ระหว่างทาง: placeholder SVG ที่มี `&` ไม่ escape (รูปเสีย 4 ไฟล์), การ์ด Featured ตามสัดส่วน mockup (ไม่มี chips, ตัวอักษร 15/13px), การ์ด Industries เป็น 5:4

### Phase 4 — About & Industries (≈ 1 session)

- [x] `AboutPage`: PageHero → Introduction (ภาพ mask เฉียง) → Overview (+4 pillars) → Expertise (6 rich solution cards) → Mission/Vision (2 การ์ด) → Core Values (5 tiles) → Why ESI (reuse) → Industries Served (reuse `IndustriesSection` ที่รับ title/id) → CTA
- [x] `IndustriesPage`: PageHero → jump links → 5 บล็อกสลับซ้าย/ขวา (`IndustryShowcase`, ภาพ mask เฉียงหันเข้าหาข้อความ) พร้อม anchor `#slug`, scope chips (spec §25), ลิงก์ "See related projects (n)" → `/projects?industry=<slug>` (Phase 6 ต้องรองรับ param นี้)
- [x] ใส่ `Seo`, responsive, reveal animation · `ScrollToTop` ปรับให้ข้ามหน้าไป anchor แบบทันที และ jump link ในหน้าเดียวกัน smooth

**เกณฑ์ผ่าน:** ทั้งสองหน้าเปิดได้จาก nav/footer · anchor จาก Home industry card เลื่อนไปถูกบล็อก · copy ตรงกับ `content.md` (draft ทำเครื่องหมายไว้ในโค้ด)

> ✅ **ผ่านแล้ว 2026-09-22** — full-page screenshot 1440/375 ทั้งสองหน้า · anchor ทดสอบใน headless Chrome 3 กรณี (จาก Home / โหลดตรง / jump link) บล็อกอยู่ใต้ header 96px พอดี · typecheck / lint ผ่าน · copy About (Introduction/Overview/Mission/Vision/Core Values) ยังเป็น DRAFT รอ ESI

### Phase 5 — Solutions (≈ 1–2 sessions)

- [ ] `SolutionsPage` (overview): intro + 6 rich cards (icon, ชื่อ, คำอธิบาย, Learn more) + Process (reuse)
- [ ] `SolutionCard` variant `rich` · `SolutionFeatures` (checklist grid)
- [ ] `SolutionDetailPage` template: PageHero + breadcrumb → Overview (2 คอลัมน์) → What we deliver (features จาก spec §16–21) → Industries served chips → `RelatedProjects` (ตาม category) → prev/next solution → CTA; slug ไม่ถูกต้อง → 404
- [ ] Nav dropdown / mobile submenu / footer ดึงรายการจาก `services.ts` โดยอัตโนมัติ

**เกณฑ์ผ่าน:** ทั้ง 6 route `/solutions/*` เปิดได้และเนื้อหาถูกต้อง · related projects แสดงเฉพาะที่มี category ตรง (ซ่อนถ้าไม่มี) · การเพิ่ม service ใหม่ใน data ทำให้ nav/footer/overview อัปเดตเอง

### Phase 6 — Projects (≈ 1–2 sessions)

- [ ] `ProjectsPage`: PageHero → `FilterTabs` (All + 6 categories, state ใน URL `?category=`) → grid การ์ดแนวตั้ง 3/2/1 → `AnimatePresence` ตอนกรอง → `EmptyState` · **รองรับ `?industry=<slug>` ด้วย** (ลิงก์จากหน้า Industries, Phase 4)
- [ ] `ProjectCard` variants `horizontal` (Home) / `vertical` (grid)
- [ ] `ProjectDetailPage`: PageHero (รูปโครงการ) → meta strip (Client/Industry/Location/Services) → Overview → Scope → Solution cards → Gallery (ถ้ามี) → Related Projects → CTA; slug ไม่ถูกต้อง → 404
- [ ] Data helpers: `getProjectBySlug`, `getFeaturedProjects`, `getProjectsByCategory`, `getRelatedProjects`
- [ ] (แนะนำ) Vitest data-integrity test: slug ไม่ซ้ำ, category ถูกต้อง, ไฟล์รูปมีจริง

**เกณฑ์ผ่าน:** filter ทำงานและแชร์ลิงก์พร้อม filter ได้ · detail ทุก slug เปิดได้ · related ไม่แสดงตัวเอง · เพิ่ม project ใหม่ตาม spec §50 แล้วโผล่ทั้ง grid และ detail โดยไม่แก้ component

### Phase 7 — Contact & Utility (≈ 1 session)

- [ ] `ContactPage`: PageHero → การ์ดข้อมูล (ที่อยู่/โทร/อีเมล/เวลาทำการ พร้อมไอคอน) + ปุ่ม `mailto:` และ `tel:` → `MapEmbed` (Google Maps iframe จากที่อยู่) — ไม่มี CTA band
- [ ] `NotFoundPage` (dark, ข้อความตาม spec §49, ปุ่ม Back to Home, title 404)
- [ ] ตรวจ `ScrollToTop`, `Breadcrumb` ทุกหน้า, ลิงก์โทร/อีเมลใน footer
- [ ] `public/robots.txt`, `public/sitemap.xml` (+ script สร้างจาก routes/slugs), `favicon.svg`, `og-cover.jpg`

**เกณฑ์ผ่าน:** แผนที่แสดงตำแหน่งถูกต้อง · ปุ่มโทร/อีเมลทำงานบนมือถือ · เปิด URL มั่ว ๆ ได้หน้า 404 ที่มี header/footer ปกติ

### Phase 8 — Final Polish & Deploy (≈ 1–2 sessions)

- [ ] เปลี่ยน placeholder เป็นรูปจริง (WebP, ขนาดตาม `architecture.md` §8, `width/height`, lazy ยกเว้น hero)
- [ ] ตรวจ responsive ทุกหน้า 375/390/768/1024/1280/1440 · cross-browser (Chrome, Edge, Firefox, Safari, mobile)
- [ ] Accessibility pass: alt, focus, keyboard, contrast, landmarks, `aria-*`, reduced-motion
- [ ] SEO pass: title/description/canonical/OG ทุกหน้า, sitemap, robots, `SITE_URL` จริง
- [ ] Performance: Lighthouse mobile ≥ 85 / 90 / 90 / 90 (spec §47) — ปรับ font loading, image size, code splitting ตามผล
- [ ] ตัดสินใจ hosting → ใส่ไฟล์ SPA rewrite ที่ตรงกัน (`_redirects` / `vercel.json` / `.htaccess` / nginx) และ `base` ถ้าอยู่ใต้ sub-path
- [ ] `README.md`: วิธีรัน/บิลด์, วิธีเพิ่ม Project/Service/รูป, วิธี deploy, โครงสร้างโปรเจกต์
- [ ] Production build + Final QA ตาม Definition of Done ด้านล่าง

**เกณฑ์ผ่าน:** ผ่าน Definition of Done ทุกข้อ · deploy ขึ้น hosting ทดสอบแล้ว deep link ทุก route เปิดได้

---

## 5. Definition of Done (spec §61)

- [ ] ทุกหน้าเปิดใช้งานได้ และทุก Route ทำงานถูกต้อง
- [ ] ESI Logo แสดงถูกต้อง · Theme ตรงกับ Brand
- [ ] Desktop / Tablet / Mobile responsive สมบูรณ์ · Mobile Menu ทำงาน
- [ ] Solution Navigation ทำงาน · Project Filter ทำงาน · Project Detail ทำงาน · Related Project ทำงาน
- [ ] Contact Information ถูกต้อง (ยืนยัน D1 แล้ว) · Google Maps แสดงผล
- [ ] ไม่มี Broken Link · ไม่มี Console Error · ไม่มี Missing Image
- [ ] SEO Meta พื้นฐานครบ · Accessibility พื้นฐานครบ
- [ ] Production Build ผ่าน · เว็บไซต์ Deploy ได้

## 6. วิธีสั่งงานในโปรเจกต์นี้

ตัวอย่างคำสั่งที่ใช้กับ Claude (skill จะโหลดเองเมื่ออยู่ในโฟลเดอร์นี้):

- `ทำ Phase 1` — สร้างโปรเจกต์และพื้นฐานทั้งหมดตาม checklist
- `ทำ Hero section ตาม mockup` — ทำเฉพาะ section (ควรทำ Phase 1–2 ก่อน)
- `เพิ่ม project ใหม่: <ชื่อ>, ลูกค้า <...>, ประเภท <cctv>, ...` — เพิ่มข้อมูลใน `src/data/projects.ts`
- `เทียบหน้า Home กับ mockup แล้วแก้จุดที่ต่าง` — QA เชิงภาพ
- `เตรียม deploy ขึ้น Netlify` — Phase 8 ส่วน hosting

เมื่อ Phase ใดเสร็จ ให้ Claude ติ๊ก checkbox และอัปเดต "สถานะปัจจุบัน" ด้านบนของไฟล์นี้
