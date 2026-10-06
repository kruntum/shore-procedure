import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import {
  jobWorkflows,
  jobWorkflowSteps,
  jobWorkflowDependencies,
  categories,
  procedures,
  governmentAgencies,
  ports,
} from '../db/schema';
import { eq, desc, asc, ilike, or, count, inArray, sql } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const workflowsRouter = new Hono();

const workflowCreateSchema = z.object({
  code: z.string().min(1, 'กรุณาระบุรหัสสายงาน (Code)'),
  title: z.string().min(1, 'กรุณาระบุชื่อสายงาน (Title)'),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  estimatedDuration: z.string().optional(),
  targetAudience: z.string().optional(),
  steps: z.array(z.object({
    id: z.number().optional(),
    title: z.string().min(1, 'กรุณาระบุชื่อขั้นตอน'),
    briefDescription: z.string().optional(),
    procedureId: z.number().int().positive().nullable().optional(),
    governmentAgencyId: z.number().int().positive().nullable().optional(),
    portId: z.number().int().positive().nullable().optional(),
    sortOrder: z.number().int().default(1),
    stepType: z.string().default('standard'),
    outputs: z.array(z.string()).default([]),
    dependsOnStepIndices: z.array(z.number().int()).optional(), // indices or ids of prerequisites
  })).optional(),
});

// GET /api/workflows (List with counts & category filter)
workflowsRouter.get('/', async (c) => {
  const categoryId = c.req.query('categoryId') ? parseInt(c.req.query('categoryId')!) : undefined;
  const search = c.req.query('search')?.trim();
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;

  let query = db.select({
    id: jobWorkflows.id,
    code: jobWorkflows.code,
    title: jobWorkflows.title,
    description: jobWorkflows.description,
    categoryId: jobWorkflows.categoryId,
    status: jobWorkflows.status,
    estimatedDuration: jobWorkflows.estimatedDuration,
    targetAudience: jobWorkflows.targetAudience,
    createdBy: jobWorkflows.createdBy,
    createdAt: jobWorkflows.createdAt,
    updatedAt: jobWorkflows.updatedAt,
    categoryName: categories.name,
    categoryIcon: categories.icon,
    categoryColor: categories.color,
  })
  .from(jobWorkflows)
  .leftJoin(categories, eq(jobWorkflows.categoryId, categories.id))
  .$dynamic();

  const conditions = [];
  if (categoryId) {
    conditions.push(eq(jobWorkflows.categoryId, categoryId));
  }
  if (search) {
    conditions.push(or(
      ilike(jobWorkflows.title, `%${search}%`),
      ilike(jobWorkflows.code, `%${search}%`),
      ilike(jobWorkflows.description, `%${search}%`)
    ));
  }

  if (conditions.length > 0) {
    query = query.where(conditions.length === 1 ? conditions[0] : sql.join(conditions, sql` AND `));
  }

  query = query.orderBy(desc(jobWorkflows.createdAt));
  if (limit) {
    query = query.limit(limit);
  }

  const list = await query;

  // Enhance each workflow with stepCount and readyStepCount
  const workflowIds = list.map((w) => w.id);
  let stepCountsMap: Record<number, { total: number; withSop: number }> = {};

  if (workflowIds.length > 0) {
    const allSteps = await db.select({
      workflowId: jobWorkflowSteps.workflowId,
      procedureId: jobWorkflowSteps.procedureId,
    })
    .from(jobWorkflowSteps)
    .where(inArray(jobWorkflowSteps.workflowId, workflowIds));

    allSteps.forEach((s) => {
      if (!stepCountsMap[s.workflowId]) {
        stepCountsMap[s.workflowId] = { total: 0, withSop: 0 };
      }
      stepCountsMap[s.workflowId].total += 1;
      if (s.procedureId) {
        stepCountsMap[s.workflowId].withSop += 1;
      }
    });
  }

  const enriched = list.map((w) => {
    const counts = stepCountsMap[w.id] || { total: 0, withSop: 0 };
    return {
      ...w,
      category: w.categoryId ? {
        id: w.categoryId,
        name: w.categoryName,
        icon: w.categoryIcon,
        color: w.categoryColor,
      } : null,
      stepCount: counts.total,
      sopReadyCount: counts.withSop,
      completionRate: counts.total > 0 ? Math.round((counts.withSop / counts.total) * 100) : 0,
    };
  });

  return successResponse(c, enriched);
});

// GET /api/workflows/:id (Full Workflow with Steps, Dependencies, & Linked SOP details)
workflowsRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const wf = await db.query.jobWorkflows.findFirst({
    where: eq(jobWorkflows.id, id),
  });

  if (!wf) return errorResponse(c, 'ไม่พบสายงานปฏิบัติการที่ระบุ', 404);

  const category = wf.categoryId
    ? await db.query.categories.findFirst({ where: eq(categories.id, wf.categoryId) })
    : null;

  // Get steps
  const steps = await db.select({
    id: jobWorkflowSteps.id,
    workflowId: jobWorkflowSteps.workflowId,
    title: jobWorkflowSteps.title,
    briefDescription: jobWorkflowSteps.briefDescription,
    procedureId: jobWorkflowSteps.procedureId,
    governmentAgencyId: jobWorkflowSteps.governmentAgencyId,
    portId: jobWorkflowSteps.portId,
    sortOrder: jobWorkflowSteps.sortOrder,
    stepType: jobWorkflowSteps.stepType,
    outputs: jobWorkflowSteps.outputs,
    createdAt: jobWorkflowSteps.createdAt,
    procedureTitle: procedures.title,
    agencyName: governmentAgencies.name,
    agencyShortName: governmentAgencies.shortName,
    portCode: ports.code,
    portName: ports.name,
  })
  .from(jobWorkflowSteps)
  .leftJoin(procedures, eq(jobWorkflowSteps.procedureId, procedures.id))
  .leftJoin(governmentAgencies, eq(jobWorkflowSteps.governmentAgencyId, governmentAgencies.id))
  .leftJoin(ports, eq(jobWorkflowSteps.portId, ports.id))
  .where(eq(jobWorkflowSteps.workflowId, id))
  .orderBy(asc(jobWorkflowSteps.sortOrder), asc(jobWorkflowSteps.id));

  // Get dependencies
  const dependencies = await db.select()
    .from(jobWorkflowDependencies)
    .where(eq(jobWorkflowDependencies.workflowId, id));

  const totalSteps = steps.length;
  const withSop = steps.filter((s) => !!s.procedureId).length;

  return successResponse(c, {
    ...wf,
    category,
    steps,
    dependencies,
    stepCount: totalSteps,
    sopReadyCount: withSop,
    completionRate: totalSteps > 0 ? Math.round((withSop / totalSteps) * 100) : 0,
  });
});

// POST /api/workflows (Create workflow with initial steps)
workflowsRouter.post('/', requireAuth, requireAdmin, zValidator('json', workflowCreateSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');

  const existing = await db.query.jobWorkflows.findFirst({
    where: eq(jobWorkflows.code, body.code),
  });
  if (existing) return errorResponse(c, 'รหัสสายงาน (Code) นี้มีอยู่ในระบบแล้ว', 400);

  const [createdWf] = await db.insert(jobWorkflows).values({
    code: body.code,
    title: body.title,
    description: body.description,
    categoryId: body.categoryId || null,
    status: body.status,
    estimatedDuration: body.estimatedDuration || null,
    targetAudience: body.targetAudience || null,
    createdBy: user?.displayName || user?.username || 'Admin',
  }).returning();

  // If initial steps provided
  if (body.steps && body.steps.length > 0) {
    const createdStepIds: number[] = [];
    for (let i = 0; i < body.steps.length; i++) {
      const s = body.steps[i];
      const [newStep] = await db.insert(jobWorkflowSteps).values({
        workflowId: createdWf.id,
        title: s.title,
        briefDescription: s.briefDescription || null,
        procedureId: s.procedureId || null,
        governmentAgencyId: s.governmentAgencyId || null,
        portId: s.portId || null,
        sortOrder: s.sortOrder || i + 1,
        stepType: s.stepType || 'standard',
        outputs: s.outputs || [],
      }).returning();
      createdStepIds.push(newStep.id);
    }
  }

  return successResponse(c, createdWf, 'สร้างสายงานปฏิบัติการสำเร็จ', 201);
});

// PUT /api/workflows/:id (Update workflow & replace/synchronize steps)
workflowsRouter.put('/:id', requireAuth, requireAdmin, zValidator('json', workflowCreateSchema), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  const existing = await db.query.jobWorkflows.findFirst({
    where: eq(jobWorkflows.id, id),
  });
  if (!existing) return errorResponse(c, 'ไม่พบสายงานที่ต้องการแก้ไข', 404);

  const [updatedWf] = await db.update(jobWorkflows).set({
    code: body.code,
    title: body.title,
    description: body.description,
    categoryId: body.categoryId || null,
    status: body.status,
    estimatedDuration: body.estimatedDuration || null,
    targetAudience: body.targetAudience || null,
    updatedAt: new Date(),
  }).where(eq(jobWorkflows.id, id)).returning();

  if (body.steps) {
    // Delete old steps and dependencies
    await db.delete(jobWorkflowDependencies).where(eq(jobWorkflowDependencies.workflowId, id));
    await db.delete(jobWorkflowSteps).where(eq(jobWorkflowSteps.workflowId, id));

    const stepIndexToIdMap: Record<number, number> = {};

    for (let i = 0; i < body.steps.length; i++) {
      const s = body.steps[i];
      const [newStep] = await db.insert(jobWorkflowSteps).values({
        workflowId: id,
        title: s.title,
        briefDescription: s.briefDescription || null,
        procedureId: s.procedureId || null,
        governmentAgencyId: s.governmentAgencyId || null,
        portId: s.portId || null,
        sortOrder: s.sortOrder || i + 1,
        stepType: s.stepType || 'standard',
        outputs: s.outputs || [],
      }).returning();

      stepIndexToIdMap[i] = newStep.id;
    }

    // Insert dependencies if provided as step indices
    for (let i = 0; i < body.steps.length; i++) {
      const s = body.steps[i];
      if (s.dependsOnStepIndices && s.dependsOnStepIndices.length > 0) {
        const currentStepId = stepIndexToIdMap[i];
        for (const depIdx of s.dependsOnStepIndices) {
          const prereqStepId = stepIndexToIdMap[depIdx];
          if (prereqStepId && currentStepId) {
            await db.insert(jobWorkflowDependencies).values({
              workflowId: id,
              stepId: currentStepId,
              dependsOnStepId: prereqStepId,
            });
          }
        }
      }
    }
  }

  return successResponse(c, updatedWf, 'แก้ไขสายงานปฏิบัติการสำเร็จ');
});

// DELETE /api/workflows/:id
workflowsRouter.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  const [deleted] = await db.delete(jobWorkflows).where(eq(jobWorkflows.id, id)).returning();
  if (!deleted) return errorResponse(c, 'ไม่พบสายงานที่ต้องการลบ', 404);
  return successResponse(c, deleted, 'ลบสายงานปฏิบัติการสำเร็จ');
});

// Step Schema
const stepSchema = z.object({
  title: z.string().min(1, 'กรุณาระบุชื่อขั้นตอน'),
  briefDescription: z.string().optional().nullable(),
  procedureId: z.number().int().positive().optional().nullable(),
  governmentAgencyId: z.number().int().positive().optional().nullable(),
  portId: z.number().int().positive().optional().nullable(),
  sortOrder: z.number().int().default(1),
  stepType: z.string().default('standard'),
  outputs: z.array(z.string()).default([]),
});

// POST /api/workflows/:id/steps (Add single step to workflow)
workflowsRouter.post('/:id/steps', requireAuth, requireAdmin, zValidator('json', stepSchema), async (c) => {
  const workflowId = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  const wf = await db.query.jobWorkflows.findFirst({
    where: eq(jobWorkflows.id, workflowId),
  });
  if (!wf) return errorResponse(c, 'ไม่พบสายงานปฏิบัติการ', 404);

  // If sortOrder not provided or is default, put it at the end
  let sortOrder = body.sortOrder;
  if (!sortOrder || sortOrder === 1) {
    const existingSteps = await db.select({ sortOrder: jobWorkflowSteps.sortOrder })
      .from(jobWorkflowSteps)
      .where(eq(jobWorkflowSteps.workflowId, workflowId))
      .orderBy(desc(jobWorkflowSteps.sortOrder))
      .limit(1);
    sortOrder = existingSteps.length > 0 ? (existingSteps[0].sortOrder || 0) + 1 : 1;
  }

  const [newStep] = await db.insert(jobWorkflowSteps).values({
    workflowId,
    title: body.title,
    briefDescription: body.briefDescription || null,
    procedureId: body.procedureId || null,
    governmentAgencyId: body.governmentAgencyId || null,
    portId: body.portId || null,
    sortOrder,
    stepType: body.stepType || 'standard',
    outputs: body.outputs || [],
  }).returning();

  return successResponse(c, newStep, 'เพิ่มขั้นตอนสำเร็จ', 201);
});

// PUT /api/workflows/:id/steps/:stepId (Update single step)
workflowsRouter.put('/:id/steps/:stepId', requireAuth, requireAdmin, zValidator('json', stepSchema), async (c) => {
  const workflowId = parseInt(c.req.param('id'));
  const stepId = parseInt(c.req.param('stepId'));
  const body = c.req.valid('json');

  const existing = await db.query.jobWorkflowSteps.findFirst({
    where: eq(jobWorkflowSteps.id, stepId),
  });
  if (!existing || existing.workflowId !== workflowId) {
    return errorResponse(c, 'ไม่พบขั้นตอนที่ต้องการแก้ไข', 404);
  }

  const [updated] = await db.update(jobWorkflowSteps).set({
    title: body.title,
    briefDescription: body.briefDescription !== undefined ? body.briefDescription : existing.briefDescription,
    procedureId: body.procedureId !== undefined ? body.procedureId : existing.procedureId,
    governmentAgencyId: body.governmentAgencyId !== undefined ? body.governmentAgencyId : existing.governmentAgencyId,
    portId: body.portId !== undefined ? body.portId : existing.portId,
    sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
    stepType: body.stepType || existing.stepType,
    outputs: body.outputs || existing.outputs,
    updatedAt: new Date(),
  }).where(eq(jobWorkflowSteps.id, stepId)).returning();

  return successResponse(c, updated, 'แก้ไขขั้นตอนสำเร็จ');
});

// DELETE /api/workflows/:id/steps/:stepId (Delete single step)
workflowsRouter.delete('/:id/steps/:stepId', requireAuth, requireAdmin, async (c) => {
  const workflowId = parseInt(c.req.param('id'));
  const stepId = parseInt(c.req.param('stepId'));

  // Delete dependencies
  await db.delete(jobWorkflowDependencies).where(
    or(
      eq(jobWorkflowDependencies.stepId, stepId),
      eq(jobWorkflowDependencies.dependsOnStepId, stepId)
    )
  );

  const [deleted] = await db.delete(jobWorkflowSteps)
    .where(eq(jobWorkflowSteps.id, stepId))
    .returning();

  if (!deleted) return errorResponse(c, 'ไม่พบขั้นตอนที่ต้องการลบ', 404);

  return successResponse(c, deleted, 'ลบขั้นตอนสำเร็จ');
});

export default workflowsRouter;
