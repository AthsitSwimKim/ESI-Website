# Admin Audit Log

เจ้าของสั่งทำ Audit Log ภายใน Admin (D58, 2026-11-11) เปิดที่ `/admin/audit-logs`
ใน Dev โดยใช้ตาราง `admin_events` เดิมของ Database profile ที่เลือก
Chaiyo ใช้ `esithcom_website` ส่วน Local/audit/tests ใช้ฐานแยกตามเดิม
ไม่มีบริการภายนอกหรือการ deploy production เพิ่ม

## เหตุการณ์ที่เก็บ

- Login สำเร็จ/ไม่สำเร็จ/ถูก rate limit และ Logout
- บันทึกร่าง สร้างผลงาน เผยแพร่ ยกเลิกเผยแพร่ และลบผลงาน
- อัปโหลดรูปที่ถูกบันทึกพร้อมผลงานสำเร็จ และการนำเข้าร่างเดิมจาก browser
- ความล้มเหลวของคำสั่งผลงานที่ผ่านการตรวจ session/CSRF แล้ว

เริ่มเก็บเมื่อเปิดใช้โค้ดนี้ ไม่สร้างประวัติย้อนหลังหรือข้อมูลตัวอย่างในฐานจริง
การเลือกไฟล์เพื่อ preview โดยยังไม่บันทึกไม่ถือเป็นการอัปโหลดสำเร็จ
สร้างผลงานเก็บเป็น `save_draft` พร้อม `created=true` ตาม action enum เดิม

เวลาเก็บ UTC และกรอง/แสดงตาม Asia/Bangkok ตัวกรองครอบคลุมกิจกรรม ผลลัพธ์ ผู้ใช้
และช่วงวันที่แบบรวมวันเริ่ม/สิ้นสุด แบ่งหน้าฝั่ง SQL หน้าละ 25 รายการ
หน้าและ API อ่านประวัติอนุญาตเฉพาะ role `admin`; `editor` และผู้ไม่ล็อกอินอ่านไม่ได้
ไม่มี API หรือปุ่มแก้/ล้างประวัติในเว็บ

## ข้อมูลและความเป็นส่วนตัว

Actor ของ Login มาจากบัญชีที่ตรวจรหัสผ่านสำเร็จ Actor ของคำสั่งผลงานมาจาก session
ที่ PHP ตรวจจริง ไม่รับ actor จาก browser Login ผิดไม่ระบุชื่อผู้ใช้ที่พยายามกรอก
รายละเอียดเก็บเฉพาะ local project ID, ชื่อผลงานแบบจำกัดความยาว, จำนวนรูป/ร่าง
และรหัสข้อผิดพลาดที่อนุญาต ไม่เก็บ password, token, hash, cookie, IP, เนื้อหาผลงาน
หรือไฟล์รูปใน log

Project storage ยังอยู่ในไฟล์ จึงใส่ local ID ใน JSON metadata เท่านั้น ไม่ใส่เป็น FK
`project_id`/`version_id` ที่อ้างข้อมูล MySQL ซึ่งยังไม่ได้ migrate ไม่มี ALTER schema

## ความทนทาน

Login สำเร็จเขียน session/last login/log ใน SQL transaction เดียวกัน Logout เพิกถอน
session ก่อนแล้วค่อยเขียน log เพื่อให้การบันทึก log ที่ล้มเหลวไม่ทำให้ session ใช้ต่อได้
Login ที่ผิด/rate limit บันทึกแบบ best effort โดยยังตอบ error เดิม

การแก้ผลงานในไฟล์ใช้ transaction journal เดิมที่เพิ่ม audit events เข้าไปด้วย
เมื่อ commit แล้ว event อยู่ใน `.esi-admin/audit-outbox/` ก่อนลบ journal
ส่งเข้า SQL หลัง commit และ retry เมื่อเปิด Audit Log; SQL ล่มระหว่างส่งจึงไม่ทำให้
บันทึกผลงานสำเร็จถูกแจ้งล้มเหลวหรือ log หายเมื่อ restart

แต่ละ event มี UUID และผูกกับ Database profile เดิม การส่งซ้ำใช้ named lock และ
ตรวจ payload เพื่อป้องกันข้อมูลซ้ำ ลบไฟล์คิวเมื่อ SQL ยืนยันรับ UUID เดิมเท่านั้น
ไฟล์เสียเก็บไว้ให้ตรวจแก้ และแจ้งว่าอ่านประวัติไม่ครบแทนซ่อนข้อผิดพลาด
คิวและ journal เป็น private/Git ignore และถูกปฏิเสธการอ่านผ่าน Vite

เส้นทางอ่านคือ `GET /api/admin/audit-logs` ส่วน `POST /api/admin/audit-events`
เป็นเส้นทางภายใน PHP ที่ตรวจ loopback และ private internal key เท่านั้น
Vite ตอบ 404 สำหรับการเรียก ingest จาก browser และไม่ส่ง cookies/credentials ไปเก็บในคิว

Audit Log ในระบบนี้ใช้ตรวจการทำงานของแอป สิทธิ์ผู้ดูแล Database และผู้ที่แก้ไฟล์
บน server ยังสามารถแก้ข้อมูลโดยตรงได้ จึงไม่ได้รับรองว่าเป็นหลักฐานที่แก้ไขไม่ได้

## ผลตรวจ

ตรวจผ่าน typecheck/lint/53 Vitest tests/build, PHP security 189 checks และ actual
PHP/MySQL HTTP 232 checks; audit สะอาด 23 routes × 4 widths รวมการตรวจ log ของ
save/publish/unpublish/delete/upload ในฐาน Local แยกและ private-ingest/anonymous gates
ตรวจ UI เพิ่มสำหรับหน้าว่าง/axe, ช่วงวันที่ผิด และ Apply/Clear ค่าเดิม
Login/Logout และหน้า log บน Chaiyo ตรวจด้วยเหตุการณ์จริงเท่านั้น ภาพอยู่ใน
`screenshots/admin-audit/` ไม่มีการ seed log จำลองหรือแก้ผลงานบน Hosting
