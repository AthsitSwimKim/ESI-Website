# แผนพัฒนาเว็บไซต์ ESI — Corporate Website Redesign

> **สถานะปัจจุบัน:** Phase 8 เกือบเสร็จ 🟡 — QA/a11y/SEO/performance/deploy config/README ครบแล้ว · **เหลือรอจาก ESI: รูปจริง (D6), เลือก hosting, อนุมัติ copy ✏️, copy ภาษาไทย** จากนั้น deploy จริงแล้วปิดโครงการ
> **อัปเดตล่าสุด:** 2026-09-22
> **Skill:** `.claude/skills/esi-website/` (โหลดอัตโนมัติเมื่อทำงานในโปรเจกต์นี้)
> **Spec ต้นฉบับ:** `.claude/skills/esi-website/references/spec-source.md` · **Mockup:** `.claude/skills/esi-website/assets/homepage-mockup.png`

---

## 1. สรุปโครงการ

| หัวข้อ  | รายละเอียด                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------- |
| โครงการ | เว็บไซต์องค์กรใหม่ของ Engineering System Integration Co., Ltd. (ESI) จ.ระยอง                                        |
| ประเภท  | Corporate / Industrial System Integration Website — ใช้เป็น Online Company Profile                                  |
| ขอบเขต  | **Frontend only** — ไม่มี Backend, Database, Login, CMS, Admin, Upload (spec §7)                                    |
| Stack   | React 19 + TypeScript · Vite · Tailwind CSS v4 · React Router DOM v7 · motion (Framer Motion) · Lucide React        |
| ข้อมูล  | Static data ใน `src/data/*.ts` — เพิ่ม Project/Service โดยแก้ไฟล์ data (spec §50–51)                                |
| ภาษา    | EN เป็นหลัก + สวิตช์ TH/EN (โครง i18n พร้อม, รอ copy ภาษาไทยจาก ESI)                                                |
| หน้าตา  | **ยึดตาม mockup หน้า Home** ทุก section แล้วขยาย design language เดียวกันไปหน้าอื่น (รายละเอียดใน `design-spec.md`) |
| หน้า    | Home, About, Solutions (+6 detail), Industries, Projects (+detail), Contact, 404 — route ตาม spec §9                |
| Deploy  | `npm run build` → `dist/` ขึ้น Vercel / Netlify / Cloudflare Pages / Apache / Nginx ได้ทันที                        |

## 2. หลักการทำงานทุก Phase

1. เริ่มงานทุกครั้ง: อ่านสถานะในไฟล์นี้ → เปิด `design-spec.md` section ที่จะทำ **พร้อมรูป mockup crop** → เปิด `content.md` สำหรับข้อความ
2. ทำตามลำดับ Phase (พื้นฐาน → global components → Home → หน้าอื่น) เพราะทุกหน้าใช้ component ร่วมกัน
3. ข้อความ/ข้อมูลทั้งหมดอยู่ใน `src/data` — ห้าม hardcode ใน JSX
4. ทุก Phase ต้องผ่าน **เกณฑ์ผ่าน** ของตัวเองก่อนไป Phase ถัดไป (typecheck + build ผ่าน, ไม่มี console error, เทียบกับ mockup แล้ว)
5. ทำเสร็จให้ติ๊ก checkbox ในไฟล์นี้ และบันทึกการตัดสินใจใหม่ ๆ ในตารางข้อ 3

## 3. ประเด็นที่ตัดสินใจแล้ว / ต้องยืนยันกับ ESI

ค่าเริ่มต้นด้านล่างจะถูกใช้ทันทีถ้าไม่มีการแก้ — ยืนยันหรือเปลี่ยนได้ทุกเมื่อ

| #   | ประเด็น                                                                                                                                                                                                               | ค่าเริ่มต้นที่ใช้                                                                                                                                                                                                                                                                                                      | สถานะ                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| D1  | **ข้อมูลติดต่อไม่ตรงกัน** — spec: 69/13 ถ.จันทอุดม ต.เชิงเนิน อ.เมือง ระยอง 21000 / 038-623-000 / info@esi-th.com — mockup footer: 55/9 ม.3 ต.ตาสิทธิ์ อ.ปลวกแดง 21140 / +66 (0) 38 683 615-8 / info@esi.co.th        | ใช้ตาราง Contact ใน spec (§34) — **ยืนยันแล้วจากเว็บเดิม esi-th.com** (ที่อยู่/โทร/แฟกซ์ 038-623-001/อีเมล/ชื่อไทย/เลขผู้เสียภาษี 0215560000858 ตรงกัน)                                                                                                                                                                | ✅ ยืนยันแล้ว (2026-09-22)               |
| D2  | Footer ใน mockup มี Certifications (ISO 9001 / ISO 27001) แต่ spec ไม่กล่าวถึง                                                                                                                                        | ไม่ใส่จนกว่าจะได้ไฟล์ใบรับรองจริง (ห้ามใส่ badge ปลอม) — คอลัมน์ 4 ของ footer ใช้ Solutions links ตาม spec                                                                                                                                                                                                             | ⏳ รอ ESI                                |
| D3  | Footer ใน mockup มี Blog / Careers                                                                                                                                                                                    | ไม่ทำ — ไม่อยู่ใน sitemap (spec §8)                                                                                                                                                                                                                                                                                    | ✅ ตัดสินใจแล้ว                          |
| D4  | หน้า Home ใน spec มี section "Why ESI" แต่ mockup ไม่มี                                                                                                                                                               | ทำตาม spec (ใส่ระหว่าง Featured Projects กับ Process) ออกแบบเป็น dark section ให้เข้ากับ mockup                                                                                                                                                                                                                        | ✅ ตัดสินใจแล้ว                          |
| D5  | TH/EN switch มีใน header แต่ spec ไม่มี copy ภาษาไทย                                                                                                                                                                  | สร้างระบบ i18n จริง (ไม่ใช้ library) — UI strings มี TH, เนื้อหายาว fallback เป็น EN จนกว่าจะได้คำแปล; Section title คงเป็นภาษาอังกฤษ (เป็นส่วนหนึ่งของ visual identity)                                                                                                                                               | ⏳ รอ copy TH                            |
| D6  | รูปภาพ (hero, about, industries ×5, projects, page heroes) — mockup ใช้ภาพ AI                                                                                                                                         | **โครงการ 8 รายการใช้รูปจริงแล้ว** (ดึงจาก wp-content ของ esi-th.com เอง แปลงเป็น WebP 3:2 ใน `public/images/projects/`) — ที่เหลือยังเป็น placeholder เพราะเว็บเดิม hotlink รูปของบุคคลที่สาม (Henkel, kaohoon, LinkedIn, Google) หรือมีแค่ thumbnail < 450px · hero / about / industries / page hero ยังรอรูปจาก ESI | 🟡 บางส่วนแล้ว                           |
| D7  | โลโก้ต้นฉบับเป็น PNG พื้นขาว                                                                                                                                                                                          | ทำเวอร์ชันพื้นโปร่งใส (น้ำเงิน/ขาว) ไว้ใน skill assets แล้ว — ขอไฟล์ SVG/AI ต้นฉบับถ้ามี                                                                                                                                                                                                                               | ⏳ ขอไฟล์ vector                         |
| D8  | Project มีชื่อแค่ 3 โครงการ (spec ตัวอย่างใช้ `id: 15`)                                                                                                                                                               | **ใส่ 22 โครงการจริง** จากหน้า Site Reference ของเว็บเดิม (2017–2024) ใน `src/data/projects.ts` — ชื่อปรับเป็นรูปแบบ "ลูกค้า – ระบบ", scope ตามข้อความเดิม, สถานที่บางส่วนอนุมาน (`// to confirm`); ลูกค้าที่ไม่ใช่อุตสาหกรรม (รีสอร์ต/สำนักงาน/หน่วยงานรัฐ) จัดในหมวด Industrial Infrastructure                       | ✅ ได้ข้อมูลแล้ว — รอ ESI ตรวจรายละเอียด |
| D9  | Social media (LinkedIn, Facebook, YouTube) ไม่มี URL                                                                                                                                                                  | Facebook: facebook.com/engineeringsystemintegration (จากเว็บเดิม) · LinkedIn/YouTube ยังไม่มี → ไอคอนซ่อนอัตโนมัติ                                                                                                                                                                                                     | ✅ บางส่วน (2026-09-22)                  |
| D10 | Domain / hosting ยังไม่ระบุ                                                                                                                                                                                           | Domain จริงคือ **esi-th.com** (เว็บเดิมเป็น WordPress) → `siteUrl = https://esi-th.com`; ต้องยืนยันว่าจะ deploy ทับ domain เดิมและ hosting ที่ใช้                                                                                                                                                                      | ✅ domain ยืนยัน · ⏳ hosting            |
| D11 | Font ไม่ระบุใน spec                                                                                                                                                                                                   | Display: **Kanit** (bold italic uppercase — รองรับไทย, เอียงตามโลโก้) · Body: **Inter + Noto Sans Thai**                                                                                                                                                                                                               | ✅ เสนอใช้ (เปลี่ยนได้)                  |
| D12 | Contact form                                                                                                                                                                                                          | ไม่ทำฟอร์ม — ใช้ปุ่ม `mailto:` + `tel:` ตาม spec §35 แนะนำ (ถ้าต้องการฟอร์มจริงค่อยเพิ่ม EmailJS/Formspree ภายหลัง)                                                                                                                                                                                                    | ✅ ตัดสินใจแล้ว                          |
| D13 | Google Maps                                                                                                                                                                                                           | ใช้ iframe embed จากที่อยู่ ไม่ต้องใช้ API key                                                                                                                                                                                                                                                                         | ✅ ตัดสินใจแล้ว                          |
| D14 | Header บน Hero                                                                                                                                                                                                        | ใช้พื้นขาวตาม mockup (spec อนุญาตโปร่งใสได้ แต่ mockup เป็นสีขาว) เมื่อ scroll เพิ่ม shadow + blur                                                                                                                                                                                                                     | ✅ ตัดสินใจแล้ว                          |
| D15 | Library ที่ spec ระบุเป็น optional (Swiper, React Helmet Async)                                                                                                                                                       | ไม่ใช้ — ใช้ CSS scroll-snap และ React 19 native `<title>/<meta>` แทน (ลด dependency)                                                                                                                                                                                                                                  | ✅ ตัดสินใจแล้ว                          |
| D16 | Linter — template create-vite 9 เปลี่ยนมาใช้ oxlint แทน ESLint                                                                                                                                                        | ใช้ oxlint ตาม template (`npm run lint`) + Prettier (+ tailwind plugin) สำหรับ format                                                                                                                                                                                                                                  | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D17 | การจัดการ 404 สำหรับ slug/URL ที่ไม่มี                                                                                                                                                                                | ใช้ route `loader` โยน `Response 404` → root `errorElement` แสดง `NotFoundPage` ใน layout ปกติ (มี header/footer, ไม่มี CTA band)                                                                                                                                                                                      | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D18 | Favicon / tab icon                                                                                                                                                                                                    | **ใช้ไฟล์ที่ลูกค้าให้** (`esi-logo-tab.png` — สี่เหลี่ยมมุมมนพื้นขาว + wordmark) ทำมุมโปร่งใสแล้วสร้าง `favicon-32.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (ต้นฉบับใน skill assets) — แทน E monogram ที่ทำไว้ก่อน                                                                                 | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D19 | ลิงก์ "Contact" ในเมนู header ซ้ำกับปุ่ม "Contact ESI" ที่อยู่ติดกัน                                                                                                                                                  | **เอาออกจาก header/เมนูมือถือ** (ใช้ `headerNav`) — ปุ่ม Contact ESI เป็นทางเข้าหน้า Contact; footer Quick Links ยังมี Contact ตามเดิม (mockup/spec มีทั้งคู่ แต่ลูกค้าตัดสินใจตัด)                                                                                                                                    | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D20 | Google Maps embed                                                                                                                                                                                                     | **ใช้ embed URL ทางการที่ลูกค้าส่งมา** (Share → Embed a map) ซึ่งมี place ID ของ Google Business ของ ESI → หมุดขึ้นชื่อบริษัทจริง, มุมมองดาวเทียม (`5e1`) · เก็บพิกัด 12.68721, 101.2745016 ไว้ใน data สำหรับ schema ภายหลัง + ลิงก์ "Open in Google Maps"                                                             | ✅ ตัดสินใจแล้ว (2026-09-29)             |
| D21 | Header ตอน scroll — spec ระบุ white + backdrop blur                                                                                                                                                                   | **ขาวทึบทั้งสองสถานะ** (ลูกค้าเห็นว่าแบบโปร่ง 90% + blur ดูเป็นสีเทาบน hero และทำให้ panel โลโก้ดูเป็นกรอบ) คงเงาตอน scroll                                                                                                                                                                                            | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D22 | รูปในเว็บเดิมบางรูปเป็นของบุคคลที่สาม (hotlink จาก henkel.co.th, kaohoon.com, LinkedIn, Google, ggcplc.com ฯลฯ)                                                                                                       | **ไม่คัดลอกมาใช้** — ใช้เฉพาะรูปที่อยู่ใน wp-content ของ esi-th.com เอง (8 รายการ) ที่เหลือใช้ placeholder จนกว่า ESI จะส่งรูปของตัวเอง                                                                                                                                                                                | ✅ ตัดสินใจแล้ว (2026-09-29)             |
| D23 | **เว็บเดิม esi-th.com มีสคริปต์แปลกปลอมฝังอยู่** — ทุกโพสต์ (22/22) มี obfuscated JavaScript ที่เปิดลิงก์ `ushort.observer` (รูปแบบมัลแวร์ WordPress)                                                                 | ดึงมาเฉพาะข้อความ/รูป โดยตัด `<script>` ทิ้งทั้งหมด — เว็บใหม่ไม่มีโค้ดนี้ · **แจ้ง ESI ให้ตรวจ/ล้างเว็บเดิมและเปลี่ยนรหัสผ่าน WordPress**                                                                                                                                                                             | ⚠️ แจ้งลูกค้าแล้ว (2026-09-29)           |
| D24 | **Google Business ของ ESI แสดงที่อยู่ผิด** — การ์ดบนแผนที่ขึ้น "69/13 ถนนสุขุมวิท นครระยอง 45 ตำบลท่าประดู่" แต่ที่อยู่จริงคือ "69/13 ถนนจันทอุดม ตำบลเชิงเนิน อำเภอเมืองระยอง ระยอง 21000" (ลูกค้ายืนยัน 2026-09-29) | **เว็บใหม่ถูกต้องแล้ว** ใช้ถนนจันทอุดมทุกจุด (footer, Contact, SEO) · หมุดบนแผนที่ปักถูกตำแหน่ง — **ESI ต้องแก้ที่อยู่ในหน้า Google Business เอง** (Google Maps → จัดการโปรไฟล์ธุรกิจ → แก้ไขที่อยู่) เพื่อให้การ์ดบนแผนที่ตรงกับเว็บ                                                                                  | ✅ ยืนยันแล้ว · ⏳ รอ ESI แก้ฝั่ง Google |

### ข้อมูลที่ต้องขอจาก ESI (content needed)

- [x] ยืนยันที่อยู่ / โทร / อีเมล (D1) — ตรงกับเว็บเดิม · Facebook ได้แล้ว (D9) — [ ] LinkedIn/YouTube ถ้ามี
- [ ] **ESI แก้ที่อยู่ในโปรไฟล์ Google Business ให้เป็น ถ.จันทอุดม ต.เชิงเนิน (D24)** — ข้อมูลบนเว็บถูกต้องแล้ว
- [ ] รูปภาพ: Hero (โรงงานปิโตรเคมี/Oil & Gas), About (วิศวกรในห้องควบคุม), Industries 5 ภาพ, Project แต่ละโครงการ (+gallery), page hero แต่ละหน้า
- [x] รายการ Project — ได้ 22 โครงการจากเว็บเดิม (เนื้อหาครบแล้ว ตรวจซ้ำกับหน้ารายละเอียดทุกโพสต์ 2026-09-29)
- [ ] ESI ตรวจชื่อลูกค้า/สถานที่ที่ทำเครื่องหมาย `to confirm`
- [ ] **รูปโครงการที่ยังขาด (14 รายการ)** — เว็บเดิมไม่มีรูปของ ESI เอง: Map Ta Phut Tank Terminal, Long Son, Henkel, GC Glycol, Lenzing T3, D.Enterprise, ORP, MOCD2, Gulf UT, GGC TFA, SCALE 360 · รูปที่มีแต่เล็กเกินไป (< 450px) ขอไฟล์ต้นฉบับ: Senior Aerospace, SCG แก่งคอย, Edehege
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

- [x] `SolutionsPage` (overview): PageHero + intro + 6 rich cards (icon, ชื่อ, คำอธิบาย, Learn more) + Process (reuse) + CTA
- [x] `SolutionCard` variant `rich` (ทำไว้ตั้งแต่ Phase 3) · `SolutionFeatures` (checklist grid) · `RelatedProjects` (shared, ซ่อนเองเมื่อไม่มีผลงาน — ใช้ต่อใน Phase 6)
- [x] `SolutionDetailPage` template: PageHero + breadcrumb → Overview (2 คอลัมน์ + ภาพ mask เฉียง) → What we deliver (features จาก spec §16–21) → Industries served (ลิงก์ไป `/industries#slug`) → `RelatedProjects` (ตาม category, สูงสุด 3) → prev/next solution (วนรอบ) → CTA; slug ไม่ถูกต้อง → 404
- [x] Nav dropdown / mobile submenu / footer / overview ดึงรายการจาก `services.ts` โดยอัตโนมัติ (ทดสอบด้วยการเพิ่ม service ชั่วคราวแล้วลบออก)

**เกณฑ์ผ่าน:** ทั้ง 6 route `/solutions/*` เปิดได้และเนื้อหาถูกต้อง · related projects แสดงเฉพาะที่มี category ตรง (ซ่อนถ้าไม่มี) · การเพิ่ม service ใหม่ใน data ทำให้ nav/footer/overview อัปเดตเอง

> ✅ **ผ่านแล้ว 2026-09-29** — ทดสอบใน headless Chrome ครบ 6 route: title/breadcrumb/h1 ถูกต้อง, จำนวน features ตรง spec (9/8/7/7/7/8), industries chips, related projects 3 รายการต่อหน้า, prev/next วนรอบ, CTA band ครบ · slug มั่ว → 404 (ไม่มี CTA) · เพิ่ม service ที่ 7 ชั่วคราว → dropdown/drawer/footer/overview ขึ้นเป็น 7 และ route ใหม่เปิดได้ แล้วลบออก · ไม่มี console error · typecheck/lint/build ผ่าน · แก้ระหว่างทาง: intro หน้า overview ซ้ำกับ lead ใน hero (เขียนใหม่ให้ต่างกัน), หัวข้อ Overview เคยซ้ำชื่อ solution, placeholder SVG ย้าย label ไปมุมบนซ้ายให้เล็กลงเพราะทับ h1 ใน PageHero

### Phase 6 — Projects (≈ 1–2 sessions)

- [x] `ProjectsPage`: PageHero → `FilterTabs` (All + 6 categories พร้อมจำนวน, state ใน URL `?category=`) → grid การ์ดแนวตั้ง 3/2/1 → `AnimatePresence` ตอนกรอง → `EmptyState` · รองรับ `?industry=<slug>` (chip ถอดได้ + ปุ่มสลับอุตสาหกรรมอื่น) · param ที่ไม่รู้จักถูกมองข้าม
- [x] `ProjectCard` variants `horizontal` (Home/related) / `vertical` (grid — chips, ชื่อ, client·location, คำอธิบาย)
- [x] `ProjectDetailPage`: PageHero (รูปโครงการ) → meta strip (Client/Industry/Location/Services/Year) → Overview (+ partners) → Scope → Solution cards → Gallery (ถ้ามี) → Related Projects → CTA; slug ไม่ถูกต้อง → 404
- [x] Data helpers: `getProjectBySlug`, `getFeaturedProjects`, `getProjectsByCategory`, `getProjectsByIndustry`, `getRelatedProjects`
- [x] Vitest data-integrity test (`src/data/data.test.ts`, `npm test`): slug/id ไม่ซ้ำ + เป็น kebab-case, category/industry ถูกต้อง, ไอคอนมีจริง, ไฟล์รูปมีจริงใน `public/`, featured 3–6, related ไม่รวมตัวเอง, filter ครบทุก category — 10 tests

**เกณฑ์ผ่าน:** filter ทำงานและแชร์ลิงก์พร้อม filter ได้ · detail ทุก slug เปิดได้ · related ไม่แสดงตัวเอง · เพิ่ม project ใหม่ตาม spec §50 แล้วโผล่ทั้ง grid และ detail โดยไม่แก้ component

> ✅ **ผ่านแล้ว 2026-09-29** — ทดสอบใน headless Chrome: คลิก tab → URL เป็น `?category=cctv` (10 รายการ) · deep link `?category=cybersecurity` (4) และ `?industry=oil-gas` (1) ถูกต้อง · คู่ที่ไม่มีผลลัพธ์ → EmptyState + ปุ่มรีเซ็ตล้างทั้งสอง filter · param มั่ว → แสดงทั้งหมด · detail: meta strip/scope/solution cards/related 3 รายการ (ไม่มีตัวเอง)/CTA ครบ, slug มั่ว → 404 · **เพิ่ม project ชั่วคราวในไฟล์ data → ขึ้นทั้ง grid (23), filter network (9) และหน้า detail ทันที** แล้วลบออก · ไม่มี console error · typecheck/lint/test/build ผ่าน · แก้ระหว่างทาง: ป้าย sr-only ของ chip อุตสาหกรรมเคยอ่านว่า "Show all projects" (เปลี่ยนเป็น "Remove industry filter"), ตัวนับผลลัพธ์เพิ่มคำอธิบาย

### Phase 7 — Contact & Utility (≈ 1 session)

- [x] `ContactPage`: PageHero → การ์ดข้อมูล (`ContactInfo`: ที่อยู่ EN/TH, โทร, แฟกซ์, อีเมล, เวลาทำการ, เลขผู้เสียภาษี) + ปุ่ม `mailto:` และ `tel:` → `MapEmbed` (Google Maps iframe จากพิกัด + ลิงก์เปิดใน Google Maps) — ไม่มี CTA band
- [x] `NotFoundPage` (dark + network graphic, ข้อความตาม spec §49, ปุ่ม Back to Home, title 404) — ทำไว้ตั้งแต่ Phase 1–2, ตรวจซ้ำแล้ว
- [x] ตรวจ `ScrollToTop` (เปลี่ยนหน้า → scrollY 0), `Breadcrumb` ครบ 7 หน้า, ลิงก์ `tel:`/`mailto:` ใน footer และหน้า Contact
- [x] `public/robots.txt`, `public/sitemap.xml` (34 URL — `scripts/sitemap.mjs` สร้างจาก data, ผูกกับ `npm run build`), `favicon.svg` (vector traced จากโลโก้), `og-cover.jpg` (1200×630) + OG fallback ใน `index.html`

**เกณฑ์ผ่าน:** แผนที่แสดงตำแหน่งถูกต้อง · ปุ่มโทร/อีเมลทำงานบนมือถือ · เปิด URL มั่ว ๆ ได้หน้า 404 ที่มี header/footer ปกติ

> ✅ **ผ่านแล้ว 2026-09-29** — แผนที่โหลดจริงและปักหมุดที่ ถ.จันทอุดม เมืองระยอง (iframe `loading=lazy` + `title`) · ลิงก์ `tel:+6638623000` 3 จุด และ `mailto:info@esi-th.com` (ปุ่ม Email us มี subject) · `/totally/unknown/path` → 404 พร้อม header/footer ไม่มี CTA band, ปุ่ม Back to Home กลับหน้าแรกและ scroll ขึ้นบนสุด · breadcrumb ถูกต้องทั้ง 7 หน้า · robots.txt/sitemap.xml/favicon.svg/og-cover.jpg เสิร์ฟได้ (200) · ไม่มี console error

### Phase 8 — Final Polish & Deploy (≈ 1–2 sessions)

- [🟡] เปลี่ยน placeholder เป็นรูปจริง — **8 โครงการใช้รูปจริงแล้ว** (WebP 3:2 จาก wp-content ของเว็บเดิม) ทุกรูปมี `width/height` และ `loading="lazy"` ยกเว้น hero (`fetchPriority="high"`) · **รออีก 14 โครงการ + hero / about / industries ×5 / page hero จาก ESI**
- [x] ตรวจ responsive ทุกหน้า — `npm run audit` เช็ค horizontal overflow ทุก route ที่ 375/768/1024/1440 (0 รายการ) + ดูภาพจริงที่ 375/768/1024/1440 · **cross-browser: ทดสอบ Chromium แล้ว — Firefox/Safari ต้องเปิดดูบนเครื่องจริง (ไม่มีในเครื่องนี้)**
- [x] Accessibility pass — axe-core WCAG 2 A/AA: **0 violations ทั้ง 16 route** · Lighthouse accessibility **100 ทุกหน้า** (แก้ heading order ในหน้า Projects) · alt/width/height ครบทุกรูป · keyboard + focus ring + reduced-motion ตรวจแล้วตั้งแต่ Phase 2–3
- [x] SEO pass — title/description/canonical/OG ต่างกันทุกหน้า (แก้ meta ซ้ำซ้อนระหว่าง `index.html` กับ `<Seo>`), h1 เดียวต่อหน้า, sitemap 34 URL + robots.txt สร้างอัตโนมัติ, Lighthouse SEO **100** · `siteUrl = https://esi-th.com` (ยืนยันก่อน deploy ถ้าเปลี่ยน domain)
- [x] Performance — Lighthouse mobile จาก production build: **Home 89 / Projects 92 / Solution detail 91** (เป้า 85) · Accessibility 100 · Best Practices 100 · SEO 100 · CLS ≤ 0.014, TBT 0 ms · route-level code splitting + WebP + lazy loading ทำงาน
- [x] เตรียมไฟล์ SPA rewrite **ครบทุก hosting** แล้ว (Netlify/Cloudflare `public/_redirects` · Vercel `vercel.json` · Apache `public/.htaccess` · Nginx `nginx.conf.example`) พร้อม cache header — **รอ ESI เลือก hosting** (ไฟล์ที่ไม่ใช้ไม่รบกวนกัน) · วิธีตั้ง `base` สำหรับ sub-path อยู่ใน README
- [x] `README.md` — scripts ทั้งหมด, วิธีเพิ่ม Project/Service/รูป (พร้อมขนาดรูป), โครงสร้างโปรเจกต์, ตาราง deploy ต่อ hosting, quality gates
- [🟡] Production build ผ่าน + `npm run audit` บน build จริงสะอาด — **Final QA ปิดท้ายทำได้หลัง deploy จริง** (ทดสอบ deep link บน hosting)

**เกณฑ์ผ่าน:** ผ่าน Definition of Done ทุกข้อ · deploy ขึ้น hosting ทดสอบแล้ว deep link ทุก route เปิดได้

> 🟡 **2026-09-29** — งานฝั่งโค้ดเสร็จหมดแล้ว: audit สะอาด (16 route × 4 ความกว้าง), Lighthouse 89–92/100/100/100, deploy config ครบ, README ครบ
> เหลือ 3 อย่างที่ต้องรอฝั่ง ESI: **(1) รูปจริง** 14 โครงการ + hero/about/industries **(2) เลือก hosting + ยืนยัน domain** **(3) อนุมัติ copy ที่ทำเครื่องหมาย ✏️ และส่ง copy ภาษาไทย**
> ข้อที่ยังทำไม่ได้ในเครื่องนี้: cross-browser บน Firefox / Safari จริง และทดสอบ deep link หลัง deploy

---

## 5. Definition of Done (spec §61)

- [ ] ทุกหน้าเปิดใช้งานได้ และทุก Route ทำงานถูกต้อง
- [x] ESI Logo แสดงถูกต้อง (header/footer/favicon/OG) · Theme ตรงกับ Brand (token เดียวทั้งเว็บ)
- [x] Desktop / Tablet / Mobile responsive สมบูรณ์ (ไม่มี horizontal overflow ที่ 375/768/1024/1440) · Mobile Menu ทำงาน
- [x] Solution Navigation ทำงาน · Project Filter ทำงาน (state ใน URL) · Project Detail ทำงาน · Related Project ทำงาน
- [x] Contact Information ถูกต้อง (D1/D24 ยืนยันแล้ว) · Google Maps แสดงผล (embed ทางการของ ESI)
- [x] ไม่มี Broken Link · ไม่มี Console Error · ไม่มี Missing Image (audit ตรวจทั้งหมด)
- [x] SEO Meta ครบทุกหน้า (Lighthouse SEO 100) · Accessibility (axe 0 violations, Lighthouse 100)
- [ ] Production Build ผ่าน · เว็บไซต์ Deploy ได้

## 6. วิธีสั่งงานในโปรเจกต์นี้

ตัวอย่างคำสั่งที่ใช้กับ Claude (skill จะโหลดเองเมื่ออยู่ในโฟลเดอร์นี้):

- `ทำ Phase 1` — สร้างโปรเจกต์และพื้นฐานทั้งหมดตาม checklist
- `ทำ Hero section ตาม mockup` — ทำเฉพาะ section (ควรทำ Phase 1–2 ก่อน)
- `เพิ่ม project ใหม่: <ชื่อ>, ลูกค้า <...>, ประเภท <cctv>, ...` — เพิ่มข้อมูลใน `src/data/projects.ts`
- `เทียบหน้า Home กับ mockup แล้วแก้จุดที่ต่าง` — QA เชิงภาพ
- `เตรียม deploy ขึ้น Netlify` — Phase 8 ส่วน hosting

เมื่อ Phase ใดเสร็จ ให้ Claude ติ๊ก checkbox และอัปเดต "สถานะปัจจุบัน" ด้านบนของไฟล์นี้
