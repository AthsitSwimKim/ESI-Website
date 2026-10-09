# แผนพัฒนาเว็บไซต์ ESI — Corporate Website Redesign

> **สถานะปัจจุบัน:** งานฝั่งเว็บไซต์และ Final visual QA เสร็จแล้ว 🟡 — copy TH/EN ครบ, ภาพ Hero/About/Industries ครบ, ภาพโครงการที่หายหรือความละเอียดต่ำถูกแทนด้วยภาพประกอบที่ระบุประเภทชัดเจน, เพิ่ม trust evidence จากข้อมูลอ้างอิงจริง, เก็บ Mobile/Project case study แล้ว · typecheck/lint/test/build/audit ผ่าน · **ยังไม่ deploy ตามคำสั่งเจ้าของโครงการ** เหลือ ESI ตรวจอนุมัติ copy/ภาพประกอบ, ส่งรูปถ่ายจริงทดแทนเมื่อมี, เลือก hosting และ deploy จริง
> **อัปเดตล่าสุด:** 2026-10-09 — ปรับ Solutions ตาม Company Profile เพิ่ม Brand Partners/ภาพต้นฉบับจากสไลด์ เปลี่ยน Hero เป็นภาพแท่นขุดเจาะที่เจ้าของให้ และใช้ภาพถ่ายจริงพร้อม license ใน Industries · เจ้าของอนุมัติ commit/push ไปที่ `SolFrontend` (ไม่ deploy)
> **คู่มือ agent:** `AGENTS.md` ที่ root — ทุกเครื่องมืออ่านไฟล์เดียวกัน (`CLAUDE.md` ชี้มาที่ไฟล์นี้) · skill `.claude/skills/esi-website/` โหลดอัตโนมัติใน Claude Code
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
| ภาษา    | EN เป็นหลัก + สวิตช์ TH/EN — copy อังกฤษและไทยครบทั้ง site แล้ว รอ ESI ตรวจอนุมัติถ้อยคำขั้นสุดท้าย                 |
| หน้าตา  | **ยึดตาม mockup หน้า Home** ทุก section แล้วขยาย design language เดียวกันไปหน้าอื่น (รายละเอียดใน `design-spec.md`) |
| หน้า    | Home, About, Solutions (+7 detail ตาม Company Profile), Industries, Projects (+detail), Contact, 404               |
| Deploy  | `npm run build` → `dist/` ขึ้น Vercel / Netlify / Cloudflare Pages / Apache / Nginx ได้ทันที                        |

## 2. หลักการทำงานทุก Phase

1. เริ่มงานทุกครั้ง: อ่านสถานะในไฟล์นี้ → เปิด `design-spec.md` section ที่จะทำ **พร้อมรูป mockup crop** → เปิด `content.md` สำหรับข้อความ
2. ทำตามลำดับ Phase (พื้นฐาน → global components → Home → หน้าอื่น) เพราะทุกหน้าใช้ component ร่วมกัน
3. ข้อความ/ข้อมูลทั้งหมดอยู่ใน `src/data` — ห้าม hardcode ใน JSX
4. ทุก Phase ต้องผ่าน **เกณฑ์ผ่าน** ของตัวเองก่อนไป Phase ถัดไป (typecheck + build ผ่าน, ไม่มี console error, เทียบกับ mockup แล้ว)
5. ทำเสร็จให้ติ๊ก checkbox ในไฟล์นี้ และบันทึกการตัดสินใจใหม่ ๆ ในตารางข้อ 3

## 3. ประเด็นที่ตัดสินใจแล้ว / ต้องยืนยันกับ ESI

ค่าเริ่มต้นด้านล่างจะถูกใช้ทันทีถ้าไม่มีการแก้ — ยืนยันหรือเปลี่ยนได้ทุกเมื่อ

| #   | ประเด็น                                                                                                                                                                                                               | ค่าเริ่มต้นที่ใช้                                                                                                                                                                                                                                                                                                                                                                               | สถานะ                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| D1  | **ข้อมูลติดต่อไม่ตรงกัน** — spec: 69/13 ถ.จันทอุดม ต.เชิงเนิน อ.เมือง ระยอง 21000 / 038-623-000 / info@esi-th.com — mockup footer: 55/9 ม.3 ต.ตาสิทธิ์ อ.ปลวกแดง 21140 / +66 (0) 38 683 615-8 / info@esi.co.th        | ใช้ตาราง Contact ใน spec (§34) — **ยืนยันแล้วจากเว็บเดิม esi-th.com** (ที่อยู่/โทร/แฟกซ์ 038-623-001/อีเมล/ชื่อไทย/เลขผู้เสียภาษี 0215560000858 ตรงกัน)                                                                                                                                                                                                                                         | ✅ ยืนยันแล้ว (2026-09-22)               |
| D2  | Footer ใน mockup มี Certifications (ISO 9001 / ISO 27001) แต่ spec ไม่กล่าวถึง                                                                                                                                        | ไม่ใส่จนกว่าจะได้ไฟล์ใบรับรองจริง (ห้ามใส่ badge ปลอม) — คอลัมน์ 4 ของ footer ใช้ Solutions links ตาม spec                                                                                                                                                                                                                                                                                      | ⏳ รอ ESI                                |
| D3  | Footer ใน mockup มี Blog / Careers                                                                                                                                                                                    | ไม่ทำ — ไม่อยู่ใน sitemap (spec §8)                                                                                                                                                                                                                                                                                                                                                             | ✅ ตัดสินใจแล้ว                          |
| D4  | หน้า Home ใน spec มี section "Why ESI" แต่ mockup ไม่มี                                                                                                                                                               | ทำตาม spec (ใส่ระหว่าง Featured Projects กับ Process) ออกแบบเป็น dark section ให้เข้ากับ mockup                                                                                                                                                                                                                                                                                                 | ✅ ตัดสินใจแล้ว                          |
| D5  | TH/EN switch มีใน header แต่ spec ไม่มี copy ภาษาไทย                                                                                                                                                                  | สร้างระบบ i18n จริง (ไม่ใช้ library) — UI strings และเนื้อหาทุกหน้ามี TH/EN ครบ; Section title คงเป็นภาษาอังกฤษตาม visual identity; ภาษาไทยเรียบเรียงให้เป็นภาษาธุรกิจ ไม่แปลตรงตัว                                                                                                                                                                                                             | ✅ copy ครบ · ⏳ รอ ESI อนุมัติ          |
| D6  | รูปภาพ (hero, about, industries ×5, projects, page heroes) — mockup ใช้ภาพ AI                                                                                                                                         | ใส่ภาพใหม่ครบทุกช่อง: Hero 1, About 1, Industries 5 และภาพประกอบโครงการ 13 รายการที่เดิมหาย/เล็ก/มีความเสี่ยงด้านลิขสิทธิ์; เหลือรูปโครงการเดิมของ ESI 9 รายการ · ภาพโครงการที่สร้างใหม่ติดป้าย “ภาพประกอบ / Illustrative image” ทั้ง card และ detail และไม่อ้างว่าเป็นภาพหน้างานจริง                                                                                                           | ✅ ครบสำหรับเปิดใช้ · ⏳ รอรูป ESI แทน   |
| D7  | โลโก้ต้นฉบับเป็น PNG พื้นขาว                                                                                                                                                                                          | ทำเวอร์ชันพื้นโปร่งใส (น้ำเงิน/ขาว) ไว้ใน skill assets แล้ว — ขอไฟล์ SVG/AI ต้นฉบับถ้ามี                                                                                                                                                                                                                                                                                                        | ⏳ ขอไฟล์ vector                         |
| D8  | Project มีชื่อแค่ 3 โครงการ (spec ตัวอย่างใช้ `id: 15`)                                                                                                                                                               | **ใส่ 22 โครงการจริง** จากหน้า Site Reference ของเว็บเดิม (2017–2024) ใน `src/data/projects.ts` — ชื่อปรับเป็นรูปแบบ "ลูกค้า – ระบบ", scope ตามข้อความเดิม, สถานที่บางส่วนอนุมาน (`// to confirm`); ลูกค้าที่ไม่ใช่อุตสาหกรรม (รีสอร์ต/สำนักงาน/หน่วยงานรัฐ) จัดในหมวด Industrial Infrastructure                                                                                                | ✅ ได้ข้อมูลแล้ว — รอ ESI ตรวจรายละเอียด |
| D9  | Social media (LinkedIn, Facebook, YouTube) ไม่มี URL                                                                                                                                                                  | Facebook: facebook.com/engineeringsystemintegration (จากเว็บเดิม) · LinkedIn/YouTube ยังไม่มี → ไอคอนซ่อนอัตโนมัติ                                                                                                                                                                                                                                                                              | ✅ บางส่วน (2026-09-22)                  |
| D10 | Domain / hosting ยังไม่ระบุ                                                                                                                                                                                           | Domain จริงคือ **esi-th.com** (เว็บเดิมเป็น WordPress) → `siteUrl = https://esi-th.com`; ต้องยืนยันว่าจะ deploy ทับ domain เดิมและ hosting ที่ใช้                                                                                                                                                                                                                                               | ✅ domain ยืนยัน · ⏳ hosting            |
| D11 | Font ไม่ระบุใน spec                                                                                                                                                                                                   | Display: **Kanit** (bold italic uppercase — รองรับไทย, เอียงตามโลโก้) · Body: **Inter + Noto Sans Thai**                                                                                                                                                                                                                                                                                        | ✅ เสนอใช้ (เปลี่ยนได้)                  |
| D12 | Contact form                                                                                                                                                                                                          | ไม่ทำฟอร์ม — ใช้ปุ่ม `mailto:` + `tel:` ตาม spec §35 แนะนำ (ถ้าต้องการฟอร์มจริงค่อยเพิ่ม EmailJS/Formspree ภายหลัง)                                                                                                                                                                                                                                                                             | ✅ ตัดสินใจแล้ว                          |
| D13 | Google Maps                                                                                                                                                                                                           | ใช้ iframe embed จากที่อยู่ ไม่ต้องใช้ API key                                                                                                                                                                                                                                                                                                                                                  | ✅ ตัดสินใจแล้ว                          |
| D14 | Header บน Hero                                                                                                                                                                                                        | ใช้พื้นขาวตาม mockup (spec อนุญาตโปร่งใสได้ แต่ mockup เป็นสีขาว) เมื่อ scroll เพิ่ม shadow + blur                                                                                                                                                                                                                                                                                              | ✅ ตัดสินใจแล้ว                          |
| D15 | Library ที่ spec ระบุเป็น optional (Swiper, React Helmet Async)                                                                                                                                                       | ไม่ใช้ — ใช้ CSS scroll-snap และ React 19 native `<title>/<meta>` แทน (ลด dependency)                                                                                                                                                                                                                                                                                                           | ✅ ตัดสินใจแล้ว                          |
| D16 | Linter — template create-vite 9 เปลี่ยนมาใช้ oxlint แทน ESLint                                                                                                                                                        | ใช้ oxlint ตาม template (`npm run lint`) + Prettier (+ tailwind plugin) สำหรับ format                                                                                                                                                                                                                                                                                                           | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D17 | การจัดการ 404 สำหรับ slug/URL ที่ไม่มี                                                                                                                                                                                | ใช้ route `loader` โยน `Response 404` → root `errorElement` แสดง `NotFoundPage` ใน layout ปกติ (มี header/footer, ไม่มี CTA band)                                                                                                                                                                                                                                                               | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D18 | Favicon / tab icon                                                                                                                                                                                                    | **ใช้ไฟล์ที่ลูกค้าให้** (`esi-logo-tab.png` — สี่เหลี่ยมมุมมนพื้นขาว + wordmark) ทำมุมโปร่งใสแล้วสร้าง `favicon-32.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (ต้นฉบับใน skill assets) — แทน E monogram ที่ทำไว้ก่อน                                                                                                                                                          | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D19 | ลิงก์ "Contact" ในเมนู header ซ้ำกับปุ่ม "Contact ESI" ที่อยู่ติดกัน                                                                                                                                                  | **เอาออกจาก header/เมนูมือถือ** (ใช้ `headerNav`) — ปุ่ม Contact ESI เป็นทางเข้าหน้า Contact; footer Quick Links ยังมี Contact ตามเดิม (mockup/spec มีทั้งคู่ แต่ลูกค้าตัดสินใจตัด)                                                                                                                                                                                                             | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D20 | Google Maps embed                                                                                                                                                                                                     | **ใช้ embed URL ทางการที่ลูกค้าส่งมา** (Share → Embed a map) ซึ่งมี place ID ของ Google Business ของ ESI → หมุดขึ้นชื่อบริษัทจริง, มุมมองดาวเทียม (`5e1`) · เก็บพิกัด 12.68721, 101.2745016 ไว้ใน data สำหรับ schema ภายหลัง + ลิงก์ "Open in Google Maps"                                                                                                                                      | ✅ ตัดสินใจแล้ว (2026-09-29)             |
| D21 | Header ตอน scroll — spec ระบุ white + backdrop blur                                                                                                                                                                   | **ขาวทึบทั้งสองสถานะ** (ลูกค้าเห็นว่าแบบโปร่ง 90% + blur ดูเป็นสีเทาบน hero และทำให้ panel โลโก้ดูเป็นกรอบ) คงเงาตอน scroll                                                                                                                                                                                                                                                                     | ✅ ตัดสินใจแล้ว (2026-09-22)             |
| D22 | รูปในเว็บเดิมบางรูปเป็นของบุคคลที่สาม (hotlink จาก henkel.co.th, kaohoon.com, LinkedIn, Google, ggcplc.com ฯลฯ)                                                                                                       | ไม่พึ่ง hotlink ในงาน final — โครงการที่รูปหาย/เล็ก/มีความเสี่ยงใช้ภาพประกอบใหม่และระบุว่าเป็นภาพประกอบอย่างชัดเจน; คงรูปเดิมเฉพาะไฟล์ที่อยู่ในชุดสื่อของ ESI และเหมาะกับการแสดงผล                                                                                                                                                                                                              | ✅ ปรับแล้ว (2026-09-30)                 |
| D23 | **เว็บเดิม esi-th.com มีสคริปต์แปลกปลอมฝังอยู่** — ทุกโพสต์ (22/22) มี obfuscated JavaScript ที่เปิดลิงก์ `ushort.observer` (รูปแบบมัลแวร์ WordPress)                                                                 | ดึงมาเฉพาะข้อความ/รูป โดยตัด `<script>` ทิ้งทั้งหมด — เว็บใหม่ไม่มีโค้ดนี้ · **แจ้ง ESI ให้ตรวจ/ล้างเว็บเดิมและเปลี่ยนรหัสผ่าน WordPress**                                                                                                                                                                                                                                                      | ⚠️ แจ้งลูกค้าแล้ว (2026-09-29)           |
| D24 | **Google Business ของ ESI แสดงที่อยู่ผิด** — การ์ดบนแผนที่ขึ้น "69/13 ถนนสุขุมวิท นครระยอง 45 ตำบลท่าประดู่" แต่ที่อยู่จริงคือ "69/13 ถนนจันทอุดม ตำบลเชิงเนิน อำเภอเมืองระยอง ระยอง 21000" (ลูกค้ายืนยัน 2026-09-29) | **เว็บใหม่ถูกต้องแล้ว** ใช้ถนนจันทอุดมทุกจุด (footer, Contact, SEO) · หมุดบนแผนที่ปักถูกตำแหน่ง — **ESI ต้องแก้ที่อยู่ในหน้า Google Business เอง** (Google Maps → จัดการโปรไฟล์ธุรกิจ → แก้ไขที่อยู่) เพื่อให้การ์ดบนแผนที่ตรงกับเว็บ                                                                                                                                                           | ✅ ยืนยันแล้ว · ⏳ รอ ESI แก้ฝั่ง Google |
| D25 | รูปที่เว็บเดิมฝังลิงก์จากเว็บบริษัทอื่น (Henkel, kaohoon, Google Maps ฯลฯ)                                                                                                                                            | ลูกค้าเคยอนุญาตให้ใช้ (2026-09-29) แต่รอบ Final visual QA เปลี่ยนรูปที่เล็กหรือมีความเสี่ยงส่วนใหญ่เป็นภาพประกอบใหม่แล้ว; รูปจากบุคคลที่สามไม่ควรถูกมองว่าเป็นหลักฐานหน้างาน และควรแทนด้วยภาพที่ ESI เป็นเจ้าของเมื่อได้รับไฟล์                                                                                                                                                                 | ✅ ลดความเสี่ยงแล้ว                      |
| D26 | หน้า Projects แสดง 22 การ์ดรวดเดียว + บรรทัด "22 / 22 projects shown"                                                                                                                                                 | **ลบบรรทัดนับออก ใส่ pagination แทน (ลูกค้าเลือกแบบ B-1 วันที่ 2026-09-30)** — 9 การ์ด/หน้า (3 แถวเต็มพอดี) · แถบล่างกริด: ซ้าย "Showing 1–9 of 22 projects" ขวาเป็นปุ่มหน้า · **ปุ่มเป็นวงกลม** ซึ่งเป็นข้อยกเว้นจาก design-spec §1 ที่ใช้มุม 4px ทั้งเว็บ (ลูกค้าสั่ง — ตั้งใจให้เด่น) · หน้าอยู่ใน URL `?page=2` กด back ได้ · เปลี่ยนตัวกรอง = กลับหน้า 1 · เหลือหน้าเดียวจะซ่อนปุ่มทั้งแถบ | ✅ ลูกค้าเลือกแล้ว (2026-09-30)          |
| D27 | ภาพที่สร้างใหม่สำหรับ Project case study อาจถูกเข้าใจผิดว่าเป็นภาพหน้างานจริง                                                                                                                                         | เพิ่ม field `imageKind: 'illustration'` ใน data และแสดงป้าย “ภาพประกอบ / Illustrative image” บนการ์ดและหน้ารายละเอียด พร้อมข้อความอธิบายว่าเป็นภาพที่สร้างเพื่อสื่อประเภทงาน ไม่ใช่ภาพจากไซต์ลูกค้า                                                                                                                                                                                             | ✅ ตัดสินใจแล้ว (2026-09-30)             |
| D28 | Trust evidence ต้องมีน้ำหนักแต่ห้ามสร้างตัวเลข/ใบรับรองที่ ESI ยังไม่ยืนยัน                                                                                                                                           | แสดงเฉพาะหลักฐานที่คำนวณย้อนกลับได้จากข้อมูลจริงใน repo: 22 project references, 6 solution areas, 5 industry groups และช่วงผลงานที่เผยแพร่ 2017–2024; ไม่ใส่ ISO, จำนวนลูกค้า, uptime หรือจำนวนปีประสบการณ์ที่ไม่มีเอกสารรองรับ                                                                                                                                                                 | ✅ ตัดสินใจแล้ว (2026-09-30)             |

### ข้อมูลที่ต้องขอจาก ESI (content needed)

**D29 (2026-10-09):** เจ้าของให้ยึด `ESi Profile Company_R7 copy.pptx` สไลด์ 5–11 เป็นข้อมูล Solutions: PA/GA, LAN/WAN, PABX/Telephone, CCTV, Access Control, Radio และ Video Wall รวม 7 กลุ่ม; ถอด Cybersecurity/Maintenance จากหน้า Solution แต่เก็บประวัติผลงานเดิมไว้ ใช้รูปต้นฉบับ 35 ภาพและโลโก้ 51 แบรนด์จากสไลด์ ไม่เพิ่ม dealer/certification claims หน้า Video Wall ไม่มี Brand Partners เพราะสไลด์ไม่ระบุ · รายละเอียดที่ `docs/company-profile-solutions.md`

**D30 (2026-10-09):** เจ้าของให้เปลี่ยนภาพ Hero หน้าแรกเป็นแท่นขุดเจาะจากไฟล์ `maros_1680x645.jpg` ที่ส่งมา ใช้ภาพต้นฉบับ 1680×645 เก็บที่ `/images/hero/maros-offshore.jpg` คง navy gradient/ข้อความ/CTA เดิม และไม่เปลี่ยนภาพพื้นหลังหน้าอื่น ภาพนี้ใช้สื่อบริบทอุตสาหกรรม ไม่อ้างว่าเป็นโครงการของ ESI

> ✅ ตรวจ Hero ใหม่ TH/EN ที่ 375/768/1024/1440 แล้ว ภาพโหลดครบและข้อความอ่านชัด · typecheck/lint/20 tests/build ผ่าน · audit สะอาด 18 routes × 4 ความกว้าง (axe WCAG 2 A/AA 0 violations) · ยังไม่ได้ commit/deploy การเปลี่ยนแปลงนี้

> ปรับตำแหน่งตามเจ้าของเพิ่มเติม: Desktop ตั้งแต่ 1024px เลื่อนชั้นภาพไปขวา 12% พร้อม mask ไล่ขอบซ้ายให้กลืนกับพื้น navy; Tablet/Mobile คงตำแหน่งเดิม ตรวจภาพจริง TH/EN เพิ่มที่ 1900px ด้วย

**D31 (2026-10-09):** เจ้าของให้เปลี่ยนภาพอุตสาหกรรม 5 ช่องเป็นภาพถ่ายจริงจากตะวันตกที่ได้รับอนุญาต ใช้ภาพทะเลเหนือ, BASF Ludwigshafen, Rostock power station, BMW Leipzig และ Rotterdam Container Terminal ภายใต้ CC BY/CC BY-SA พร้อมเครดิต/แหล่งที่มา/license ใน Home, About และ Industries; asset WebP เก็บในเว็บ ไม่ hotlink และไม่สื่อว่าเป็นภาพหน้างาน ESI · รายการสิทธิ์ที่ `public/images/industries/LICENSES.md`

> ✅ ตรวจภาพ/เครดิต TH/EN ใน Home และ Industries ที่ 375/768/1024/1440 ผ่าน รวม mobile horizontal scroll และ disclosure เครดิต · typecheck/lint/21 tests/build ผ่าน · audit สะอาด 18 routes × 4 ความกว้าง · ยังไม่ได้ commit/deploy รอบนี้

- [x] ยืนยันที่อยู่ / โทร / อีเมล (D1) — ตรงกับเว็บเดิม · Facebook ได้แล้ว (D9) — [ ] LinkedIn/YouTube ถ้ามี
- [ ] **ESI แก้ที่อยู่ในโปรไฟล์ Google Business ให้เป็น ถ.จันทอุดม ต.เชิงเนิน (D24)** — ข้อมูลบนเว็บถูกต้องแล้ว
- [x] รูปภาพสำหรับเปิดใช้: Hero, About, Industries 5 ภาพ, Project cover และ page hero ครบแล้ว
- [x] รายการ Project — ได้ 22 โครงการจากเว็บเดิม (เนื้อหาครบแล้ว ตรวจซ้ำกับหน้ารายละเอียดทุกโพสต์ 2026-09-29)
- [ ] ESI ตรวจชื่อลูกค้า/สถานที่ที่ทำเครื่องหมาย `to confirm`
- [ ] (ถ้ามี) รูปถ่ายจริงจาก ESI เพื่อแทนภาพประกอบโครงการ 13 รายการ; เว็บแสดงป้ายกำกับภาพประกอบไว้แล้วจนกว่าจะเปลี่ยน
- [x] รูปความละเอียดต่ำ Long Son, Lenzing T3, Senior Aerospace, SCG แก่งคอย และ Edehege ถูกแทนด้วยภาพประกอบ WebP 1200×800 แล้ว
- [x] Copy ภาษาไทยครบทุกหน้าแล้ว
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

- [x] อัปเดตตาม Company Profile (2026-10-09): 7 Solution พร้อม copy TH/EN, ภาพจากสไลด์/gallery ดูภาพเต็ม, Brand Partners บน Home/overview/detail และปรับ nav/footer/sitemap ตาม data; บริการเดิม Cybersecurity/Maintenance ถูกถอดตามคำสั่งเจ้าของ

- [x] `SolutionsPage` (overview): PageHero + intro + 7 rich cards (ภาพจากสไลด์, icon, ชื่อ, คำอธิบาย, Learn more) + Brand Partners + Process (reuse) + CTA
- [x] `SolutionCard` variant `rich` (ทำไว้ตั้งแต่ Phase 3) · `SolutionFeatures` (checklist grid) · `RelatedProjects` (shared, ซ่อนเองเมื่อไม่มีผลงาน — ใช้ต่อใน Phase 6)
- [x] `SolutionDetailPage` template: PageHero + breadcrumb → Overview (2 คอลัมน์ + รูปต้นฉบับเต็มสัดส่วน) → What we deliver (features จาก Company Profile) → Systems & Equipment gallery → Brand Partners ตามสไลด์ → Industries served → `RelatedProjects` (เฉพาะ category ที่ตรง, สูงสุด 3) → prev/next solution → CTA; slug ไม่ถูกต้อง → 404
- [x] Nav dropdown / mobile submenu / footer / overview ดึงรายการจาก `services.ts` โดยอัตโนมัติ (ทดสอบด้วยการเพิ่ม service ชั่วคราวแล้วลบออก)

**เกณฑ์ผ่าน:** ทั้ง 7 route `/solutions/*` เปิดได้และเนื้อหาถูกต้อง · related projects แสดงเฉพาะที่มี category ตรง (ซ่อนถ้าไม่มี) · การเพิ่ม service ใหม่ใน data ทำให้ nav/footer/overview อัปเดตเอง

> ✅ **อัปเดตผ่านแล้ว 2026-10-09** — typecheck/lint/20 tests/build ผ่าน · audit สะอาด 18 routes × 4 ความกว้าง (375/768/1024/1440), axe WCAG 2 A/AA 0 violations · ตรวจภาพจริง Desktop และ Mobile 375×667, สลับ TH/EN, ภาพต้นฉบับ/โลโก้โหลดครบ, dropdown keyboard/Escape และ route ที่ถอดออกเป็น 404 · เวอร์ชันนี้ยังไม่ได้ commit หรืออัปเดต Vercel Demo

> ✅ **ผ่านแล้ว 2026-09-29** — ทดสอบใน headless Chrome ครบ 6 route: title/breadcrumb/h1 ถูกต้อง, จำนวน features ตรง spec (9/8/7/7/7/8), industries chips, related projects 3 รายการต่อหน้า, prev/next วนรอบ, CTA band ครบ · slug มั่ว → 404 (ไม่มี CTA) · เพิ่ม service ที่ 7 ชั่วคราว → dropdown/drawer/footer/overview ขึ้นเป็น 7 และ route ใหม่เปิดได้ แล้วลบออก · ไม่มี console error · typecheck/lint/build ผ่าน · แก้ระหว่างทาง: intro หน้า overview ซ้ำกับ lead ใน hero (เขียนใหม่ให้ต่างกัน), หัวข้อ Overview เคยซ้ำชื่อ solution, placeholder SVG ย้าย label ไปมุมบนซ้ายให้เล็กลงเพราะทับ h1 ใน PageHero

### Phase 6 — Projects (≈ 1–2 sessions)

- [x] `ProjectsPage`: PageHero → `FilterTabs` (All + 6 categories พร้อมจำนวน, state ใน URL `?category=`) → grid การ์ดแนวตั้ง 3/2/1 → `AnimatePresence` ตอนกรอง → `EmptyState` · รองรับ `?industry=<slug>` (chip ถอดได้ + ปุ่มสลับอุตสาหกรรมอื่น) · param ที่ไม่รู้จักถูกมองข้าม
- [x] `ProjectCard` variants `horizontal` (Home/related) / `vertical` (grid — chips, ชื่อ, client·location, คำอธิบาย)
- [x] `ProjectDetailPage`: PageHero แบบ split (ชื่อ/สถานะทางซ้าย + รูปโครงการสีจริงขนาดใหญ่ทางขวา; Mobile แสดงรูปก่อน) → meta strip (Client/Industry/Location/Services/Year) → Overview (+ partners) → Scope → Solution cards → Gallery (ถ้ามี) → Related Projects → CTA; slug ไม่ถูกต้อง → 404
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

- [x] เปลี่ยน placeholder ครบ — Hero/About/Industries ใช้ภาพใหม่, Project cover ครบ 22 รายการ; 13 รายการที่รูปเดิมหาย/เล็ก/เสี่ยงลิขสิทธิ์ใช้ภาพประกอบ WebP 1200×800 พร้อมป้ายกำกับชัดเจน · ทุกรูปมี `width/height` และ `loading="lazy"` ยกเว้น hero (`fetchPriority="high"`)
- [x] ตรวจ responsive ทุกหน้า — `npm run audit` เช็ค horizontal overflow ทุก route ที่ 375/768/1024/1440 (0 รายการ) + ดูภาพจริงที่ 375/768/1024/1440 · **cross-browser: ทดสอบ Chromium แล้ว — Firefox/Safari ต้องเปิดดูบนเครื่องจริง (ไม่มีในเครื่องนี้)**
- [x] Accessibility pass — axe-core WCAG 2 A/AA: **0 violations ทั้ง 16 route** · Lighthouse accessibility **100 ทุกหน้า** (แก้ heading order ในหน้า Projects) · alt/width/height ครบทุกรูป · keyboard + focus ring + reduced-motion ตรวจแล้วตั้งแต่ Phase 2–3
- [x] SEO pass — title/description/canonical/OG ต่างกันทุกหน้า (แก้ meta ซ้ำซ้อนระหว่าง `index.html` กับ `<Seo>`), h1 เดียวต่อหน้า, sitemap 34 URL + robots.txt สร้างอัตโนมัติ, Lighthouse SEO **100** · `siteUrl = https://esi-th.com` (ยืนยันก่อน deploy ถ้าเปลี่ยน domain)
- [x] Performance — Lighthouse mobile จาก production build: **Home 89 / Projects 92 / Solution detail 91** (เป้า 85) · Accessibility 100 · Best Practices 100 · SEO 100 · CLS ≤ 0.014, TBT 0 ms · route-level code splitting + WebP + lazy loading ทำงาน
- [x] เตรียมไฟล์ SPA rewrite **ครบทุก hosting** แล้ว (Netlify/Cloudflare `public/_redirects` · Vercel `vercel.json` · Apache `public/.htaccess` · Nginx `nginx.conf.example`) พร้อม cache header — **รอ ESI เลือก hosting** (ไฟล์ที่ไม่ใช้ไม่รบกวนกัน) · วิธีตั้ง `base` สำหรับ sub-path อยู่ใน README
- [x] `README.md` — scripts ทั้งหมด, วิธีเพิ่ม Project/Service/รูป (พร้อมขนาดรูป), โครงสร้างโปรเจกต์, ตาราง deploy ต่อ hosting, quality gates
- [x] Production build ผ่าน + `npm run audit` สะอาด: 17 routes × 4 ความกว้าง, axe WCAG 2 A/AA 0 violations, ไม่มี broken image/link, overflow หรือ console error · หลัง deploy ให้ตรวจ deep link บน hosting ซ้ำอีกครั้ง

**เกณฑ์ผ่าน:** ผ่าน Definition of Done ทุกข้อ · deploy ขึ้น hosting ทดสอบแล้ว deep link ทุก route เปิดได้

> 🟡 **2026-09-30** — งานฝั่งโค้ดและ Final visual QA เสร็จแล้ว: copy TH/EN ครบ, ภาพครบทุกช่อง, เพิ่ม trust evidence, ปรับ Mobile/Project case study, audit สะอาด (17 routes × 4 ความกว้าง), Lighthouse baseline 89–92/100/100/100, deploy config และ README ครบ
> เหลือฝั่ง ESI: **(1) ตรวจอนุมัติ copy/ภาพประกอบ และส่งรูปถ่ายจริงมาแทนเมื่อมี (2) เลือก hosting (3) สั่ง deploy จริง**
> ข้อที่ยังทำไม่ได้ก่อน deploy: cross-browser บน Safari จริงและทดสอบ deep link บน hosting

---

## 5. Definition of Done (spec §61)

- [x] ทุกหน้าเปิดใช้งานได้ และทุก Route ทำงานถูกต้องใน local/production build
- [x] ESI Logo แสดงถูกต้อง (header/footer/favicon/OG) · Theme ตรงกับ Brand (token เดียวทั้งเว็บ)
- [x] Desktop / Tablet / Mobile responsive สมบูรณ์ (ไม่มี horizontal overflow ที่ 375/768/1024/1440) · Mobile Menu ทำงาน
- [x] Solution Navigation ทำงาน · Project Filter ทำงาน (state ใน URL) · Project Detail ทำงาน · Related Project ทำงาน
- [x] Contact Information ถูกต้อง (D1/D24 ยืนยันแล้ว) · Google Maps แสดงผล (embed ทางการของ ESI)
- [x] ไม่มี Broken Link · ไม่มี Console Error · ไม่มี Missing Image (audit ตรวจทั้งหมด)
- [x] SEO Meta ครบทุกหน้า (Lighthouse SEO 100) · Accessibility (axe 0 violations, Lighthouse 100)
- [x] Production Build ผ่าน · deploy config พร้อมทุก hosting ที่รองรับ
- [ ] Deploy จริงและตรวจ deep link บน hosting (ยังไม่ทำตามคำสั่งเจ้าของโครงการ)

## 6. วิธีสั่งงานในโปรเจกต์นี้

ตัวอย่างคำสั่งที่ใช้กับ Claude (skill จะโหลดเองเมื่ออยู่ในโฟลเดอร์นี้):

- `ทำ Phase 1` — สร้างโปรเจกต์และพื้นฐานทั้งหมดตาม checklist
- `ทำ Hero section ตาม mockup` — ทำเฉพาะ section (ควรทำ Phase 1–2 ก่อน)
- `เพิ่ม project ใหม่: <ชื่อ>, ลูกค้า <...>, ประเภท <cctv>, ...` — เพิ่มข้อมูลใน `src/data/projects.ts`
- `เทียบหน้า Home กับ mockup แล้วแก้จุดที่ต่าง` — QA เชิงภาพ
- `เตรียม deploy ขึ้น Netlify` — Phase 8 ส่วน hosting

เมื่อ Phase ใดเสร็จ ให้ Claude ติ๊ก checkbox และอัปเดต "สถานะปัจจุบัน" ด้านบนของไฟล์นี้
