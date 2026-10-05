import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { governmentAgencies } from '../db/schema/governmentAgencies';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const governmentAgenciesRouter = new Hono();

const agencySchema = z.object({
  code: z.string().min(1, 'กรุณาระบุรหัสหน่วยงาน'),
  name: z.string().min(1, 'กรุณาระบุชื่อหน่วยงาน'),
  shortName: z.string().optional().default(''),
  contactInfo: z.string().optional().default(''),
  website: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
});

// GET /api/government-agencies (Public)
governmentAgenciesRouter.get('/', async (c) => {
  const activeOnly = c.req.query('active') === 'true';

  const list = await db.query.governmentAgencies.findMany({
    where: activeOnly ? eq(governmentAgencies.isActive, true) : undefined,
    orderBy: (ag, { asc }) => [asc(ag.name)],
  });

  return successResponse(c, list);
});

// GET /api/government-agencies/:id (Public)
governmentAgenciesRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const agency = await db.query.governmentAgencies.findFirst({
    where: eq(governmentAgencies.id, id),
  });
  if (!agency) return errorResponse(c, 'ไม่พบหน่วยงานที่ระบุ', 404);
  return successResponse(c, agency);
});

// POST /api/government-agencies (Admin only)
governmentAgenciesRouter.post('/', requireAuth, requireAdmin, zValidator('json', agencySchema), async (c) => {
  const body = c.req.valid('json');

  const existing = await db.query.governmentAgencies.findFirst({
    where: eq(governmentAgencies.code, body.code),
  });
  if (existing) return errorResponse(c, 'รหัสหน่วยงานนี้มีอยู่ในระบบแล้ว', 400);

  const [created] = await db.insert(governmentAgencies).values(body).returning();
  return successResponse(c, created, 'สร้างหน่วยงานสำเร็จ', 201);
});

// PUT /api/government-agencies/:id (Admin only)
governmentAgenciesRouter.put('/:id', requireAuth, requireAdmin, zValidator('json', agencySchema.partial()), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  const [updated] = await db.update(governmentAgencies)
    .set(body)
    .where(eq(governmentAgencies.id, id))
    .returning();

  if (!updated) return errorResponse(c, 'ไม่พบหน่วยงานที่ต้องการแก้ไข', 404);
  return successResponse(c, updated, 'แก้ไขข้อมูลหน่วยงานสำเร็จ');
});

// DELETE /api/government-agencies/:id (Admin only)
governmentAgenciesRouter.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));

  const [deleted] = await db.delete(governmentAgencies)
    .where(eq(governmentAgencies.id, id))
    .returning();

  if (!deleted) return errorResponse(c, 'ไม่พบหน่วยงานที่ต้องการลบ', 404);
  return successResponse(c, deleted, 'ลบหน่วยงานสำเร็จ');
});

export default governmentAgenciesRouter;
