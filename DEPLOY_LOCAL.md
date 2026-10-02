# 🚀 คู่มือการติดตั้งและย้ายระบบสู่ Local Server (On-Premise Deployment Guide)

เอกสารนี้รวบรวมขั้นตอนการเตรียมความพร้อม การตรวจสอบข้อมูล Seed Data และคำแนะนำในการย้ายระบบ **Shore Procedure Management System** จาก Docker Desktop ไปรันบน Local Server / On-Premise Server ขององค์กร

---

## 📋 1. สรุปความพร้อมของระบบ (System Readiness Checklist)

| รายการตรวจสอบ | สถานะ | รายละเอียด |
| :--- | :---: | :--- |
| **Strict 320X Ports** | ✅ พร้อม | 3200 (PG), 3201 (MinIO API), 3202 (Nginx Web UI), 3203 (MinIO Console) |
| **Auto-Migration** | ✅ พร้อม | Backend จะรันตรวจสอบและ Migrate Drizzle Schema ให้ทันทีเมื่อเปิดเครื่อง |
| **Auto-Seed (Master Data)** | ✅ พร้อม | นำเข้าข้อมูลเริ่มต้นอัตโนมัติ หากยังไม่มีข้อมูล (Idempotent ไม่เขียนทับข้อมูลจริง) |
| **MinIO Private Bucket** | ✅ พร้อม | มีคอนเทนเนอร์ `shore-minio-init` สร้าง bucket `shore-procedures` (Private) อัตโนมัติ |
| **Reverse Proxy** | ✅ พร้อม | Nginx คอยจัดการ Routing และจำกัด `client_max_body_size 25M` สำหรับอัปโหลดรูปภาพ |

---

## 🗄️ 2. ตรวจสอบข้อมูลเริ่มต้น (Seed Data Verification)

เมื่อระบบเริ่มต้นบนเซิร์ฟเวอร์ใหม่ ระบบจะเตรียมข้อมูล Master Data ให้พร้อมใช้งานทันที ได้แก่:

1. **ผู้ใช้งานเริ่มต้น (Users):**
   * **Admin:** `admin` / รหัสผ่าน: `123456` (ชื่อ: *สมเกียรติ สุวรรณสิทธิ์ (Admin)*)
   * **User (พนักงาน):** `kan` / รหัสผ่าน: `123456` (ชื่อ: *กานต์ ประดิษฐ์วงษ์ (Kan)*)
2. **สายเรือ / เอเย่นต์ (Agents - 20 รายการ):**
   * WHL, YML, EMC, CUL, HEUNG-A, IAL, KMTC, MELL, ONE, OOCL, PIL, SKR, SITC, TSL, ZIM, MAERSK, CMA, MOL, SM LINE, RCL
3. **ท่าเรือ (Ports - 12 ท่าเรือ แยก A2 และ A3 ชัดเจน):**
   * A0, A2, A3, B1, B2 (หน้าเคาน์เตอร์เท่านั้น), B3, B4, B5C3, C1C2, D1, KERRY, SIAM COM
   * พร้อมข้อมูลวิธีชำระเงิน เวลาทำการ และหมายเหตุ
4. **ประเภทงาน (Work Types - 2 ประเภท):**
   * จ่ายชอร์ (`SHORE_PAY`), วางบิล/มัดจำตู้ (`DEPOSIT_RETURN`)
5. **บทบาทผู้รับผิดชอบขั้นตอน (Responsible Roles - 6 บทบาท พร้อมไอคอนและสี):**
   * พนักงานหน้างาน / ชิปปิ้ง, เจ้าหน้าที่ท่าเรือ, เจ้าหน้าที่สายเรือ / เอเย่นต์, พนักงานออฟฟิศ / การเงิน, คนขับรถ / ขนส่ง, เจ้าหน้าที่ศุลกากร
6. **คู่มือตัวอย่าง (Example SOP):**
   * ท่าเรือ C1C2 ของสายเรือ WHL (ผูกสายเรือ WHL, YML, EMC) พร้อม 2 เงื่อนไข (e-Portal, ฉุกเฉิน LINE Official) รวม 5 ขั้นตอน พร้อมเอกสารอ้างอิงและบทบาทผู้รับผิดชอบ

---

## 🛠️ 3. แนวทางการติดตั้งบน Local Server (เลือกได้ 2 แบบ)

---

### แบบที่ 1: ติดตั้งแบบ Clean Setup (เริ่มระบบใหม่ พร้อม Master Data ทันที)

เหมาะสำหรับ: ติดตั้งบน Server ใหม่ โดยต้องการให้ระบบเริ่มจาก Seed Data ที่ตั้งค่าไว้

1. **คัดลอกโฟลเดอร์โปรเจกต์** ทั้งหมดไปยัง Local Server (เช่น `/opt/shore-procedure` หรือ `D:\shore-procedure`)
2. **ตรวจสอบไฟล์ `.env`:**
   ตรวจสอบว่ามีไฟล์ `.env` อยู่ที่ Root Directory (คัดลอกจาก `.env.example` ได้)
3. **สั่งรันคอนเทนเนอร์:**
   ```bash
   docker compose up -d --build
   ```
4. **ตรวจสอบสถานะคอนเทนเนอร์:**
   ```bash
   docker compose ps
   ```
   *คอนเทนเนอร์ทั้งหมด 5 ตัว (nginx, frontend, backend, postgres, minio) จะเริ่มทำงาน และระบบจะ Auto-migrate & Auto-seed ให้อัตโนมัติในเบื้องหลัง*
5. **เข้าใช้งานระบบ:**
   * **หน้าเว็บหลัก:** `http://<IP_LOCAL_SERVER>:3202`
   * **MinIO Console (จัดการไฟล์):** `http://<IP_LOCAL_SERVER>:3203`

---

### แบบที่ 2: ย้ายข้อมูลจริงจาก Docker Desktop ปัจจุบัน ไปยัง Local Server

เหมาะสำหรับ: ต้องการนำคู่มือที่สร้างไว้จริงบนเครื่องปัจจุบัน รวมถึง**รูปภาพขั้นตอนที่เคยอัปโหลดไว้** ไปยัง Local Server ด้วย

#### ขั้นตอนที่ 2.1: ส่งออกข้อมูลจากเครื่องต้นทาง (Docker Desktop ปัจจุบัน)
ในโฟลเดอร์โปรเจกต์เดิม รันคำสั่งต่อไปนี้:

1. **Export ฐานข้อมูล PostgreSQL:**
   ```bash
   docker exec -t shore-postgres pg_dump -U shore_app -d shore_db --clean --if-exists > shore_db_backup.sql
   ```
   *(มีไฟล์ `shore_db_backup.sql` ถูกสร้างไว้ให้แล้ว)*

2. **Export รูปภาพทั้งหมดจาก MinIO Storage:**
   ```bash
   docker run --rm -v "${PWD}/minio_backup:/backup" --network shore-procedure_shore-network --entrypoint /bin/sh quay.io/minio/mc:latest -c "mc alias set local http://minio:9000 shore_admin shore_secure_minio_pass_2026; mc cp --recursive local/shore-procedures/ /backup/"
   ```
   *(ไฟล์รูปภาพถูกสำรองไว้ในโฟลเดอร์ `minio_backup/` เรียบร้อยแล้ว)*

---

#### ขั้นตอนที่ 2.2: นำเข้าข้อมูลบนเครื่องปลายทาง (Local Server)
1. คัดลอกโปรเจกต์ พร้อมไฟล์ `shore_db_backup.sql` และโฟลเดอร์ `minio_backup/` ไปยัง Local Server
2. สั่งรันระบบให้พร้อมทำงาน:
   ```bash
   docker compose up -d --build
   ```
3. **Restore ฐานข้อมูล:**
   ```bash
   cat shore_db_backup.sql | docker exec -i shore-postgres psql -U shore_app -d shore_db
   ```
4. **Restore รูปภาพเข้าสู่ MinIO:**
   ```bash
   docker run --rm -v "${PWD}/minio_backup:/backup" --network shore-procedure_shore-network --entrypoint /bin/sh quay.io/minio/mc:latest -c "mc alias set local http://minio:9000 shore_admin shore_secure_minio_pass_2026; mc cp --recursive /backup/ local/shore-procedures/"
   ```
5. **รีสตาร์ทบริการ:**
   ```bash
   docker compose restart backend
   ```

---

## 🔒 4. การเปิด Firewall บน Local Server (Windows / Linux)

เพื่อให้เครื่องลูกข่าย (Client/Tablet/Mobile) ในวง LAN สามารถเข้าใช้งานเว็บได้ ให้เปิดพอร์ตต่อไปนี้:
* **Port 3202 (TCP):** Web UI & API (พอร์ตหลักที่ผู้ใช้งานทุกคนต้องเข้าถึง)
* **Port 3203 (TCP):** MinIO Web Console (สำหรับ Admin เข้าดู Object Storage หากต้องการ)

### คำสั่งเปิดพอร์ตสำหรับ Windows Server (PowerShell Run as Admin):
```powershell
New-NetFirewallRule -DisplayName "Shore System Web (3202)" -Direction Inbound -LocalPort 3202 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Shore System MinIO Console (3203)" -Direction Inbound -LocalPort 3203 -Protocol TCP -Action Allow
```

### คำสั่งเปิดพอร์ตสำหรับ Linux (UFW):
```bash
sudo ufw allow 3202/tcp comment 'Shore Procedure Web UI'
sudo ufw allow 3203/tcp comment 'Shore Procedure MinIO Console'
```

---

## 📊 5. คำสั่งตรวจเช็คและบำรุงรักษาประจำวัน (Useful Commands)

```bash
# ตรวจดูสถานะ Service ทั้งหมด
docker compose ps

# ดู Log รวม หรือดูเฉพาะ Backend
docker compose logs -f backend

# สำรองข้อมูลฐานข้อมูลประจำวัน (Backup)
docker exec -t shore-postgres pg_dump -U shore_app -d shore_db --clean --if-exists > backup_$(date +%Y%m%d).sql
```
