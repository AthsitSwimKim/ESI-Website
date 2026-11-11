# เชื่อม Database Chaiyo จาก Dev

เจ้าของอนุมัติการเชื่อมต่อวันที่ 2026-11-10 (D57) โดยหน้า Admin/API ยังทำงานบน
localhost ใช้ฐาน `esithcom_website` สำหรับบัญชีและ session เท่านั้น ข้อมูลผลงานและรูป
ยังเก็บในไฟล์ของโปรเจกต์ตามเดิม การเชื่อมต่อนี้ไม่ได้ deploy production Admin
หรือย้าย project storage เข้า MySQL

## สถานะที่ตรวจพบ

ตรวจ Plesk และ MySQL handshake จริงวันที่ 2026-11-10:

| รายการ                 | ค่า                                |
| ---------------------- | ---------------------------------- |
| Host                   | `mysql-5.5.chaiyohosting.com:3306` |
| Database               | `esithcom_website`                 |
| MySQL user             | `esi_webapp`                       |
| Server version         | `5.5.44-cll-lve`                   |
| TLS ใน MySQL handshake | ไม่เปิด (`CLIENT_SSL` เป็น 0)      |
| Plesk SSH access       | `Forbidden`                        |

Host นี้ใช้เชื่อม MySQL ได้ตามปกติ โปรไฟล์ที่เตรียมสำหรับ endpoint เดิมเลือก
`transport: "legacy"` อย่างชัดเจน: ข้อมูลระหว่าง PHP กับ MySQL ไม่เข้ารหัสด้วย TLS
การไม่มี TLS ไม่ได้หมายความว่า Database ใช้งานไม่ได้ และ SSH ไม่จำเป็นสำหรับ
การเชื่อม MySQL แบบปกตินี้ บัญชี `esi_webapp` ใช้เชื่อม Database ส่วน `esi_admin`
เป็นบัญชีล็อกอินแอป แยกกัน เจ้าของกรอกรหัสผ่าน MySQL ลงไฟล์ส่วนตัวเอง

ผลตรวจใช้งานจริงผ่านแล้ววันที่ 2026-11-10: connection เลือกฐาน `esithcom_website`
และพบบัญชี admin ที่ active 1 บัญชี Login ด้วย `esi_admin` ผ่าน 200, protected API
ผ่าน 200, Logout ผ่าน 200 และ API หลัง Logout ตอบ 401 ตรวจในฐาน Chaiyo พบ session
ของการทดสอบถูก revoke 1 รายการ ข้อมูลบัญชี/session ของ Dev จึงใช้ Chaiyo จริง
โดย project storage และรูปยังอยู่ใน Local

## เตรียมและตรวจ

```powershell
npm run prepare:chaiyo
npm run check:chaiyo
```

คำสั่งแรกเตรียม `.esi-admin/chaiyo/connection.json` ที่ Git ignore โดย password และ
`tlsCaFile` เริ่มว่าง ไม่เขียนทับไฟล์ที่มีอยู่แล้ว เจ้าของใส่รหัสผ่านของ **MySQL user
`esi_webapp`** ในช่อง `password` แล้วบันทึก โดยไม่ส่งรหัสผ่านในแชท

คำสั่งตรวจอ่าน MySQL greeting จากนั้นใช้ transport ที่ระบุในไฟล์เท่านั้น หากไม่มี
password จะหยุดก่อน authenticate ตรวจชื่อฐาน, charset, ตาราง auth และจำนวนบัญชี
admin ที่เปิดใช้งานด้วยคำสั่งอ่านอย่างเดียว ไม่มีการสร้าง schema, user, GRANT,
import, seed หรือแก้ข้อมูลบัญชี ผลตรวจระบุ `transport` และ `encrypted` ตามจริง
ไม่มีการเปลี่ยน bridge หากตรวจไม่ผ่าน

## เปิดใช้หลังตรวจผ่าน

```powershell
npm run dev:chaiyo
```

คำสั่งนี้เปิด PHP profile Chaiyo ที่ `127.0.0.1:8788` และสลับ Vite bridge หลังตรวจ
การเชื่อมต่อสำเร็จเท่านั้น ใช้ Vite `localhost:5173` ที่เปิดอยู่แล้วได้ หากเปิดใหม่
ให้ใช้ `npm run dev:frontend` อีก terminal แล้ว reload หน้า `/admin/login`

หยุดคำสั่ง `dev:chaiyo` ด้วย Ctrl+C เพื่อคืน bridge เดิม แล้วใช้ Local ต่อได้
หาก process ปิดผิดปกติจน bridge ค้าง ให้ `node scripts/dev-auth.mjs prepare`
ตั้งค่า bridge กลับ Local ก่อนเรียก `npm run dev` เมื่อเปลี่ยนรหัส MySQL ให้แก้
`connection.json` แล้วหยุด/เริ่ม `dev:chaiyo` ใหม่เพื่อสร้าง PHP config จากค่าล่าสุด

Profile มี internal key, private state และ cookie name แยกจาก Local ห้ามนำไฟล์
`.esi-admin/` ไปอัปโหลดหรือ commit เมื่อเปิดใช้สำเร็จ Login/Logout จะเขียน session
ลง Chaiyo ตามปกติ แต่การตรวจ `check:chaiyo` ไม่สร้าง session หรือแก้ last login

`npm run dev` ใช้ Local ตามเดิมและปฏิเสธการ reuse bridge ของ Chaiyo โดยไม่ตั้งใจ
Audit และ `test:auth` เปิด local instance/data ชุดแยกเท่านั้น ไม่รับโปรไฟล์ Chaiyo
มาใช้ทดสอบแก้ข้อมูล

## เลือก TLS เมื่อผู้ให้บริการรองรับ

หากเปิด TLS ให้เปลี่ยน `transport` เป็น `tls` และกำหนด absolute path ของ CA ที่
ได้รับจาก Chaiyo ใน `tlsCaFile` เก็บไฟล์ไว้นอก `public/` และ `dist/` โหมดนี้ตรวจ
CA/hostname และ TLS 1.2 ขึ้นไปก่อน authenticate และจะไม่ลดเป็น legacy อัตโนมัติ
หาก server ไม่ประกาศ TLS จะหยุดด้วย `SERVER_TLS_UNAVAILABLE`

MySQL ระบุว่ารุ่นก่อน 5.6.46 รองรับ TLSv1 เท่านั้น จึงอาจต้องปรับ server หรือใช้
endpoint/tunnel เพิ่มเติมก่อนใช้โหมดนี้ ดู [เอกสาร TLS ของ MySQL](https://dev.mysql.com/doc/mysql-security-excerpt/5.7/en/encrypted-connection-protocols-ciphers.html)
การเปลี่ยน host/port ต้องปรับตัวตรวจ endpoint ตามข้อมูลจริงก่อน

สิทธิ์ remote access เป็นคนละเรื่องกับการเข้ารหัส ดู [การตั้ง remote access ของ Plesk](https://docs.plesk.com/en-US/obsidian/administrator-guide/website-management/website-databases/setting-up-custom-access-rules.73491/)
ไม่มีการเปลี่ยนสิทธิ์บน Hosting หรือรีเซ็ตรหัสผ่าน Database user ในงานเชื่อมต่อนี้

ชุดตรวจที่ใช้: `npm run test:chaiyo` (9 checks), `npm run test:auth` (PHP 148 +
HTTP/PDO 118 checks), typecheck/lint/43 Vitest tests/build และ audit 22 routes × 4 widths
