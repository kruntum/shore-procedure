---
name: antd-compact-frontend
description: >-
  Use this skill when developing, styling, or structuring the Frontend web application
  using React, TypeScript, Vite, and Ant Design with compact mode, responsive layout,
  step-by-step procedure viewer, image modal, and quick search.
---

# 🎨 Ant Design Compact Mode & Frontend Architecture Guide

แนวทางและแบบแผนการพัฒนาส่วนติดต่อผู้ใช้ (Frontend UI/UX) ของ **Shore Procedure Management System**

---

## 📐 1. การตั้งค่า Theme Compact Mode ใน Ant Design

เพื่อให้หน้าจอแสดงผลได้กระชับ แน่นตา ไม่กินพื้นที่ ให้กำหนด Theme Algorithm ใน `App.tsx` หรือ `main.tsx`:

```tsx
import React from 'react';
import { ConfigProvider, theme } from 'antd';
import thTH from 'antd/locale/th_TH';
import MainLayout from './layouts/MainLayout';

export default function App() {
  return (
    <ConfigProvider
      locale={thTH}
      theme={{
        algorithm: theme.compactAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 4,
          fontSize: 13,
        },
      }}
    >
      <MainLayout />
    </ConfigProvider>
  );
}
```

---

## 📱 2. โครงสร้างหน้าจอหลัก (Key Screens)

### 1) หน้าจอพนักงานหน้างาน (User Manual View)
* **Header / Quick Search:**
  - มีช่อง Autocomplete ค้นหาด่วน (เช่น พิมพ์ "C1C2 WHL" หรือ "จ่ายชอร์")
  - ตัวเลือกกรอง 3 ระดับ: ท่าเรือ (Port) -> สายเรือ (Agent) -> เงื่อนไข (Variant)
* **Summary Banner (กล่องสรุปข้อมูลด่วน):**
  - แสดงวิธีการยื่นเอกสาร (Online / LINE / หน้าท่า)
  - แสดงเวลาตัดรอบ (Cut-off Time) ด้วยสีเด่นชัด (เช่น สีแดง/ส้มเตือนใจ)
  - หมายเหตุข้อควรระวังพิเศษ
* **Step-by-Step Procedure Viewer:**
  - แสดงขั้นตอนแบบ `Steps` หรือ `Timeline` ของ Ant Design
  - แต่ละ Step มี: ลำดับที่, ชื่อขั้นตอน, คำอธิบายวิธีทำอย่างละเอียด
  - รูปภาพประกอบขั้นตอน คลิกแล้วเปิด Modal ซูมดูภาพใหญ่แบบ Preview ได้

### 2) หน้าจอแอดมิน (Admin Procedure Builder)
* **Form Builder แบบ Dynamic Form:**
  - สร้างเงื่อนไข (Variants) เพิ่ม/ลบได้หลายกรณี
  - เพิ่มขั้นตอน (Steps) จัดเรียงลำดับลากสลับตำแหน่งได้ (Drag & Drop หรือกดปุ่มขึ้น/ลง)
  - อัปโหลดรูปภาพผ่าน `Upload.Dragger` แสดงรูปตัวอย่างทันที พร้อมกรอกคำอธิบายภาพ (`caption`)

---

## 🖼️ 3. การแสดงรูปภาพและการซูมดูภาพ (Image Preview Modal)

ใช้คอมโพเนนต์ `Image` ของ Ant Design ซึ่งมี Built-in Preview และ Zoom มาให้ในตัว:

```tsx
import { Image, Space, Typography } from 'antd';

interface StepImageProps {
  id: number;
  caption?: string;
  originalFilename: string;
}

export const StepImageViewer: React.FC<{ images: StepImageProps[] }> = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <Image.PreviewGroup>
        <Space wrap size="small">
          {images.map((img) => (
            <div key={img.id} style={{ textAlign: 'center' }}>
              <Image
                width={120}
                height={80}
                style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #d9d9d9' }}
                src={`/api/files/steps/${img.id}`}
                alt={img.caption || img.originalFilename}
              />
              {img.caption && (
                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 11, maxWidth: 120 }} ellipsis>
                  {img.caption}
                </Typography.Text>
              )}
            </div>
          ))}
        </Space>
      </Image.PreviewGroup>
    </div>
  );
};
```

---

## 🚀 4. การจัดการ State และการเชื่อมต่อ API

* ใช้ **Axios** หรือ **TanStack Query (React Query)** สำหรับ Fetch ข้อมูลจาก Backend
* Base URL ถูกผูกผ่าน Nginx Reverse Proxy ที่ `/api`
* มี Loading State และ Skeleton โหลดข้อมูลที่รวดเร็วเพื่อประสบการณ์การใช้งานที่ดีเยี่ยม
