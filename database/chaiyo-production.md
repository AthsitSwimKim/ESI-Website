# ติดตั้งเว็บไซต์และ Admin บน Chaiyo

ชุดนี้มี PHP API สำหรับ Login/Logout, จัดการผลงาน, Publish/Unpublish, อัปโหลดภาพและ Audit Log
ต้องใช้ PHP **8.1 ขึ้นไป** พร้อม PDO MySQL, Apache 2.4 mod_rewrite และ HTTPS
ไม่ต้องใช้ Node.js บน Hosting

## ตำแหน่งไฟล์ — สำคัญ

แตก ZIP ที่ **โฟลเดอร์หลักของโดเมน ซึ่งมี httpdocs อยู่ข้างใน** ไม่ใช่แตกทุกอย่างลง httpdocs:

```
โฟลเดอร์โดเมน/
  httpdocs/                    ← เว็บสาธารณะจาก ZIP
    api/index.php
    .htaccess
    images/uploads/.htaccess
    index.html
  .esi-admin-production/        ← PHP และข้อมูลส่วนตัวจาก ZIP
    src/
    seed.json
    config.example.php
    config.php                 ← อัปโหลดไฟล์ส่วนตัวแยกต่างหาก
    data/                      ← ระบบสร้างเมื่อเริ่มใช้งาน
```

1. สำรอง httpdocs และฐานข้อมูลเดิมก่อนแทนที่ไฟล์ เลือก PHP 8.1+ ของโดเมนใน Plesk
2. อัปโหลด/แตก ZIP ตามโครงสร้างข้างต้น ให้รวมไฟล์ซ่อน `.htaccess`, `.user.ini` และโฟลเดอร์ `.esi-admin-production` ด้วย
3. อัปโหลด **ไฟล์ config.php ส่วนตัวที่เตรียมในเครื่อง** เข้า `.esi-admin-production/config.php`
   ไฟล์นี้ใช้รหัสผ่าน MySQL ที่เจ้าของกรอกแล้ว ไม่อยู่ใน ZIP และห้ามวางใน httpdocs
   ถ้าตั้งเอง ให้คัดลอก config.example.php เป็น config.php กรอก password และ internal_key แบบสุ่มอย่างน้อย 32 ตัวอักษร
4. PHP ต้องอ่านโฟลเดอร์ `.esi-admin-production` และเขียน `.esi-admin-production/data` กับ `httpdocs/images/uploads` ได้
   ถ้า Plesk จำกัด open_basedir ให้ใช้ขอบเขตโฟลเดอร์โดเมน ไม่จำกัดเฉพาะ httpdocs
5. เปิด `https://esi-th.com/api/admin/auth/session` ต้องได้ JSON ที่มี `authenticated: false`
   จากนั้นเปิด `/admin-portal-update` และล็อกอินบัญชี `esi_admin` ด้วยรหัสผ่าน Admin เดิม (คนละรหัสกับ MySQL)
6. ตรวจสร้าง Draft → Preview → Publish → หน้า Projects/รายละเอียด → Audit Log → Logout

ข้อมูลบัญชี/session/Audit Log ใช้ MySQL `esithcom_website` ที่ Chaiyo ตารางเดิม ไม่สร้างบัญชีหรือ reset รหัสผ่าน
ผลงาน Draft/Published และ outbox เก็บใน `.esi-admin-production/data/projects/state.json` บน Hosting
ภาพอัปโหลดอยู่ใน `httpdocs/images/uploads` ชื่อไฟล์เป็น hash และปิดการรัน script
หน้าเว็บและ sitemap อ่านผลงาน Published จาก PHP ได้ทันทีเมื่อเปิดหน้าใหม่ ไม่ต้อง build ZIP ทุกครั้ง

## อัปเดตครั้งต่อไปและสำรองข้อมูล

ZIP ไม่มี config.php, data หรือภาพที่อัปโหลดจาก production จึงไม่เขียนทับข้อมูลเหล่านี้เมื่ออัปเดต
**ห้ามลบโฟลเดอร์เดิมก่อนอัปโหลด** และห้ามแทนที่ state.json ด้วยข้อมูลทดสอบจากเครื่อง
ระบบใช้ seed.json เฉพาะตอนยังไม่มี state; เมื่อมีข้อมูลจริงแล้วการอัปโหลด seed ใหม่ไม่เปลี่ยนผลงานเดิม
สำรอง `.esi-admin-production/config.php`, `.esi-admin-production/data`, `httpdocs/images/uploads`, `.esi-visitor-count` และฐานข้อมูล MySQL ควบคู่กัน
สำรอง state ก่อนทุก mutation ใน data/projects/backups; ควรกำหนดรอบเก็บสำรองบน Hosting และลบสำรองเก่าตามนโยบายของเจ้าของ

## ถ้าติดตั้งไม่ครบ

- API ตอบ HTML: ตรวจ `.htaccess` / mod_rewrite และ document root ว่าใช้ httpdocs
- API ตอบ `CONFIGURATION_ERROR`: ตรวจ private folder/config, PHP version/extensions, สิทธิ์/open_basedir และ Plesk PHP error log
- API ตอบ `FORBIDDEN`: ใช้ HTTPS และ origin `https://esi-th.com` หรือ `https://www.esi-th.com`
- เปิด `/api/admin/auth/authorize` หรือ `/api/admin/audit-events` ได้ 404 เป็นพฤติกรรมที่ถูกต้อง ช่องทาง bridge ของ Dev ไม่เปิดบน production

MySQL ใช้ provider legacy transport ที่เจ้าของอนุมัติไว้โดยชัดเจน ไม่มี TLS fallback อัตโนมัติ
การทดสอบแพ็กเกจทำกับฐานข้อมูลแยกในเครื่อง ไม่มีข้อมูลทดสอบส่งไปฐานจริง
