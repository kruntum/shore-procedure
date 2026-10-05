import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { categories } from '../db/schema/categories';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const categoriesRouter = new Hono();

const categorySchema = z.object({
  code: z.string().min(1, 'กรุณาระบุรหัสหมวดหมู่'),
  name: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่'),
  icon: z.string().optional().default('📋'),
  color: z.string().optional().default('blue'),
  sortOrder: z.number().int().optional().default(0),
});

// GET /api/categories (Public)
categoriesRouter.get('/', async (c) => {
  const list = await db.query.categories.findMany({
    orderBy: (cat, { asc }) => [asc(cat.sortOrder), asc(cat.id)],
  });
  return successResponse(c, list);
});

// GET /api/categories/:id (Public)
categoriesRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
  if (!category) return errorResponse(c, 'ไม่พบหมวดหมู่ที่ระบุ', 404);
  return successResponse(c, category);
});

// POST /api/categories (Admin only)
categoriesRouter.post('/', requireAuth, requireAdmin, zValidator('json', categorySchema), async (c) => {
  const body = c.req.valid('json');

  const existing = await db.query.categories.findFirst({
    where: eq(categories.code, body.code),
  });
  if (existing) return errorResponse(c, 'รหัสหมวดหมู่นี้มีอยู่ในระบบแล้ว', 400);

  const [created] = await db.insert(categories).values(body).returning();
  return successResponse(c, created, 'สร้างหมวดหมู่สำเร็จ', 201);
});

// PUT /api/categories/:id (Admin only)
categoriesRouter.put('/:id', requireAuth, requireAdmin, zValidator('json', categorySchema.partial()), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  const [updated] = await db.update(categories)
    .set(body)
    .where(eq(categories.id, id))
    .returning();

  if (!updated) return errorResponse(c, 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข', 404);
  return successResponse(c, updated, 'แก้ไขหมวดหมู่สำเร็จ');
});

// DELETE /api/categories/:id (Admin only)
categoriesRouter.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));

  const [deleted] = await db.delete(categories)
    .where(eq(categories.id, id))
    .returning();

  if (!deleted) return errorResponse(c, 'ไม่พบหมวดหมู่ที่ต้องการลบ', 404);
  return successResponse(c, deleted, 'ลบหมวดหมู่สำเร็จ');
});

export default categoriesRouter;
