# PHP Login ใน Dev

ชุดนี้ทำงานเฉพาะเครื่อง ไม่เชื่อม Chaiyo และไม่อ่าน credentials ของบัญชี production
ที่เตรียมไว้ก่อนหน้า บัญชี Dev, MySQL user, password, token, config, logs และ data directory
อยู่ใต้ `.esi-admin/dev/` ซึ่ง Git ignore และอยู่นอก PHP web root

เจ้าของอนุมัติ opt-in profile สำหรับ Chaiyo เพิ่มเติม (2026-11-10, D57) แยกคำสั่ง
จาก Local ชุดนี้ ดู [การเชื่อม Chaiyo](chaiyo-connection.md) สำหรับสถานะและข้อกำหนด
การเรียก `npm run dev`, audit และ `test:auth` ยังใช้ฐาน Local เท่านั้น

## เริ่มใช้งานบน Windows x64

```powershell
node scripts/dev-auth-install.mjs
npm run dev
```

`npm run dev` เปิด PHP และ Vite ให้พร้อมกัน แล้วเข้า `/admin/login`
ถ้าเปิด PHP ไว้แล้วจะตรวจ internal key ก่อนใช้ต่อ ไม่ปิด process ที่คำสั่งนี้ไม่ได้สร้าง
Vite ใช้ `localhost:5173` แบบ strict port จึงไม่เผลอสลับ port หรือเปิดออก LAN
รหัสของบัญชี `esi_dev_admin` อยู่ใน `.esi-admin/dev/dev-admin-credentials.txt`
ไม่ใช่บัญชี `esi_admin` บน Hosting และไม่ใช้รหัสผ่านร่วมกัน

คำสั่ง install ดาวน์โหลด ZIP ทางการของ PHP 8.3.36-1 NTS x64 และ MariaDB 11.4.13 x64
ตรวจ SHA-256 จากผู้เผยแพร่ก่อนแตกไฟล์ ไม่ใช้ MSI ไม่แก้ PATH และไม่ติดตั้ง Windows service
ต้องมี Microsoft Visual C++ Redistributable x64 ตามข้อกำหนด PHP
ถ้ามีไฟล์ ZIP อยู่แล้ว คำสั่งจะตรวจ checksum ซ้ำและใช้ไฟล์เดิม

หากต้องการเปิดเฉพาะ PHP/Database ใช้ `node scripts/dev-auth.mjs start`
คำสั่งนี้สร้าง secrets สุ่มแยกของ Dev ครั้งแรก แล้วรักษาค่าเดิมเมื่อเริ่มใหม่
เปิด MariaDB ที่ `127.0.0.1:13307` และ PHP ที่ `127.0.0.1:8787` เท่านั้น
root DB ใช้เฉพาะขั้นสร้าง schema และ seed บัญชีครั้งแรก ส่วน HTTP API ใช้ `esi_dev_app`
ที่มี SELECT/INSERT/UPDATE/DELETE เฉพาะฐาน `esi_dev` ไม่มีสิทธิ์แก้ฐานอื่น
Ctrl+C หยุด PHP และ MariaDB ที่คำสั่งนั้นสร้าง หากใช้ Database ที่เปิดไว้อยู่แล้วจะไม่ปิดแทน

หากต้องการเตรียม config ก่อนเริ่ม server ใช้ `node scripts/dev-auth.mjs prepare`
ห้ามอัปโหลด `.esi-admin/`, scripts เตรียมเครื่อง, config หรือรหัส Dev ไป Hosting

## การเชื่อม Vite กับ PHP

`bridge.json` ภายในโฟลเดอร์ส่วนตัวเก็บ endpoint และ internal key สำหรับ Vite เท่านั้น
ไม่มีการนำ key ไปใส่ใน client bundle ส่วน config PHP ระบุผ่าน `ESI_ADMIN_CONFIG`
และต้องอยู่นอก `server/php/public/` PHP เปิด `pdo_mysql` จาก private `php.ini`

ค่า allowed origins เริ่มที่ `http://localhost:5173` การเรียก API ข้าม origin หรือไม่มีสิทธิ์
ต้องถูกปฏิเสธ ระบบ Login/Auth รัน PHP จริงและใช้ตาราง `admin_users` / `admin_sessions`
ของ MariaDB จริง ไม่ใช้ mock หรือรหัสที่ hardcode ในโค้ด

## ใช้ใน audit และ integration tests

`scripts/dev-auth.mjs` export `prepareDevAuth()`, `getDevRuntimePaths()` และ
`startDevAuth({ root, privateRoot, origins, port: 0 })`
คืน `endpoint`, `internalKey`, `username`, `password`, `credentialsFile`, `php`, `phpIni`,
`configFile` และ async `stop()` ข้อมูล secrets ที่คืนสำหรับ test ต้องไม่ log

เมื่อใช้ privateRoot ของ audit แต่ละรอบ จะได้ MySQL instance/data/secrets แยกกัน
เลือก port ว่างอัตโนมัติ ใช้ schema `esi_dev` ของ instance นั้น และไม่เขียนทับ bridge
ของ Dev ที่เจ้าของใช้อยู่ โดยใช้ portable binaries ชุดเดียวจาก workspace หลัก
สำเนา audit ต้องมี `database/001_admin_schema.sql` ให้ PHP initializer อ่านด้วย

`stop()` รอให้ child processes ที่สร้างจบก่อนคืนค่า เพื่อให้ลบสำเนา audit บน Windows ได้
ไม่ลบ data directory หรือ reset password อัตโนมัติ หากข้อมูล Dev ไม่ตรงจะหยุดพร้อม error
เพื่อไม่เขียนทับบัญชีเดิม

## แหล่งแพ็กเกจ

- [PHP Windows downloads](https://www.php.net/downloads.php?os=windows&version=8.3)
- [MariaDB official archive](https://archive.mariadb.org/mariadb-11.4.13/winx64-packages/)
- [MariaDB ZIP installation](https://mariadb.com/docs/server/server-management/install-and-upgrade-mariadb/installing-mariadb/binary-packages/installing-mariadb-windows-zip-packages)
