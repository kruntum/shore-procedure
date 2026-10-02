import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { workTypes } from '../db/schema/workTypes';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const workTypesRouter = new Hono();

const workTypeSchema = z.object({
  code: z.string().min(1, 'กรุณาระบุรหัสประเภทงาน'),
  name: z.string().min(1, 'กรุณาระบุชื่อประเภทงาน'),
});

// GET /api/work-types
workTypesRouter.get('/', async (c) => {
  const list = await db.query.workTypes.findMany({
    orderBy: (wt, { asc }) => [asc(wt.id)],
  });
  return successResponse(c, list);
});

// POST /api/work-types
workTypesRouter.post('/', requireAuth, zValidator('json', workTypeSchema), async (c) => {
  const body = c.req.valid('json');

  const existing = await db.query.workTypes.findFirst({
    where: eq(workTypes.code, body.code),
  });
  if (existing) {
    return errorResponse(c, `รหัสประเภทงาน ${body.code} มีอยู่ในระบบแล้ว`, 409);
  }

  const [created] = await db.insert(workTypes).values(body).returning();
  return successResponse(c, created, 'เพิ่มประเภทงานสำเร็จ', 201);
});

// PUT /api/work-types/:id
workTypesRouter.put('/:id', requireAuth, zValidator('json', workTypeSchema.partial()), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  if (body.code) {
    const existing = await db.query.workTypes.findFirst({
      where: eq(workTypes.code, body.code),
    });
    if (existing && existing.id !== id) {
      return errorResponse(c, `รหัสประเภทงาน ${body.code} มีอยู่ในระบบแล้ว`, 409);
    }
  }

  const [updated] = await db.update(workTypes).set(body).where(eq(workTypes.id, id)).returning();
  if (!updated) return errorResponse(c, 'ไม่พบประเภทงานที่ต้องการแก้ไข', 404);

  return successResponse(c, updated, 'แก้ไขประเภทงานสำเร็จ');
});

// DELETE /api/work-types/:id (ADMIN ONLY)
workTypesRouter.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));

  const [deleted] = await db.delete(workTypes).where(eq(workTypes.id, id)).returning();
  if (!deleted) return errorResponse(c, 'ไม่พบประเภทงานที่ต้องการลบ', 404);

  return successResponse(c, deleted, 'ลบประเภทงานสำเร็จ');
});

export default workTypesRouter;
