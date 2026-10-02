import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { agents } from '../db/schema/agents';
import { eq, ilike, or } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const agentsRouter = new Hono();

const agentSchema = z.object({
  code: z.string().min(1, 'กรุณาระบุรหัสเอเย่นต์ (เช่น WHL, ONE)'),
  name: z.string().min(1, 'กรุณาระบุชื่อเต็มของเอเย่นต์'),
  isActive: z.boolean().optional().default(true),
});

// GET /api/agents
agentsRouter.get('/', async (c) => {
  const q = c.req.query('q');
  let list;
  if (q) {
    list = await db.query.agents.findMany({
      where: or(ilike(agents.code, `%${q}%`), ilike(agents.name, `%${q}%`)),
      orderBy: (agents, { asc }) => [asc(agents.id)],
    });
  } else {
    list = await db.query.agents.findMany({
      orderBy: (agents, { asc }) => [asc(agents.id)],
    });
  }
  return successResponse(c, list);
});

// GET /api/agents/:id
agentsRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, id),
    with: {
      procedures: {
        with: {
          port: true,
          workType: true,
        },
      },
    },
  });
  if (!agent) return errorResponse(c, 'ไม่พบเอเย่นต์ที่ระบุ', 404);
  return successResponse(c, agent);
});

// POST /api/agents (Both Admin & User can add)
agentsRouter.post('/', requireAuth, zValidator('json', agentSchema), async (c) => {
  const body = c.req.valid('json');

  const existing = await db.query.agents.findFirst({
    where: eq(agents.code, body.code),
  });
  if (existing) {
    return errorResponse(c, `รหัสเอเย่นต์ ${body.code} มีอยู่ในระบบแล้ว`, 409);
  }

  const [created] = await db.insert(agents).values(body).returning();
  return successResponse(c, created, 'เพิ่มข้อมูลเอเย่นต์สำเร็จ', 201);
});

// PUT /api/agents/:id (Both Admin & User can edit)
agentsRouter.put('/:id', requireAuth, zValidator('json', agentSchema.partial()), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  const [updated] = await db.update(agents).set(body).where(eq(agents.id, id)).returning();
  if (!updated) return errorResponse(c, 'ไม่พบเอเย่นต์ที่ต้องการแก้ไข', 404);

  return successResponse(c, updated, 'แก้ไขข้อมูลเอเย่นต์สำเร็จ');
});

// DELETE /api/agents/:id (ADMIN ONLY)
agentsRouter.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));

  const [deleted] = await db.delete(agents).where(eq(agents.id, id)).returning();
  if (!deleted) return errorResponse(c, 'ไม่พบเอเย่นต์ที่ต้องการลบ', 404);

  return successResponse(c, deleted, 'ลบข้อมูลเอเย่นต์สำเร็จ');
});

export default agentsRouter;
