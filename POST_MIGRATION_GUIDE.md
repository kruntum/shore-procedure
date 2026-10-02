# 🛡️ คู่มือการดำเนินการหลังย้ายระบบสู่ Local Server (Post-Migration & Operations Guide)

เอกสารนี้รวบรวม **สิ่งที่ต้องทำ (Checklist) และแนวทางการดูแลรักษา (Maintenance & Best Practices)** หลังจากที่นำระบบ **Shore Procedure Management System** ขึ้นรันบน Local Server เรียบร้อยแล้ว เพื่อให้ระบบมีความปลอดภัย เสถียรภาพ และมีข้อมูลสำรองอย่างต่อเนื่อง

---

## 📌 สารบัญ (Table of Contents)
1. [การตรวจสอบความพร้อมของระบบ (System Health Check)](#1-การตรวจสอบความพร้อมของระบบ-system-health-check)
2. [การตั้งค่าความปลอดภัยบน Server (Security Hardening)](#2-การตั้งค่าความปลอดภัยบน-server-security-hardening)
3. [การตั้งค่าให้ระบบเริ่มทำงานอัตโนมัติเมื่อเปิดเครื่อง (Auto-Start on Boot)](#3-การตั้งค่าให้ระบบเริ่มทำงานอัตโนมัติเมื่อเปิดเครื่อง-auto-start-on-boot)
4. [การตั้งค่าระบบสำรองข้อมูลอัตโนมัติ (Automated Daily Backups)](#4-การตั้งค่าระบบสำรองข้อมูลอัตโนมัติ-automated-daily-backups)
5. [ขั้นตอนการอัปเดตระบบในอนาคต (Update & Deployment Workflow)](#5-ขั้นตอนการอัปเดตระบบในอนาคต-update--deployment-workflow)
6. [การตรวจสอบ Log และแก้ไขปัญหาเบื้องต้น (Monitoring & Troubleshooting)](#6-การตรวจสอบ-log-และแก้ไขปัญหาเบื้องต้น-monitoring--troubleshooting)
7. [การกู้คืนข้อมูลกรณีฉุกเฉิน (Disaster Recovery)](#7-การกู้คืนข้อมูลกรณีฉุกเฉิน-disaster-recovery)

---

## 🔍 1. การตรวจสอบความพร้อมของระบบ (System Health Check)

หลังจากรัน `docker compose up -d --build` และ Restore ข้อมูลเรียบร้อยแล้ว ให้ตรวจสอบสถานะคอนเทนเนอร์ดังนี้:

### 1.1 ตรวจสอบสถานะคอนเทนเนอร์ทั้งหมด
```bash
docker compose ps
```
**ผลลัพธ์ที่ถูกต้อง:**
* คอนเทนเนอร์ทั้ง 5 ตัว (`shore-nginx`, `shore-frontend`, `shore-backend`, `shore-postgres`, `shore-minio`) ต้องมีสถานะเป็น `Up` หรือ `Up (healthy)`

### 1.2 ตรวจสอบ Health Endpoint ของ Backend
```bash
curl http://localhost:3202/api/health
```
**ผลลัพธ์ที่ต้องได้:** `{"status":"ok", ...}`

### 1.3 ทดสอบการเข้าใช้งานผ่านเบราว์เซอร์
* **หน้าเว็บคู่มือ (ทุกคนเข้าได้โดยไม่ต้อง Login):** `http://<IP_SERVER>:3202`
* **หน้าล็อกอินระบบจัดการ:** `http://<IP_SERVER>:3202/login`
* **MinIO Storage Console:** `http://<IP_SERVER>:3203` (เข้าดู Bucket และไฟล์รูปภาพ)

---

## 🔒 2. การตั้งค่าความปลอดภัยบน Server (Security Hardening)

### 2.1 ตั้งค่า Firewall (UFW) บน Linux
เพื่อป้องกันไม่ให้บุคคลภายนอกเข้าถึงฐานข้อมูล PostgreSQL หรือพอร์ตภายในโดยตรง แนะนำให้เปิดเฉพาะพอร์ตที่จำเป็น:

```bash
# อนุญาต SSH สำหรับรีโมตจัดการเครื่อง
sudo ufw allow 22/tcp

# อนุญาต Web UI สำหรับผู้ใช้งานและชิปปิ้งทั่วไป (พอร์ตหลัก)
sudo ufw allow 3202/tcp

# (ทางเลือก) อนุญาต MinIO Console เฉพาะเมื่อต้องการเข้ามาจัดการไฟล์
sudo ufw allow 3203/tcp

# เปิดใช้งาน Firewall
sudo ufw enable
sudo ufw status
```
> [!IMPORTANT]
> **ห้ามเปิดพอร์ต 3200 (PostgreSQL)** สู่ภายนอกโดยเด็ดขาด ฐานข้อมูลควรให้เฉพาะคอนเทนเนอร์ภายในระบบและผู้ดูแลระบบผ่าน SSH ใช้งานเท่านั้น

---

### 2.2 เปลี่ยนรหัสผ่านสำหรับใช้งานจริง (Production Credentials)
ในไฟล์ `.env` บน Server แนะนำให้เปลี่ยนรหัสผ่านเริ่มต้นเป็นรหัสผ่านที่มีความซับซ้อน:

```bash
nano .env
```
* `POSTGRES_PASSWORD`: รหัสผ่านสำหรับฐานข้อมูล
* `MINIO_ROOT_PASSWORD`: รหัสผ่านแอดมินสำหรับ MinIO Console
* `JWT_SECRET`: คีย์เข้ารหัส Token ของระบบ (ควรใช้ข้อความสุ่มยาว 32+ ตัวอักษร)

*หลังจากแก้ไข `.env` ให้สั่งรีสตาร์ทคอนเทนเนอร์:*
```bash
docker compose up -d --force-recreate
```

---

## ⚡ 3. การตั้งค่าให้ระบบเริ่มทำงานอัตโนมัติเมื่อเปิดเครื่อง (Auto-Start on Boot)

ระบบได้ตั้งค่า `restart: unless-stopped` ไว้ใน `docker-compose.yml` ทุกบริการแล้ว เพื่อให้มั่นใจว่าเมื่อ Server รีบูต ระบบจะเปิดขึ้นมาเอง ให้เปิดใช้งาน Docker Service ในระดับ OS:

```bash
# ให้ Docker เริ่มทำงานทันทีที่เปิดเครื่อง
sudo systemctl enable docker
sudo systemctl enable containerd
```

---

## 💾 4. การตั้งค่าระบบสำรองข้อมูลอัตโนมัติ (Automated Daily Backups)

เพื่อป้องกันข้อมูลสูญหาย ควรกำหนดให้เซิร์ฟเวอร์สำรองข้อมูล PostgreSQL และ MinIO อัตโนมัติทุกวันเวลาเที่ยงคืน

### 4.1 สร้างสคริปต์ Backup
สร้างไฟล์ `/home/tummy/backup-shore.sh`:
```bash
nano /home/tummy/backup-shore.sh
```

วางโค้ดด้านล่างนี้ลงในไฟล์:
```bash
#!/bin/bash
BACKUP_DIR="/home/tummy/shore-backups"
DATE=$(date +'%Y-%m-%d_%H%M%S')
PROJECT_DIR="/home/tummy/shore-procedure"

mkdir -p "$BACKUP_DIR/db"
mkdir -p "$BACKUP_DIR/images"

# 1. สำรองฐานข้อมูล PostgreSQL
docker exec -t shore-postgres pg_dump -U shore_app -d shore_db --clean --if-exists > "$BACKUP_DIR/db/shore_db_$DATE.sql"

# 2. สำรองรูปภาพจาก MinIO
docker run --rm -v "$BACKUP_DIR/images:/backup" --network shore-procedure_shore-network --entrypoint /bin/sh elestio/minio:latest -c "mc alias set local http://minio:9000 shore_minio_admin shore_secure_pass_2026; mc cp --recursive local/shore-procedures/ /backup/$DATE/"

# 3. ลบไฟล์สำรองที่มีอายุเกิน 30 วัน เพื่อประหยัดพื้นที่ฮาร์ดดิสก์
find "$BACKUP_DIR/db" -name "*.sql" -mtime +30 -exec rm {} \;
find "$BACKUP_DIR/images" -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;

echo "[$DATE] Backup completed successfully." >> "$BACKUP_DIR/backup.log"
```

### 4.2 ให้สิทธิ์รันสคริปต์
```bash
chmod +x /home/tummy/backup-shore.sh
```

### 4.3 ตั้ง Crontab ให้รันอัตโนมัติทุกเที่ยงคืน (00:00 น.)
```bash
crontab -e
```
เพิ่มบรรทัดนี้ลงไปท้ายสุดของไฟล์:
```cron
0 0 * * * /home/tummy/backup-shore.sh
```

---

## 🔄 5. ขั้นตอนการอัปเดตระบบในอนาคต (Update & Deployment Workflow)

เมื่อทีมพัฒนามีการอัปเดตฟังก์ชันใหม่ขึ้น GitHub การดึงการอัปเดตลงเซิร์ฟเวอร์ทำได้ง่ายมากด้วย 3 ขั้นตอน:

```bash
# 1. เข้าไปที่โฟลเดอร์โปรเจกต์
cd /home/tummy/shore-procedure

# 2. ดึงโค้ดเวอร์ชันล่าสุดจาก GitHub
git pull origin main

# 3. สั่งคอมไพล์และอัปเดตคอนเทนเนอร์
docker compose up -d --build
```
> [!NOTE]
> ระบบมี **Auto-Migration** ฝังไว้ใน Backend อยู่แล้ว หากมีการเพิ่มหรือเปลี่ยนโครงสร้างตารางใน Database ระบบจะรัน Migration ให้อัตโนมัติทันทีโดยไม่ต้องรันคำสั่ง manual

---

## 📊 6. การตรวจสอบ Log และแก้ไขปัญหาเบื้องต้น (Monitoring & Troubleshooting)

### ดู Log การทำงานแบบเรียลไทม์:
```bash
# ดู Log ของ Backend API
docker compose logs -f backend

# ดู Log ของ Frontend & Nginx
docker compose logs -f nginx frontend

# ดู Log ของ Database
docker compose logs -f postgres
```

### คำสั่งสั่งหยุด / รีสตาร์ทระบบ:
```bash
# รีสตาร์ทเฉพาะบริการ (เช่น รีสตาร์ท Backend)
docker compose restart backend

# หยุดระบบทั้งหมด
docker compose down

# เริ่มระบบใหม่
docker compose up -d
```

---

## 🚨 7. การกู้คืนข้อมูลกรณีฉุกเฉิน (Disaster Recovery)

หากเกิดเหตุการณ์ไม่คาดคิด เช่น Server ล่ม หรือฮาร์ดดิสก์เสียหาย สามารถนำไฟล์ Backup ล่าสุดมากู้คืนได้ทันที:

### 7.1 กู้คืนฐานข้อมูล (Restore Database)
```bash
cat /home/tummy/shore-backups/db/shore_db_<YYYY-MM-DD>.sql | docker exec -i shore-postgres psql -U shore_app -d shore_db
```

### 7.2 กู้คืนรูปภาพ MinIO (Restore Images)
```bash
docker run --rm -v "/home/tummy/shore-backups/images/<YYYY-MM-DD>:/backup" --network shore-procedure_shore-network --entrypoint /bin/sh elestio/minio:latest -c "mc alias set local http://minio:9000 shore_minio_admin shore_secure_pass_2026; mc cp --recursive /backup/ local/shore-procedures/"
```
