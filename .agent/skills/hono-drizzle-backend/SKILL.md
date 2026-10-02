---
name: hono-drizzle-backend
description: >-
  Use this skill when developing, refactoring, or maintaining the backend API
  using Bun runtime, Hono framework, PostgreSQL, Drizzle ORM, and MinIO S3 object storage.
---

# ⚡ Hono + Drizzle ORM + MinIO Backend Development Guide

คู่มือมาตรฐานสำหรับการพัฒนา Backend API ของระบบ **Shore Procedure Management System**

---

## 🛠️ 1. โครงสร้างโปรเจกต์ Backend

```text
backend/
├── src/
│   ├── index.ts               # Hono App Entrypoint, CORS, Middleware
│   ├── config.ts              # Env validation (PORT, DATABASE_URL, MINIO_*)
│   ├── db/
│   │   ├── index.ts           # Postgres Connection (postgres.js + drizzle)
│   │   ├── schema/            # Drizzle table schemas
│   │   └── relations.ts       # Drizzle entity relationships
│   ├── routes/
│   │   ├── ports.ts           # /api/ports CRUD
│   │   ├── agents.ts          # /api/agents CRUD
│   │   ├── work-types.ts      # /api/work-types
│   │   ├── procedures.ts      # /api/procedures (Search, Hierarchy, CRUD)
│   │   └── files.ts           # /api/files (Upload & Stream image)
│   └── services/
│       ├── minio.ts           # MinIO S3 Client initialization & upload/get helpers
│       └── procedure.ts       # Complex business queries
├── drizzle/                   # Auto-generated SQL migrations
├── drizzle.config.ts          # Drizzle kit configuration
├── package.json
└── tsconfig.json
```

---

## 📦 2. การจัดการฐานข้อมูลด้วย Drizzle ORM

### การสร้าง Migration:
```bash
# เมื่อมีการแก้ไฟล์ schema.ts ให้สร้าง migration SQL:
bunx drizzle-kit generate

# รัน migration เข้าฐานข้อมูล:
bunx drizzle-kit migrate
```

### ตัวอย่าง Query ดึงข้อมูลคู่มือแบบครบวงจร (Eager Loading):
```typescript
import { db } from '../db';
import { procedures } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function getProcedureDetail(procedureId: number) {
  return await db.query.procedures.findFirst({
    where: eq(procedures.id, procedureId),
    with: {
      port: true,
      agent: true,
      workType: true,
      variants: {
        orderBy: (variants, { asc }) => [asc(variants.sortOrder)],
        with: {
          steps: {
            orderBy: (steps, { asc }) => [asc(steps.sortOrder)],
            with: {
              images: {
                orderBy: (images, { asc }) => [asc(images.sortOrder)],
              },
            },
          },
        },
      },
    },
  });
}
```

---

## 🔒 3. การเชื่อมต่อ MinIO S3 & Image Delivery

### MinIO Client Setup:
```typescript
import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

export const BUCKET_NAME = process.env.MINIO_BUCKET || 'shore-procedures';
```

### Image Streaming Endpoint (ปลอดภัย ไม่เปิด Public Bucket):
```typescript
import { Hono } from 'hono';
import { minioClient, BUCKET_NAME } from '../services/minio';
import { db } from '../db';
import { stepImages } from '../db/schema';
import { eq } from 'drizzle-orm';

const files = new Hono();

// GET /api/files/steps/:id
files.get('/steps/:id', async (c) => {
  const imageId = parseInt(c.req.param('id'));
  const image = await db.query.stepImages.findFirst({
    where: eq(stepImages.id, imageId),
  });

  if (!image) return c.json({ error: 'Image not found' }, 404);

  try {
    const dataStream = await minioClient.getObject(BUCKET_NAME, image.objectKey);
    return new Response(dataStream as any, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return c.json({ error: 'Failed to retrieve image from storage' }, 500);
  }
});

export default files;
```

---

## 🛡️ 4. มาตรฐาน Response Format

กำหนดมาตรฐาน JSON response ให้มีรูปแบบเดียวกันทั้งระบบ:
```typescript
// สำเร็จ:
return c.json({
  success: true,
  data: result,
  message: 'Operation completed successfully'
});

// ผิดพลาด:
return c.json({
  success: false,
  error: 'Validation Error or Resource Not Found',
  details: err.message
}, 400);
```
