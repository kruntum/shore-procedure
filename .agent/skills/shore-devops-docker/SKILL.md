---
name: shore-devops-docker
description: >-
  Use this skill when managing, deploying, troubleshooting, or configuring
  Docker Compose containers, Nginx reverse proxy, PostgreSQL, and MinIO storage for the Shore System.
---

# 🐳 Shore System DevOps, Docker & Infrastructure Guide

คู่มือการดูแล ติดตั้ง และแก้ไขปัญหา Infrastructure สำหรับระบบ **Shore Procedure Management System**

---

## 🔌 1. ตรวจสอบพอร์ตเครือข่าย (Port 320X Verification)

ก่อนเริ่มรัน Docker Compose ให้ตรวจสอบว่าพอร์ตไม่ถูกโปรแกรมอื่นบนเครื่อง Host ใช้งาน:
```powershell
# ตรวจสอบพอร์ต 3200-3203 บน Windows:
Get-NetTCPConnection -LocalPort 3200, 3201, 3202, 3203 -ErrorAction SilentlyContinue
```

---

## 🚀 2. คำสั่งพื้นฐาน Docker Compose

```bash
# 1. รันและบิวด์ทุกคอนเทนเนอร์ในพื้นหลัง:
docker compose up -d --build

# 2. ตรวจสอบสถานะและ Healthcheck ของคอนเทนเนอร์:
docker compose ps

# 3. ดู Log แบบ Real-time:
docker compose logs -f

# 4. ดู Log เฉพาะบริการใดบริการหนึ่ง (เช่น backend หรือ nginx):
docker compose logs -f backend
docker compose logs -f nginx

# 5. สั่งหยุดและลบคอนเทนเนอร์ (ข้อมูลใน volume ยังคงอยู่):
docker compose down

# 6. รีสตาร์ทเฉพาะบริการ (เช่น เมื่อมีการแก้ไข config):
docker compose restart nginx
docker compose restart backend
```

---

## 🗄️ 3. การสำรองและกู้คืนฐานข้อมูล PostgreSQL (Port 3200)

### สำรองข้อมูล (Backup):
```bash
docker exec -t shore-postgres pg_dump -U shore_app -d shore_db > backup_shore_db.sql
```

### กู้คืนข้อมูล (Restore):
```bash
cat backup_shore_db.sql | docker exec -i shore-postgres psql -U shore_app -d shore_db
```

---

## 🪣 4. การจัดการ MinIO Object Storage ผ่าน MinIO Client (`mc`)

ระบบมีคอนเทนเนอร์ `shore-minio-init` ที่จะทำงานสร้าง Bucket และตั้งค่าความปลอดภัยแบบ Private ให้อัตโนมัติเมื่อเริ่มระบบ:
```bash
# ตรวจสอบ Bucket ใน MinIO ด้วย mc ภายในคอนเทนเนอร์:
docker exec -it shore-minio-init mc ls local/shore-procedures

# ยืนยันสิทธิ์ความปลอดภัย (ต้องเป็น none):
docker exec -it shore-minio-init mc anonymous get local/shore-procedures
```

---

## 🌐 5. การทดสอบ Nginx Reverse Proxy

หากแก้ไฟล์ `nginx/conf.d/default.conf` สามารถทดสอบความถูกต้องของ Syntax และ Reload ได้โดยไม่ต้องปิดคอนเทนเนอร์:
```bash
# ทดสอบ Syntax ของ Nginx:
docker exec shore-nginx nginx -t

# สั่ง Reload Config:
docker exec shore-nginx nginx -s reload
```
