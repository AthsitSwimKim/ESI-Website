# ESI Website Project Details — source spec (verbatim)

Extracted from `ESI_Website_Project_Details.docx` (Version 1.0, August 2026) — the client's
project specification. Kept verbatim (Thai/English as written) so the repo is self-contained.
Section numbers match the original document. Images referenced here live in `../assets/`:
`esi-logo-original.png` (document header) and `homepage-mockup.png` (appendix design reference).

ESI WEBSITE PROJECT DETAILS
Corporate Website Redesign
Engineering System Integration Co., Ltd.
> FRONTEND ONLY  •  REACT + TYPESCRIPT  •  NO BACKEND / NO DATABASE

| Project Type | Corporate / Industrial System Integration Website |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| Animation | Framer Motion |
| Data | Static TypeScript / JSON / Assets |

เอกสารรายละเอียดโครงการเว็บไซต์ ESI
Version 1.0  |  August 2026

# สารบัญโครงการ

1. ภาพรวมโครงการ
2. วัตถุประสงค์
3. แนวคิดการออกแบบ
4. Theme และ Brand Identity
5. Design Language
6. Technology Stack
7. ระบบที่ไม่มีในโครงการ
8. Website Sitemap
9. Route Structure
10-12. Global Layout / Header / Mobile Navigation
13-22. Home Page และรายละเอียด Section
23-25. About / Industries
26-30. Projects
31-35. Why ESI / Process / CTA / Contact
36-39. Google Maps / Footer / Static Data / Folder Structure
40-49. Responsive / Animation / SEO / Accessibility / Performance / Browser / 404
50-52. การเพิ่มข้อมูล / Deployment
53-60. Development Phases
61. Definition of Done
62. ผลลัพธ์สุดท้ายของโครงการ

## 1. ภาพรวมโครงการ

โครงการ ESI Corporate Website Redesign เป็นการปรับปรุงเว็บไซต์ของ Engineering System Integration Co., Ltd. ให้มีภาพลักษณ์ทันสมัย เป็นมืออาชีพ และสะท้อนความเชี่ยวชาญด้าน Industrial Communication, Engineering และ System Integration อย่างชัดเจน
เว็บไซต์ใช้โลโก้ ESI เป็นแกนหลักของแบรนด์ พร้อมโทนสีน้ำเงิน ขาว และ Navy Blue เพื่อสื่อถึงความน่าเชื่อถือ เทคโนโลยี ความแม่นยำ และงานวิศวกรรม
> Project Architecture
> ระบบทั้งหมดเป็น Frontend Website ไม่มีระบบหลังบ้าน ข้อมูลต่าง ๆ จัดเก็บในรูปแบบ TypeScript Object, JSON หรือ Static Assets ภายใน Project และสามารถ Build เป็น Static Website เพื่อนำขึ้น Hosting ได้โดยตรง

## 2. วัตถุประสงค์ของโครงการ

1. ปรับปรุงภาพลักษณ์เว็บไซต์ ESI ให้ทันสมัยและน่าเชื่อถือมากขึ้น
1. สื่อสารภาพลักษณ์ของ ESI ในฐานะบริษัท Engineering และ System Integrator
1. แสดงความเชี่ยวชาญของบริษัทด้าน Industrial Communication และ System Integration
1. แสดง Solution และ Service ของบริษัทอย่างเป็นระบบ
1. แสดง Project และ Site Reference ที่บริษัทเคยดำเนินงาน
1. เพิ่มความน่าเชื่อถือกับลูกค้าองค์กรและลูกค้ากลุ่มอุตสาหกรรม
1. ทำให้ผู้เข้าชมค้นหาข้อมูลบริการได้ง่ายและเข้าถึงช่องทางติดต่อได้รวดเร็ว
1. รองรับ Desktop, Tablet และ Mobile
1. รองรับการเพิ่มข้อมูล Project หรือ Service ในอนาคตผ่าน Static Data
1. ใช้เว็บไซต์เป็น Online Company Profile สำหรับนำเสนอลูกค้าได้ในระยะยาว

## 3. แนวคิดการออกแบบ

| Design Direction | Modern Industrial Technology |
|---|---|
| Brand Tone | Professional Engineering |
| System Character | System Integration |
| Visual Style | Corporate Technology |
| Experience | Clean, Premium, Reliable |

เว็บไซต์ควรดูทันสมัยแต่ยังคงความน่าเชื่อถือแบบองค์กร ไม่ใช้รูปแบบที่ดูเหมือน Template สำเร็จรูปทั่วไป และต้องสะท้อน Engineering, Industrial, Technology, Reliability, Connectivity, Security และ Professional Service

## 4. Theme และ Brand Identity

| สี | Hex | การใช้งาน |
|---|---|---|
| ESI Blue | #123B72 | สีหลักของแบรนด์ |
| Dark Navy | #061D38 | Hero Overlay, Footer, CTA |
| Secondary Blue | #1D65B7 | องค์ประกอบรอง |
| Accent Blue | #358FE8 | Button, Icon, Hover, Highlight |
| Light Background | #F5F8FC | พื้นหลัง Section |
| White | #FFFFFF | พื้นหลักและ Contrast |
| Text | #172033 | ข้อความหลัก |

## 5. Design Language

โลโก้ ESI มีลักษณะตัวอักษรเอียงและให้ความรู้สึกถึงการเคลื่อนไปข้างหน้า เว็บไซต์จึงใช้ Angular Design และเส้นเฉียงเป็น Signature Element ของแบรนด์
- Section Divider
- Card Corner
- Hero Graphic
- Button / CTA
- Image Mask
- Footer Pattern
- Network Line / Connectivity Decoration

Effect ต้องใช้เท่าที่จำเป็นเพื่อรักษาความ Clean, Modern, Premium, Industrial และ Technology โดยไม่ลดทอนความเป็น Corporate Website

## 6. Technology Stack

| Frontend Framework | React |
|---|---|
| Programming Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router DOM |
| CSS Framework | Tailwind CSS |
| Animation | Framer Motion |
| Icon | Lucide React |
| Optional | Swiper, React Helmet Async |

## 7. ระบบที่ไม่มีในโครงการ

- Backend API
- Node.js API / Express / NestJS
- Database (MySQL / PostgreSQL)
- Authentication / JWT
- Login / Register
- ระบบสมาชิก
- Admin Dashboard
- CMS
- ระบบเพิ่ม Project จาก Admin
- ระบบ Upload File ผ่านเว็บไซต์

## 8. Website Sitemap

```
ESI WEBSITE
├── Home
├── About
├── Solutions
│   ├── Industrial Network
│   ├── CCTV & Security
│   ├── Access Control
│   ├── Communication System
│   ├── Cybersecurity
│   └── Maintenance & Support
├── Industries
├── Projects
│   └── Project Detail
├── Contact
└── 404 Not Found
```

## 9. Route Structure

| / | Home Page |
|---|---|
| /about | About ESI |
| /solutions | Solutions Overview |
| /solutions/industrial-network | Industrial Network |
| /solutions/cctv-security | CCTV & Security |
| /solutions/access-control | Access Control |
| /solutions/communication | Communication System |
| /solutions/cybersecurity | Cybersecurity |
| /solutions/maintenance | Maintenance & Support |
| /industries | Industries |
| /projects | Projects |
| /projects/:slug | Project Detail |
| /contact | Contact |
| /* | 404 Not Found |

## 10. Global Layout

- Header
- Main Content
- Call To Action
- Footer

## 11. Header

Header ใช้แบบ Sticky Navigation โดยประกอบด้วย ESI Logo, Home, About, Solutions, Industries, Projects, Contact, ปุ่ม Contact ESI และ TH / EN Language Switch
- บริเวณ Hero สามารถใช้ Background โปร่งใสหรือสีขาวแบบ Minimal
- เมื่อ Scroll ให้เปลี่ยนเป็น White Background พร้อม Shadow และ Backdrop Blur
- ใช้ Smooth Transition เพื่อให้การเปลี่ยนสถานะดู Premium

## 12. Mobile Navigation

- แสดง ESI Logo และ Hamburger Menu
- Menu เปิดเป็น Mobile Drawer / Overlay
- รองรับ Home, About, Solutions, Industries, Projects, Contact และ Contact ESI
- Solutions สามารถมี Submenu ที่ Expand / Collapse ได้

## 13. Home Page

- Hero Section
- Solutions Section
- About ESI Section
- Industries Section
- Featured Projects Section
- Why ESI Section
- Process Section
- Call To Action
- Footer

## 14. Hero Section

Hero เป็น Section หลักของหน้า Home ใช้ภาพ Petrochemical Plant, Oil & Gas, Industrial Facility, Control System หรือ Engineering เป็น Background พร้อม Dark Blue Gradient Overlay และ Network Graphic บาง ๆ
> Hero Message
> ENGINEERING THE CONNECTION THAT INDUSTRY RELIES ON.
> Reliable Industrial Communication & System Integration Solutions.

- Primary CTA: Explore Solutions
- Secondary CTA: View Projects
- Animation: Fade In / Slide Up
- Background Zoom ช้า ๆ
- Network Graphic Animation แบบ subtle

## 15. Solutions Section

หัวข้อ: OUR SOLUTIONS
- Industrial Network
- CCTV & Security
- Access Control
- Communication System
- Cybersecurity
- Maintenance & Support

แต่ละ Solution แสดงเป็น Card พร้อม Icon, ชื่อ, คำอธิบาย และ Link ไปหน้า Detail โดยมี Hover Effect เช่น Card Move Up, Border Blue, Icon Scale และ Arrow Movement

## 16. Industrial Network

- Network Infrastructure
- Industrial Ethernet
- Fiber Optic Network
- LAN / WAN
- Network Switching
- Network Redundancy
- Industrial Communication
- Network Monitoring
- Network Integration

## 17. CCTV & Security

- Industrial CCTV
- IP CCTV
- Explosion-Proof CCTV
- Hazardous Area CCTV
- Video Management System
- Remote Monitoring
- CCTV Installation
- CCTV Maintenance

## 18. Access Control

- Door Access Control
- RFID
- Card Access
- Biometric
- Visitor Access
- Industrial Access Control
- Access Control Integration

## 19. Communication System

- IP Telephone
- PABX
- Industrial Telephone
- Intercom
- Communication Infrastructure
- PA System
- Communication Integration

## 20. Cybersecurity

- Firewall
- VPN
- Site-to-Site VPN
- Network Security
- Remote Access
- Industrial Network Security
- Security Integration

## 21. Maintenance & Support

- Preventive Maintenance
- Corrective Maintenance
- MA Contract
- System Inspection
- Troubleshooting
- System Support
- Training
- Technical Support

## 22. About ESI Section

ใช้ Layout แบบ 2 Column โดยฝั่งหนึ่งเป็นภาพ Engineer / Control Room / Industrial Plant / Network Control System และอีกฝั่งแสดงข้อมูลบริษัท
- Reliability You Can Trust
- Engineering Expertise
- End-to-End Integration
- Lifecycle Support

## 23. About Page

- Page Hero
- Company Introduction
- Company Overview
- Expertise
- Mission
- Vision
- Core Values
- Why ESI
- Industries Served
- Call To Action

## 24. Industries Section

หัวข้อ: INDUSTRIES WE SERVE
- Oil & Gas
- Petrochemical
- Power & Energy
- Manufacturing
- Industrial Infrastructure

แสดงเป็น Image Card พร้อม Hover: Image Zoom, Blue Overlay และ Arrow Animation

## 25. Industries Page

| Oil & Gas | Network, Communication, Explosion-Proof CCTV, Security, Maintenance |
|---|---|
| Petrochemical | Industrial Network, CCTV, Access Control, Communication, Cybersecurity |
| Power & Energy | Network, Communication, CCTV, Security, Maintenance |
| Manufacturing | Network, Access Control, CCTV, Cybersecurity |
| Industrial Infrastructure | Communication, Network, Security, Monitoring |

## 26. Featured Projects Section

หน้า Home แสดง Project สำคัญประมาณ 3-6 Project เพื่อสร้างความน่าเชื่อถือและทำให้ผู้เข้าชมเห็นประสบการณ์ของ ESI ได้รวดเร็ว
- Map Ta Phut Tank Terminal - CCTV Explosion-Proof
- Long Son Petrochemical Complex - Network System
- Henkel Thailand - Access Control

แต่ละ Card แสดง Project Image, Client, Project Name, Service, Industry, Short Description และ View Project

## 27. Projects Page

หน้า Projects แสดง Project ทั้งหมดในรูปแบบ Grid พร้อม Filter Category
- All
- Network
- CCTV
- Access Control
- Communication
- Cybersecurity
- Maintenance
| Desktop | 3 Cards ต่อแถว |
|---|---|
| Tablet | 2 Cards ต่อแถว |
| Mobile | 1 Card ต่อแถว |

## 28. Project Data

ข้อมูล Project เก็บใน src/data/projects.ts โดยไม่ใช้ Database
- Project ID
- Slug
- Title
- Client
- Category
- Industry
- Location
- Image
- Description
- Scope
- Gallery

## 29. Project Type

```
export interface Project {
  id: number;
  slug: string;
  title: string;
  client: string;
  categories: string[];
  industry: string;
  location: string;
  image: string;
  description: string;
  scope?: string[];
  gallery?: string[];
}
```

## 30. Project Detail Page

Route: /projects/:slug
- Project Hero
- Project Name
- Client
- Industry
- Location
- Project Overview
- Scope of Work
- Solution
- Project Gallery
- Related Projects
- Call To Action

## 31. Why ESI Section

หัวข้อ: WHY PARTNER WITH ESI
- Industrial Experience
- Engineering Expertise
- Reliable Solutions
- End-to-End Integration
- Long-Term Support
- Professional Service

## 32. Process Section

หัวข้อ: FROM CONCEPT TO RELIABLE OPERATION
| 01 | Consult |
|---|---|
| 02 | Engineering |
| 03 | Supply |
| 04 | Installation |
| 05 | Commissioning |
| 06 | Maintenance |

Desktop ใช้ Horizontal Timeline และ Mobile ใช้ Vertical Timeline

## 33. Call To Action Section

> CTA Message
> HAVE AN INDUSTRIAL SYSTEM CHALLENGE?
> LET'S ENGINEER THE RIGHT SOLUTION TOGETHER.
>
> Button: CONTACT ESI

## 34. Contact Page

- Contact Hero
- Company Information
- Address
- Phone
- Email
- Business Hours
- Google Map
- Contact Button
| Company | Engineering System Integration Co., Ltd. |
|---|---|
| Address | 69/13 Chanthaudom Road, Choengnoen Subdistrict, Muang Rayong District, Rayong 21000, Thailand |
| Phone | 038-623-000 |
| Email | info@esi-th.com |
| Business Hours | Monday - Friday, 08:00 - 17:00 |

## 35. Contact Form

เนื่องจากไม่มี Backend จึงไม่สร้าง Contact Form ที่ส่งข้อมูลเข้า Database โดยมีตัวเลือกดังนี้
- ใช้ mailto:info@esi-th.com เพื่อเปิด Email Client
- ใช้ External Service เช่น EmailJS หรือ Formspree หากต้องการฟอร์มจริง
> Recommended for Frontend-Only Scope
> ใช้ Email Button / mailto เพื่อรักษาขอบเขตโครงการให้เป็น Frontend Only แบบสมบูรณ์

## 36. Google Maps

ใช้ Google Maps Embed ผ่าน iframe เพื่อแสดงตำแหน่งสำนักงาน ESI โดยไม่ต้องมี Backend

## 37. Footer

- ESI Logo
- Company Name
- Company Description
- Address
- Phone
- Email
- Quick Links
- Solutions Links
- Social Media
- Copyright

ไม่แสดง Calendar, Search Widget หรือข้อความ Powered by WordPress

## 38. Static Data Structure

```
src/data/
├── projects.ts
├── services.ts
├── industries.ts
├── navigation.ts
└── company.ts
```

การแยกข้อมูลออกจาก Component ช่วยให้แก้ไข Content ได้ง่ายและลดการเขียนข้อมูลซ้ำใน JSX

## 39. Folder Structure

```
esi-website/
├── public/
│   └── images/
│       ├── hero/
│       ├── about/
│       ├── solutions/
│       ├── industries/
│       └── projects/
├── src/
│   ├── assets/logo/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── cards/
│   │   └── sections/
│   ├── pages/
│   ├── data/
│   ├── types/
│   ├── hooks/
│   ├── routes/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 40. Responsive Design

| Mobile | < 640px |
|---|---|
| Tablet | 640 - 1024px |
| Laptop | 1024 - 1440px |
| Large Desktop | > 1440px |

## 41. Mobile UX

- Mobile Navigation ใช้ Hamburger Menu
- Hero ลดความสูงและรักษาความอ่านง่าย
- Button สามารถใช้ Full Width ในจอเล็ก
- Solution / Project ใช้ 1 Card ต่อแถว
- Industry Card ใช้ 1 Card ต่อแถวหรือ Horizontal Scroll
- Process Timeline เปลี่ยนเป็นแนวตั้ง
- Footer เรียง Column ลงด้านล่าง

## 42. Animation

- Fade In
- Slide Up
- Image Zoom
- Card Hover
- Button Arrow Animation
- Navbar Transition
- Section Reveal
- Timeline Animation

Animation ต้องเรียบ Professional และไม่รบกวนการใช้งาน

## 43. Image Optimization

- ใช้ WebP หรือ AVIF สำหรับภาพทั่วไป
- Logo ใช้ SVG หากมีไฟล์ต้นฉบับ
- รูปนอก Hero ใช้ loading="lazy"
- ลดขนาดไฟล์ภาพก่อนนำขึ้นเว็บไซต์

## 44. SEO

- Page Title
- Meta Description
- Open Graph
- Canonical
| Example Title | ESI | Industrial System Integration Thailand |
|---|---|---|
| Example Description | Engineering System Integration Co., Ltd. provides industrial communication, network, security and system integration solutions. |  |

## 45. Accessibility

- Alt Text
- Keyboard Navigation
- Visible Focus
- Proper Button Element
- Semantic HTML
- ARIA Label
- Color Contrast
- Responsive Text

## 46. Semantic HTML

```
<header>
<nav>
<main>
<section>
<article>
<footer>
```

หลีกเลี่ยงการใช้ div ทุกตำแหน่งโดยไม่มีความหมาย เพื่อช่วยทั้ง SEO, Accessibility และโครงสร้างเอกสาร HTML

## 47. Performance

| Performance | 85 ขึ้นไป |
|---|---|
| Accessibility | 90 ขึ้นไป |
| Best Practices | 90 ขึ้นไป |
| SEO | 90 ขึ้นไป |

## 48. Browser Support

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari
- Mobile Chrome
- Mobile Safari

## 49. 404 Page

> 404 - PAGE NOT FOUND
> The page you are looking for may have been moved or no longer exists.
>
> Button: BACK TO HOME

## 50. การเพิ่ม Project ใหม่

ผู้ดูแล Code สามารถเพิ่ม Project ใหม่ผ่าน src/data/projects.ts จากนั้น Project Card และ Project Detail จะอ่านข้อมูลจาก Static Data โดยอัตโนมัติ
```
{
  id: 15,
  slug: 'new-project',
  title: 'New Industrial Project',
  client: 'Client Name',
  categories: ['network'],
  industry: 'Petrochemical',
  location: 'Rayong, Thailand',
  image: '/images/projects/new-project.webp'
}
```

## 51. การเพิ่ม Service

แก้ไขข้อมูลใน src/data/services.ts โดยสามารถเพิ่มชื่อ Service, Slug, Icon, Description, Features, Image และ Related Projects

## 52. Deployment

เว็บไซต์เป็น React Static Website สามารถ Build และนำขึ้น Hosting ได้โดยตรง
- Vercel
- Netlify
- Cloudflare Pages
- Apache
- Nginx
- Shared Hosting
- Company Server
```
npm run build

Output: dist/
```

## 53. Development Phase 1 - Project Foundation

- สร้าง React + TypeScript Project
- ติดตั้ง Vite
- ติดตั้ง Tailwind CSS
- ติดตั้ง React Router DOM
- ติดตั้ง Framer Motion
- ติดตั้ง Lucide React
- ตั้งค่า Font และ Color Theme
- สร้าง Folder Structure
- เพิ่ม ESI Logo

## 54. Development Phase 2 - Global Components

- Header
- Navbar
- Mobile Menu
- Footer
- Button
- Container
- Section Title
- Page Hero
- Breadcrumb

## 55. Development Phase 3 - Home Page

- Hero
- Solutions
- About ESI
- Industries
- Featured Projects
- Why ESI
- Process
- CTA

## 56. Development Phase 4 - About และ Industries

- สร้าง About Page
- สร้าง Industries Page
- เพิ่ม Content
- Responsive Layout
- Animation

## 57. Development Phase 5 - Solutions

- Solutions Overview
- Solution Card
- Solution Detail Template
- Service Data
- Related Projects

## 58. Development Phase 6 - Projects

- Projects Page
- Project Card
- Project Filter
- Project Data
- Project Detail
- Related Project

## 59. Development Phase 7 - Contact และ Utility

- Contact Page
- Google Maps
- Phone Link
- Email Link
- 404 Page
- Scroll To Top
- Breadcrumb

## 60. Development Phase 8 - Final Polish

- Responsive Testing
- Animation
- SEO
- Accessibility
- Image Optimization
- Performance Optimization
- Cross-Browser Testing
- Build Production
- Final QA

## 61. Definition of Done

- ทุกหน้าสามารถเปิดใช้งานได้
- ทุก Route ทำงานถูกต้อง
- ESI Logo แสดงถูกต้อง
- Theme ตรงกับ Brand
- Desktop Responsive สมบูรณ์
- Tablet Responsive สมบูรณ์
- Mobile Responsive สมบูรณ์
- Mobile Menu ทำงาน
- Solution Navigation ทำงาน
- Project Filter ทำงาน
- Project Detail ทำงาน
- Related Project ทำงาน
- Contact Information ถูกต้อง
- Google Maps แสดงผล
- ไม่มี Broken Link
- ไม่มี Console Error
- ไม่มี Missing Image
- SEO Meta พื้นฐานครบ
- Accessibility พื้นฐานครบ
- Production Build ผ่าน
- เว็บไซต์สามารถ Deploy ได้

## 62. ผลลัพธ์สุดท้ายของโครงการ

ESI Website จะเป็น Corporate Website รูปแบบใหม่ที่พัฒนาด้วย React + TypeScript และมีเฉพาะ Frontend ไม่มีระบบหลังบ้านและไม่มี Database
- Company Profile
- Industrial Solutions
- Engineering Services
- Industries
- Projects and References
- Company Credibility
- Contact Information
> Final Goal
> ภาพลักษณ์โดยรวมต้องทันสมัย น่าเชื่อถือ และสะท้อนความเป็น Engineering System Integration Company อย่างชัดเจน เว็บไซต์สามารถใช้เป็นเว็บไซต์หลักของ ESI และเป็น Online Company Profile สำหรับนำเสนอลูกค้าองค์กรได้ในระยะยาว

# ภาคผนวก: Design Reference

ภาพต้นแบบ Homepage ที่ใช้เป็นแนวทางด้าน Visual Direction ของโครงการ
