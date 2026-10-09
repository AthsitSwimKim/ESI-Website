# ESI Website — Content & Data

All copy the site needs, in one place, so `src/data/*.ts` is filled from here rather than
invented on the spot. Legend:

- ✅ **confirmed** — taken verbatim from the project spec (`spec-source.md`) or the mockup.
- ✏️ **draft** — written to fill a gap the spec leaves; keep it, but mark it in the data file
  with a `// DRAFT – ESI to approve` comment and list it in `PLAN.md` § "content needed".

English is the primary language (the mockup is English). Thai (`th`) fields are optional and
fall back to English until ESI supplies Thai copy — see `architecture.md` § i18n.

---

## 1. Company (`src/data/company.ts`) ✅

| Field | Value |
|---|---|
| Legal name | Engineering System Integration Co., Ltd. |
| Short name | ESI |
| Tagline | Reliable Industrial Communication & System Integration Solutions. |
| Address | 69/13 Chanthaudom Road, Choengnoen Subdistrict, Muang Rayong District, Rayong 21000, Thailand |
| Phone | 038-623-000 (`tel:+6638623000`) |
| Email | info@esi-th.com |
| Business hours | Monday – Friday, 08:00 – 17:00 |
| Thai legal name | บริษัท เอ็นจิเนียริ่ง ซิสเต็ม อินทีเกรชั่น จำกัด |
| Thai address | 69/13 ถนนจันทอุดม ตำบลเชิงเนิน อำเภอเมืองระยอง จังหวัดระยอง 21000 |
| Fax | 038-623-001 |
| Tax ID | 0215560000858 |
| Social | Facebook `https://www.facebook.com/engineeringsystemintegration` · LinkedIn / YouTube not published → empty (icon hidden) |
| Certifications | none published — keep `[]` (see design-spec § Footer) |
| Site URL | `https://esi-th.com` (the existing domain; old site is WordPress) |
| Office location | 12.68721, 101.2745016 — map link `https://goo.gl/maps/QZkF68qDPFv`; the embed uses ESI's official Google "Embed a map" URL (carries their Business place ID, satellite view) |

> ✅ **Address confirmed (D24, 2026-09-29):** ESI confirmed **69/13 Chanthaudom Road, Choengnoen
> Subdistrict** is correct — the data files are right and must not be changed. Their Google
> Business listing still shows an old address ("ถนนสุขุมวิท นครระยอง 45 ตำบลท่าประดู่"), which is
> why the map's info card disagrees with the page text; ESI fixes that on Google's side.

> ✅ Confirmed 2026-09-22 against the existing website esi-th.com (Home / Contact / Reference
> pages). The mockup footer's different address/phone/email (55/9 Moo 3, Pluak Daeng ·
> +66 38 683 615-8 · info@esi.co.th) is AI-generated filler — ignore it (PLAN.md D1).

Company description (About section on Home; the footer uses the tagline above) ✅ (mockup). The
Thai `description.th` in `company.ts` is ESI's own About text from the old site (typos fixed) ✅.

> Engineering System Integration Co., Ltd. (ESI) delivers reliable industrial communication and
> system integration solutions for mission-critical environments. With proven engineering
> expertise and deep industry experience, we design, build, and support systems that keep your
> operations connected, secure, and performing at their best.

## 2. Navigation (`src/data/navigation.ts`) ✅

Main (`mainNav`): Home `/` · About `/about` · Solutions `/solutions` (children = the six solutions) ·
Industries `/industries` · Projects `/projects` · Contact `/contact`.
Header and mobile drawer use `headerNav` = main nav **without Contact** — the **Contact ESI**
button → `/contact` covers it (D19, 2026-09-22). Language switch: **TH | EN**.
Footer quick links = full main nav (incl. Contact); footer solutions = the six solutions.

## 3. Hero (Home) ✅

- Image: owner-supplied `maros_1680x645.jpg` (2026-10-09), copied unchanged to
  `public/images/hero/maros-offshore.jpg`. Offshore platform context; no claim that this is
  an ESI project. Replaces the Home image only; inner-page backgrounds stay unchanged.
- H1: `ENGINEERING THE CONNECTION THAT INDUSTRY RELIES ON.`
- Sub: `Reliable Industrial Communication & System Integration Solutions.`
- Primary CTA: `Explore Solutions` → `/solutions` · Secondary: `View Projects` → `/projects`

## 4. Solutions / Services (`src/data/services.ts`)

Updated 2026-10-09. The owner supplied **ESi Profile Company_R7 copy.pptx** and explicitly
requested the seven solution groups from slides 5–11, with Cybersecurity and Maintenance
removed as solution pages. This replaces the former six-service drafts.

| Slide | English | Thai | Slug |
| --- | --- | --- | --- |
| 5 | Public Address & General Alarm | ระบบประกาศเสียงและสัญญาณเตือนภัย | `paga` |
| 6 | Industrial LAN/WAN Networks | ระบบเครือข่ายอุตสาหกรรม LAN/WAN | `industrial-network` |
| 7 | PABX & Telephone Systems | ระบบตู้สาขาโทรศัพท์ PABX และโทรศัพท์ IP | `communication` |
| 8 | CCTV & Surveillance | ระบบกล้องวงจรปิดและเฝ้าระวัง | `cctv-security` |
| 9 | Access Control Systems | ระบบควบคุมการเข้าออก | `access-control` |
| 10 | Radio Communication Systems | ระบบวิทยุสื่อสาร | `radio` |
| 11 | Video Wall | ระบบจอภาพ Video Wall | `video-wall` |

Descriptions, taglines and features in `services.ts` are edited from the slide prose and
diagrams with complete Thai translations. `sourceSlide` records the source. Do not restore
the former generic draft copy. The overview includes the profile's core-business references
to hazardous-area hardware, engineering management and communication consultation (slide 3).

Images: 35 original system diagrams/product images from slides 5–11. They are shown whole
with `object-contain` and linked to the full image. Video Wall's example photo comes from
slide 11. These source images are not presented as new ESI project evidence.

Brand Partners: 51 distinct logos from the profile, deduplicated across solutions and shown
in their original colours. Source filenames/slides/dimensions are in `profileAssets.ts`.
Home displays 12 representative brands, Solutions displays all, and detail pages display
their slide's branding-family list. Video Wall has no brand list in the deck, so none is added.

Historical project categories remain intact. Only four existing categories map directly to
current solutions (network, communication, CCTV, access-control); PA/GA, Radio and Video Wall
do not automatically inherit unrelated project references. The old service routes render 404.

See `docs/company-profile-solutions.md` for the detailed source record.

## 5. Industries (`src/data/industries.ts`)

Names, slugs and typical scope are ✅ (spec §24–25); descriptions are ✏️.

| Industry | Slug | Typical scope ✅ | Description ✏️ |
|---|---|---|---|
| Oil & Gas | `oil-gas` | Network, Communication, Explosion-Proof CCTV, Security, Maintenance | Communication and surveillance systems for terminals, tank farms and processing sites, including explosion-proof equipment for hazardous areas. |
| Petrochemical | `petrochemical` | Industrial Network, CCTV, Access Control, Communication, Cybersecurity | Plant-wide network, security and communication systems integrated to the demanding standards of petrochemical complexes. |
| Power & Energy | `power-energy` | Network, Communication, CCTV, Security, Maintenance | Reliable connectivity and monitoring for power plants and energy infrastructure where downtime is not an option. |
| Manufacturing | `manufacturing` | Network, Access Control, CCTV, Cybersecurity | Secure factory networks, access control and surveillance that support safe, efficient production. |
| Industrial Infrastructure | `industrial-infrastructure` | Communication, Network, Security, Monitoring | Communication, networking and security systems for ports, utilities, industrial estates and large facilities. |

Section title ✅: `INDUSTRIES WE SERVE`.

Industry images updated 2026-10-09 at the owner's request: real licensed European photographs
replace the five generated industry illustrations. Sources, authors and licenses are recorded
in `src/data/industryPhotos.ts` and `public/images/industries/LICENSES.md`. All derivatives keep
the listed CC BY/CC BY-SA license. Show credits wherever the photos are used; do not claim the
pictured facilities are ESI projects, customers or endorsements.

## 6. Projects (`src/data/projects.ts`) ✅

**22 real references** taken from the old site's "Site Reference" pages
(`https://esi-th.com/reference/`, pages 1–3, retrieved 2026-09-22) — the data file is the
source of truth; each entry keeps a `source` URL for tracing. Titles were normalised to
"Client – System"; `scope` keeps ESI's wording. Locations marked `// to confirm` are inferred.
Photos are placeholders until ESI supplies them (D6). **Do not add fictional projects.**

Featured on Home (mockup order) ✅: Map Ta Phut Tank Terminal – CCTV Explosion-Proof (2024) ·
Long Son Petrochemical Complex – Network System (2020) · Henkel Thailand – Access Control (2019).

Other references (newest first): Senior Aerospace Thailand (access control) · GC Glycol EA Plant
(CCTV maintenance) · Lenzing T3 lyocell plant (construction time-lapse CCTV) · D.Enterprise
(firewall + site-to-site VPN) · GC ORP Olefins Reconfiguration (network; EPC TTCL) · MOCD2 Map Ta
Phut Olefins (network + IP telephone; EPC TTCL) · Gulf UT Uthai power plant (PABX service) · GGC
Thai Fatty Alcohols (CCTV) · PTT GC5 Aromatics 2 (CCTV) · SCALE 360 / LQID 360 (CCTV, Cisco
network & wireless, face-recognition access, card printing) · Linde ASU3 Map Ta Phut (CCTV) ·
IRPC (CCTV) · Greenlake Resort Chiang Mai (PABX) · SCG Kaeng Khoi cement (access control) · Orisma
office (access control) · Government House Phakdi Bodin Building (network + telephone) · Edehege
factory (network + security) · Solar Center office (CCTV, access, network, firewall, AV) ·
Klongluang Utilities 120 MW SPP (WAN/LAN, CCTV, firewall, PABX; owner EGCO, EPC TTCL).

Clients outside the five spec industries (resort, offices, government) are filed under
`industrial-infrastructure` — the spec's industry list is fixed (D8).

**Photos (2026-09-29).** The old site's media library holds 18 files; 12 are project photos and
**all 12 are used**, re-encoded to WebP 3:2 in `public/images/projects/`: PTT GC5 Aromatics,
Government House, Klongluang Utilities, Orisma office, Solar Center (+ a second shot in its
gallery), Greenlake Resort, Linde ASU3, IRPC, Senior Aerospace, SCG Kaeng Khoi, Edehege — the
last three are only ~300px wide, kept because a real site photo beats a placeholder; ask ESI for
the originals. The other **10 projects** keep the navy placeholder: for each of them the old site
hotlinked someone else's image (Henkel, kaohoon, ggcplc, LinkedIn, Google …), not ESI's to reuse (D22).
The remaining 6 media files are not project photos — two icon-tree banners carrying the old
contact block, two "businessman drawing a hologram" stock shots and two location maps — so the
hero / about / industry images still need real photography from ESI.

**Verified 2026-09-29:** every reference post's full text was re-read through the WordPress REST
API — the data file already carries everything they contain (title, owner/EPC/contractor, system
list). Nothing further to extract. ⚠️ Those posts also contain injected malware scripts (D23);
only plain text and ESI-hosted images were taken.

Filter categories ✅: All · Network · CCTV · Access Control · Communication · Cybersecurity ·
Maintenance → slugs `network` `cctv` `access-control` `communication` `cybersecurity` `maintenance`.

Section titles ✅: Home `FEATURED PROJECTS`; page `Projects` / lead ✏️ *Selected references from
the industrial sites we have connected, secured and supported.*

## 7. About (`src/data/about.ts`)

Home section title ✅ `ABOUT ESI`; paragraph = company description (§1).

Feature grid (Home) ✅ (mockup):
| Title | Text |
|---|---|
| Reliability You Can Trust | Robust solutions engineered for uptime and operational excellence. |
| Engineering Expertise | Certified engineers with deep domain knowledge and practical experience. |
| End-to-End Integration | From design and supply to installation and commissioning. |
| Lifecycle Support | Ongoing maintenance and support to maximize system performance. |

About page sections ✅ (structure) — copy ✏️ draft, all to be approved by ESI:
- **Company Introduction** ✏️: Engineering System Integration Co., Ltd. (ESI) is a Rayong-based
  engineering and system integration company serving Thailand's industrial heartland. We
  specialise in industrial communication, networking, security and integrated systems for
  plants and facilities where reliability is non-negotiable.
- **Company Overview** ✏️: From our base in Rayong we support customers across the Eastern
  Seaboard and beyond — from petrochemical complexes and tank terminals to power plants and
  manufacturing sites — as a single accountable partner from design to long-term support.
  (Stats strip: only if ESI provides real numbers, e.g. years in operation, projects delivered.)
- **Expertise** ✅: the six solutions.
- **Mission** ✏️: To deliver industrial communication and system integration solutions that
  keep our customers' operations connected, secure and reliable.
- **Vision** ✏️: To be the trusted system integration partner for industry in Thailand and the region.
- **Core Values** ✏️: Reliability · Engineering Excellence · Safety · Integrity · Long-Term Partnership
- **Why ESI** ✅ (§8), **Industries Served** ✅ (§5), CTA ✅.

## 8. Why ESI (`src/data/whyEsi.ts`)

Title ✅ `WHY PARTNER WITH ESI`. Items ✅ (names); one-line descriptions ✏️:

| Item | Description ✏️ |
|---|---|
| Industrial Experience | Proven track record in oil & gas, petrochemical, power and manufacturing environments. |
| Engineering Expertise | Certified engineers who design to standards and understand plant operations. |
| Reliable Solutions | Systems specified and built for uptime in demanding, hazardous conditions. |
| End-to-End Integration | One partner from consultation and engineering to installation and commissioning. |
| Long-Term Support | Maintenance contracts and technical support for the full system lifecycle. |
| Professional Service | Clear communication, documentation and delivery you can plan around. |

## 9. Process (`src/data/process.ts`) ✅ (mockup descriptions)

Title ✅ `OUR PROCESS` · subtitle ✅ `From concept to reliable operation.`

| # | Step | Description |
|---|---|---|
| 01 | Consult | Understand your needs and operational goals. |
| 02 | Engineering | Design solutions tailored to your requirements. |
| 03 | Supply | Source and deliver quality products on time. |
| 04 | Installation | Professional installation with safety and precision. |
| 05 | Commissioning | Rigorous testing and system validation. |
| 06 | Maintenance | Ongoing support to ensure reliability and uptime. |

## 10. CTA band ✅

`HAVE AN INDUSTRIAL SYSTEM CHALLENGE?` / `LET'S ENGINEER THE RIGHT SOLUTION TOGETHER.` — button `Contact ESI` → `/contact`.

## 11. Contact page

Title ✅ `Contact` · lead ✏️ *Talk to our engineers about your site, system or maintenance
requirements.* · info = §1 · buttons: `Email us` (`mailto:info@esi-th.com?subject=Inquiry%20from%20ESI%20website`),
`Call 038-623-000` (`tel:+6638623000`). Map: Google Maps embed of the §1 address (no API key):
`https://www.google.com/maps?q=<url-encoded address>&output=embed`.
Form: **none** (spec §35 recommends mailto for the frontend-only scope).

## 12. 404 ✅

`404 – PAGE NOT FOUND` / `The page you are looking for may have been moved or no longer exists.` / button `Back to Home`.

## 13. SEO (`src/data/seo.ts`)

- Site title ✅: `ESI | Industrial System Integration Thailand`
- Site description ✅: `Engineering System Integration Co., Ltd. provides industrial communication, network, security and system integration solutions.`
- Page title pattern: `<Page> | ESI` (Home uses the site title). OG image: `/images/og-cover.jpg` (1200×630, navy + logo + tagline — generate in Phase 8).
- Per-page descriptions ✏️: derive from the page lead/intro copy above, ≤ 160 characters.

## 14. Thai UI strings (`src/i18n/th.ts`) ✏️

The spec gives no Thai copy. Start with UI chrome only (nav, buttons, labels, footer headings)
and leave long-form content in English until ESI supplies translations:

| Key | EN | TH ✏️ |
|---|---|---|
| nav.home | Home | หน้าแรก |
| nav.about | About | เกี่ยวกับเรา |
| nav.solutions | Solutions | โซลูชัน |
| nav.industries | Industries | อุตสาหกรรม |
| nav.projects | Projects | ผลงาน |
| nav.contact | Contact | ติดต่อเรา |
| cta.contact | Contact ESI | ติดต่อ ESI |
| cta.exploreSolutions | Explore Solutions | ดูโซลูชัน |
| cta.viewProjects | View Projects | ดูผลงาน |
| cta.viewProject | View Project | ดูรายละเอียด |
| cta.viewAllProjects | View all projects | ดูผลงานทั้งหมด |
| cta.learnMore | Learn more | ดูเพิ่มเติม |
| cta.backHome | Back to Home | กลับหน้าแรก |
| footer.contactUs | Contact Us | ติดต่อเรา |
| footer.quickLinks | Quick Links | ลิงก์ด่วน |
| footer.solutions | Solutions | โซลูชัน |
| footer.rights | All rights reserved. | สงวนลิขสิทธิ์ |
| contact.address / phone / email / hours | Address / Phone / Email / Business Hours | ที่อยู่ / โทรศัพท์ / อีเมล / เวลาทำการ |
| projects.filter.all | All | ทั้งหมด |
| projects.empty | No projects in this category yet. | ยังไม่มีผลงานในหมวดนี้ |

Section titles stay in English in both languages unless ESI asks otherwise — they are part
of the visual identity (italic uppercase display type) in the mockup.
