# 🛡️ Shore Procedure Project Rules & Development Guidelines

เอกสารนี้กำหนดข้อตกลงและมาตรฐานการพัฒนา (Conventions & Constraints) สำหรับโปรเจกต์ **Shore Procedure Management System** ตัวแทนปัญญาประดิษฐ์ (AI Agent) และนักพัฒนาทุกคนต้องปฏิบัติตามกฎเหล่านี้อย่างเคร่งครัด

---

## 🔌 1. มาตรฐานพอร์ตเครือข่าย (Strict 320X Port Standard)

ห้ามเปลี่ยนพอร์ตบน Host ภายนอกเป็นพอร์ตอื่นเด็ดขาด เพื่อป้องกันการชนกับบริการอื่นบนเซิร์ฟเวอร์:
* **PostgreSQL:** `3200:5432`
* **MinIO API (S3):** `3201:9000`
* **Nginx (Web UI & API Proxy):** `3202:80` (พอร์ตหลักสำหรับผู้ใช้งานและระบบ)
* **MinIO Web Console:** `3203:9001`
* **Backend Internal:** `PORT=3000` (สื่อสารภายใน Docker network เท่านั้น)

---

## 🎨 2. มาตรฐาน Frontend (React + Ant Design)

1. **Compact Mode เสมอ:** ใช้ Theme `compactAlgorithm` ของ Ant Design เพื่อให้ตาราง ฟอร์ม และปุ่มมีขนาดกะทัดรัด ไม่เปลืองพื้นที่หน้าจอ เหมาะกับงานเอกสารและข้อมูลตารางจำนวนมาก
2. **Mobile & Tablet Friendly:** ถึงแม้จะเน้น Compact แต่หน้าจอสำหรับพนักงานหน้างาน (User Manual View) ต้องแสดงผลได้ดีบนมือถือและแท็บเล็ต (Responsive Design)
3. **User Experience หน้างาน:**
   - ต้องมีช่อง **Quick Search (ค้นหาด่วน)** ที่พิมพ์คำค้นหาเดียวแล้วเจอขั้นตอนทันที
   - การเลือกดูคู่มือแบบ Wizard ต้องทำได้รวดเร็ว (ไม่เกิน 3 คลิก: เลือกท่า -> เลือกเอเย่นต์ -> เลือกเงื่อนไข)
   - รูปภาพขั้นตอนทุกรูปต้องคลิกขยายดูภาพขนาดเต็ม (Lightbox/Modal Zoom) ได้ชัดเจน

---

## ⚡ 3. มาตรฐาน Backend (Bun + Hono + Drizzle ORM)

1. **Bun Runtime First:** ใช้ `bun` ในการรันสคริปต์ ติดตั้งแพ็กเกจ (`bun add`) และทดสอบระบบ หลีกเลี่ยงการใช้ Node.js APIs ที่ไม่รองรับใน Bun
2. **Route Prefix Consistency:** API ทั้งหมดใน Hono ต้องมี Prefix `/api/` (เช่น `/api/procedures`, `/api/ports`, `/api/files`) เพื่อให้ตรงกับ Nginx Reverse Proxy
3. **Database Schema & Migrations:**
   - ใช้ Drizzle ORM ในการจัดการ Schema เสมอ
   - ห้ามเขียน raw SQL drop table หรือ truncate
   - ทุกตารางต้องมี `createdAt` และตารางหลักต้องมี `updatedAt` พร้อม `updatedBy`
   - รองรับ 1 ท่าเรือมีหลายคู่มือ (1 Port to Many Procedures) ตามกลุ่มสายเรือ, ประเภทงาน หรือเงื่อนไขการปฏิบัติงานที่แตกต่างกัน

---

## 🔒 4. ความปลอดภัยและการจัดการไฟล์ (MinIO & Security)

1. **Private Storage by Default:** บักเก็ต MinIO `shore-procedures` ต้องเป็น Private เสมอ (`anonymous set none`)
2. **ห้าม Frontend เข้าถึง MinIO โดยตรง:**
   - Frontend ต้องขอรูปภาพผ่าน Backend Stream Endpoint (`/api/files/steps/:id`) หรือขอ Presigned URL จาก Backend เท่านั้น
3. **Role-Based Access Control (RBAC):**
   - พนักงานทั่วไป (User) มีสิทธิ์ **Read-Only (ดูได้อย่างเดียว)**
   - สิทธิ์เพิ่ม/ลบ/แก้ไขคู่มือและ Master Data ต้องจำกัดเฉพาะ Admin / Supervisor เท่านั้น

---

## 🐳 5. มาตรฐาน Docker & Deployment

1. คอนเทนเนอร์ทุกตัวต้องอยู่ในเน็ตเวิร์ก `shore-network`
2. Backend ต้องรอ PostgreSQL และ MinIO พร้อมใช้งานก่อนเริ่มทำงาน (`condition: service_healthy`)
3. ข้อมูลใน PostgreSQL และ MinIO ต้องผูกกับ Named Volumes (`postgres_data`, `minio_data`) เพื่อป้องกันข้อมูลสูญหายเมื่อหยุดคอนเทนเนอร์
