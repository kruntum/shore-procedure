import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { responsibleRoles } from '../db/schema/responsibleRoles';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const rolesRouter = new Hono();

const roleCreateSchema = z.object({
  code: z.string().min(1, 'กรุณาระบุรหัสบทบาท (Code)'),
  name: z.string().min(1, 'กรุณาระบุชื่อบทบาท/ผู้รับผิดชอบ'),
  color: z.string().optional().default('blue'),
  icon: z.string().optional().default('👤'),
  description: z.string().optional().default(''),
  sortOrder: z.number().int().optional().default(0),
});

const roleUpdateSchema = roleCreateSchema.partial();

// GET /api/roles
rolesRouter.get('/', async (c) => {
  const list = await db.query.responsibleRoles.findMany({
    orderBy: (r, { asc }) => [asc(r.sortOrder), asc(r.id)],
  });
  return successResponse(c, list);
});

// GET /api/roles/:id
rolesRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const role = await db.query.responsibleRoles.findFirst({
    where: eq(responsibleRoles.id, id),
  });
  if (!role) return errorResponse(c, 'ไม่พบบทบาทที่ระบุ', 404);
  return successResponse(c, role);
});

// POST /api/roles
rolesRouter.post('/', requireAuth, zValidator('json', roleCreateSchema), async (c) => {
  const body = c.req.valid('json');

  const existingCode = await db.query.responsibleRoles.findFirst({
    where: eq(responsibleRoles.code, body.code),
  });
  if (existingCode) {
    return errorResponse(c, `รหัสบทบาท ${body.code} มีอยู่ในระบบแล้ว`, 409);
  }

  const existingName = await db.query.responsibleRoles.findFirst({
    where: eq(responsibleRoles.name, body.name),
  });
  if (existingName) {
    return errorResponse(c, `ชื่อบทบาท "${body.name}" มีอยู่ในระบบแล้ว`, 409);
  }

  const [created] = await db.insert(responsibleRoles).values(body).returning();
  return successResponse(c, created, 'เพิ่มบทบาทใหม่สำเร็จ', 201);
});

// PUT /api/roles/:id
rolesRouter.put('/:id', requireAuth, zValidator('json', roleUpdateSchema), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  if (body.code) {
    const existing = await db.query.responsibleRoles.findFirst({
      where: eq(responsibleRoles.code, body.code),
    });
    if (existing && existing.id !== id) {
      return errorResponse(c, `รหัสบทบาท ${body.code} มีอยู่ในระบบแล้ว`, 409);
    }
  }

  if (body.name) {
    const existing = await db.query.responsibleRoles.findFirst({
      where: eq(responsibleRoles.name, body.name),
    });
    if (existing && existing.id !== id) {
      return errorResponse(c, `ชื่อบทบาท "${body.name}" มีอยู่ในระบบแล้ว`, 409);
    }
  }

  const [updated] = await db
    .update(responsibleRoles)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(responsibleRoles.id, id))
    .returning();

  if (!updated) return errorResponse(c, 'ไม่พบบทบาทที่ต้องการแก้ไข', 404);

  return successResponse(c, updated, 'แก้ไขข้อมูลบทบาทสำเร็จ');
});

// DELETE /api/roles/:id (Admin only)
rolesRouter.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));

  const [deleted] = await db
    .delete(responsibleRoles)
    .where(eq(responsibleRoles.id, id))
    .returning();

  if (!deleted) return errorResponse(c, 'ไม่พบบทบาทที่ต้องการลบ', 404);

  return successResponse(c, deleted, 'ลบบทบาทสำเร็จ');
});

export default rolesRouter;
