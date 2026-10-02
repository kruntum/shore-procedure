import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { ports } from '../db/schema/ports';
import { eq, ilike, or } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const portsRouter = new Hono();

const portSchema = z.object({
  code: z.string().min(1, 'กรุณาระบุรหัสท่าเรือ (เช่น A2, C1C2)'),
  name: z.string().min(1, 'กรุณาระบุชื่อท่าเรือ'),
  paymentMethod: z.string().default('ออนไลน์'),
  operatingHours: z.string().optional().default('24 ชม.'),
  notes: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
});

// GET /api/ports
portsRouter.get('/', async (c) => {
  const q = c.req.query('q');
  let list;
  if (q) {
    list = await db.query.ports.findMany({
      where: or(ilike(ports.code, `%${q}%`), ilike(ports.name, `%${q}%`)),
      orderBy: (ports, { asc }) => [asc(ports.id)],
    });
  } else {
    list = await db.query.ports.findMany({
      orderBy: (ports, { asc }) => [asc(ports.id)],
    });
  }
  return successResponse(c, list);
});

// GET /api/ports/:id
portsRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const port = await db.query.ports.findFirst({
    where: eq(ports.id, id),
    with: {
      procedures: {
        with: {
          agent: true,
          procedureAgents: {
            with: {
              agent: true,
            },
          },
          workType: true,
        },
      },
    },
  });
  if (!port) return errorResponse(c, 'ไม่พบท่าเรือที่ระบุ', 404);

  const formattedPort = {
    ...port,
    procedures: port.procedures.map((p: any) => {
      const directAgents = p.procedureAgents?.map((pa: any) => pa.agent).filter(Boolean) || [];
      if (directAgents.length === 0 && p.agent) {
        directAgents.push(p.agent);
      }
      return {
        ...p,
        agents: directAgents,
      };
    }),
  };

  return successResponse(c, formattedPort);
});

// POST /api/ports (Both Admin & User can add)
portsRouter.post('/', requireAuth, zValidator('json', portSchema), async (c) => {
  const body = c.req.valid('json');

  const existing = await db.query.ports.findFirst({
    where: eq(ports.code, body.code),
  });
  if (existing) {
    return errorResponse(c, `รหัสท่าเรือ ${body.code} มีอยู่ในระบบแล้ว`, 409);
  }

  const [created] = await db.insert(ports).values(body).returning();
  return successResponse(c, created, 'เพิ่มข้อมูลท่าเรือสำเร็จ', 201);
});

// PUT /api/ports/:id (Both Admin & User can edit)
portsRouter.put('/:id', requireAuth, zValidator('json', portSchema.partial()), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  const [updated] = await db.update(ports).set(body).where(eq(ports.id, id)).returning();
  if (!updated) return errorResponse(c, 'ไม่พบท่าเรือที่ต้องการแก้ไข', 404);

  return successResponse(c, updated, 'แก้ไขข้อมูลท่าเรือสำเร็จ');
});

// DELETE /api/ports/:id (ADMIN ONLY!)
portsRouter.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));

  const [deleted] = await db.delete(ports).where(eq(ports.id, id)).returning();
  if (!deleted) return errorResponse(c, 'ไม่พบท่าเรือที่ต้องการลบ', 404);

  return successResponse(c, deleted, 'ลบข้อมูลท่าเรือสำเร็จ');
});

export default portsRouter;
