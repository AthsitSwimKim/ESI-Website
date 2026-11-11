# ฐานข้อมูลสำหรับ ESI Admin

Schema สำหรับ `esithcom_website` บน Chaiyo Hosting ออกแบบจาก `Project` เดิม
และการแยกฉบับร่างออกจากฉบับเผยแพร่ ใช้ MySQL 5.5.44 เป็นขั้นต่ำที่ตรวจพบในบัญชี
ยังแนะนำให้ย้ายไป MySQL รุ่นที่ได้รับการสนับสนุนก่อนเปิดใช้งาน Admin จริง

## ติดตั้ง

ไฟล์ `001_admin_schema.sql` ใช้กับฐานว่างที่เลือกชื่อ `esithcom_website` แล้วเท่านั้น
รันครั้งเดียวผ่าน SQL หรือ Import ของ phpMyAdmin ไม่มี `DROP`, `TRUNCATE`, การสร้าง
MySQL user, การเปลี่ยน GRANT หรือข้อมูลตัวอย่าง และไม่แตะฐาน `esithcom_` เดิม
อย่านำไฟล์ไปไว้ใน `public/` หรือ `dist/`

MySQL 5.5 commit DDL ทันที แม้เขียน `START TRANSACTION` ก็ rollback การสร้างตารางไม่ได้
ถ้าติดตั้งไม่ครบให้ตรวจตาราง/constraint ที่สร้างแล้วก่อนทำต่อ ห้ามรันซ้ำโดยเดา
จงใจไม่ใช้ `IF NOT EXISTS` เพื่อให้การติดตั้งซ้ำหรือ schema ที่ไม่ตรงแจ้ง error ชัดเจน

## ตารางและความสัมพันธ์

| ตาราง                  | หน้าที่                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `admin_users`          | username ไม่ซ้ำ, display name, password hash, role และสถานะใช้งาน                           |
| `admin_sessions`       | SHA-256 ของ random session/CSRF token, ผู้ใช้, เวลาและการเพิกถอน                            |
| `projects`             | ID เดิม, pointer ฉบับร่าง/เผยแพร่, published slug, lock version, ลำดับและ soft delete       |
| `project_versions`     | snapshot ที่แก้ไขย้อนหลังไม่ได้: slug, client, industry, year, featured, image kind, source |
| `project_translations` | title/location/description แยก EN/TH ต่อ snapshot                                           |
| `project_categories`   | หลายหมวดหมู่ต่อ snapshot พร้อมลำดับ                                                         |
| `project_items`        | scope/partner แยกภาษาและลำดับ รักษาข้อมูลเก่าที่ซ่อนจากฟอร์ม                                |
| `media_files`          | metadata/path/checksum/เครดิตของไฟล์จริง ไม่มี binary หรือ base64                           |
| `project_media`        | cover หนึ่ง slot และ gallery สูงสุดสิบ slot ต่อ snapshot                                    |
| `admin_events`         | ประวัติผู้กระทำ/ผลงาน/ฉบับ/action/result/time                                               |

`projects.(draft_version_id,id)` และ `(published_version_id,id)` ใช้ composite foreign keys
ไปที่ `project_versions.(id,project_id)` เพื่อกันชี้ไปฉบับของผลงานอื่น ไม่ลบ version ที่
ยังถูกใช้งานอยู่ รูปที่มี version อ้างอิงอยู่ลบไม่ได้ ใช้ soft delete กับผลงานและผู้ใช้
เป็นหลักเพื่อรักษาประวัติ

## ข้อตกลงที่ PHP API ต้องทำก่อนใช้งาน

- ใช้ prepared statements, `STRICT_TRANS_TABLES` และ connection charset `utf8mb4` ทุก connection
  พร้อมเปิด foreign key checks กฎ ENUM ไม่เพียงพอหาก connection ไม่ใช้ STRICT mode
- ส่ง `created_at`/`updated_at` ฯลฯ เป็น UTC จาก API; แปลงเป็นเวลาไทยเฉพาะตอนแสดงผล
  ใช้ DATETIME ธรรมดา ไม่มี fractional seconds/automatic defaults ที่ MySQL 5.5 ไม่รองรับ
- ตรวจค่าข้อมูลและไม่รับ `role`/`is_active`/`created_by` จาก client โดยตรง
  ทุก row ใน `admin_users` เริ่ม inactive ตาม default ไม่มีบัญชีหรือรหัสผ่านเริ่มต้น
- ก่อนบันทึก event ที่มีทั้ง project/version ให้ API ตรวจว่า version เป็นของ project นั้น
- สร้างบัญชี Admin แรกเมื่อมีขั้นตอนตั้งรหัสผ่านที่ตรวจสิทธิ์แล้ว ใช้ PHP `password_hash()`
  และ `password_verify()`; เก็บเฉพาะ hash ไม่ใช้ MySQL `PASSWORD()`, MD5 หรือ SHA-256 แทน password hash
- สร้าง session token ด้วย CSPRNG อย่างน้อย 32 bytes เก็บเฉพาะ SHA-256 ในฐาน
  cookie ใช้ Secure/HttpOnly/SameSite พร้อม CSRF protection; ตรวจ active/role/expiry/revocation ทุกคำขอ
  ไม่มีรหัสผ่าน/session/token จริงใน SQL, Git หรือ event details
- ฉบับใน `project_versions` และตารางลูกเป็น immutable snapshots: save draft สร้าง version ใหม่
  แล้วเปลี่ยนเฉพาะ draft pointer; public query join ผ่าน published pointer และ `deleted_at IS NULL` เท่านั้น
- Publish ตรวจข้อมูลทั้งหมดแล้วเปลี่ยน `published_version_id` และ `published_slug` พร้อมล้าง draft pointer
  ใน transaction เดียว ต้องตรวจว่าทั้งคู่เป็นข้อมูลฉบับเดียวกัน
- ตรวจ `lock_version` ภายใน transaction แล้วเพิ่มทีละหนึ่ง เพื่อกันสองแท็บเขียนทับกัน
  เก็บ `(project_id,version_no)` ไม่ซ้ำ และไม่ใช้ `MAX(id)+1` โดยไม่มี lock
- ตรวจ slug แบบ lowercase kebab-case และไม่ซ้ำข้ามผลงาน ทั้ง draft/published; reserve slug ของฉบับ
  สาธารณะเดิมระหว่างแก้ draft โดยใช้ transaction/locking ที่ serialize การจอง slug
  `published_slug` unique กัน URL ซ้ำอีกชั้น ห้าม unique `project_versions.slug` เพราะหลายฉบับใช้ slug เดิมได้
- EN title/location/description และ client/slug/categories/cover ต้องครบ; TH fallback เป็น EN แยกราย field
  รายการ scope/partner ของแต่ละภาษาไม่บังคับจำนวนเท่ากัน; year ใช้ช่วง 1900..2100
- ตรวจ featured ของผลงานที่เผยแพร่รวมทั้งชุดให้เหลือ 3..6 ภายใน transaction ที่ serialize publish/unpublish/delete
  รวมทั้งการเปลี่ยนลำดับและการบันทึก event; CHECK ของ MySQL 5.5 ไม่บังคับกฎเหล่านี้
- Gallery ใช้ slot `gallery-01`..`gallery-10` ตามลำดับ และ `cover` หนึ่ง slot
  ก่อน publish ต้องมี cover จริง ตรวจชนิด/เนื้อหาไฟล์และ path; ห้ามลบไฟล์ที่มี version อ้างอยู่
- Unpublish เก็บ draft ล่าสุดหรือสร้าง draft จากฉบับสาธารณะก่อนล้าง published pointer และ slug
  Delete ใช้ `deleted_at` และ public query ต้องกรองเสมอ
- Schema ใช้ index สั้นกว่า 767 bytes และ ASCII เฉพาะ technical identifiers/path/hash
  ถ้าชื่อไฟล์ต้นทางไม่ใช่ ASCII ให้ backend เปลี่ยนเป็นชื่อจาก checksum ก่อนเก็บ path

## นำเข้าข้อมูลเดิมและขอบเขต

รอบ schema ไม่ได้ย้ายผลงาน ไม่เปลี่ยนเว็บสาธารณะหรือ API เดิม
ต่อมาเจ้าของสั่งและยืนยันให้สร้างบัญชีแรก `esi_admin` แล้ว (2026-11-06, D55):
id 1, role `admin`, active; รหัสผ่านสุ่มในเครื่องและเก็บเฉพาะ bcrypt `$2y$` cost 12 ใน Database
credentials อยู่ใน `.esi-admin/initial-admin-credentials.txt` ที่ Git ignore ห้ามอัปโหลดหรือ commit
ตรวจจากฐานจริงว่ามีหนึ่งบัญชี สิทธิ์/สถานะถูกต้อง hash ตรง และไม่มี session ค้างแล้ว
phpMyAdmin มีคำสั่งภายในแทรก ทำให้ `SELECT ROW_COUNT()` คืน 0 แม้ขึ้น “1 row inserted”
จึงยืนยันด้วย query แบบ read-only หลัง INSERT และไม่สร้างซ้ำ

ตอน migration ต้องใช้ `projectReferences` รวม overlay `projectContent.json`/`removedIds`
และตรวจ `.esi-admin/workspace.json` ซึ่งไม่อยู่ใน Git แยก draft กับ published ให้ถูก
เก็บ ID/slug/ลำดับเดิม รวม partners/source และเครดิตรูปที่อยู่ใน comments
ข้อมูล `[Sample]` เป็นตัวอย่างที่เคยอนุมัติให้ทดลองในเครื่อง ไม่ถือเป็นผลงานจริงสำหรับ migration

Dev ใช้ Vite plugin ส่วนชุด Chaiyo production (D59) มี PHP API สำหรับ Login/ผลงาน/ภาพ/Audit
ต้องติดตั้ง ZIP เต็มและ private config ตาม `chaiyo-production.md`; `dist/` อย่างเดียวไม่มี backend
บัญชี/session/audit ใช้ MySQL ส่วนข้อมูลผลงาน production เก็บ JSON นอก web root
ตาราง SQL ผลงานยังรอ migration ตามแนวทางข้างต้น

`002_verify_schema.sql` ตรวจ metadata แบบ read-only ส่วน `003_smoke_test.sql` ทดสอบข้อมูล
TH/EN, draft/published และความสัมพันธ์ภายใน transaction แล้ว `ROLLBACK` คืนทั้งหมด
ไม่ใช้ `DROP`/`DELETE`/`TRUNCATE` และไม่สร้างบัญชีทดสอบ

ใช้ `SHOW TABLE STATUS` และ `SHOW CREATE TABLE` ของฐานนี้เพื่อตรวจ metadata โดยไม่เพิ่มสิทธิ์
ให้ Database user อย่ารวม query ของ `information_schema` ใน batch ที่มี INSERT/UPDATE:
ตรวจพบว่า phpMyAdmin เลือก context เป็น `information_schema` จนคำสั่ง INSERT ถูกปฏิเสธ
แม้แถบด้านบนยังแสดงฐานเว็บไซต์ การทดสอบที่ใช้เฉพาะฐานเว็บไซต์ผ่านและ rollback ครบแล้ว
