import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { procedures } from '../db/schema/procedures';
import { procedureVariants } from '../db/schema/procedureVariants';
import { procedureSteps } from '../db/schema/procedureSteps';
import { stepImages } from '../db/schema/stepImages';
import { procedureAgents } from '../db/schema/procedureAgents';
import { procedureGovAgencies } from '../db/schema/procedureGovAgencies';
import { categories } from '../db/schema/categories';
import { governmentAgencies } from '../db/schema/governmentAgencies';
import { eq, and, ilike, or, inArray } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthUser } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';
import { deleteFile, copyFile } from '../services/minio';

const proceduresRouter = new Hono();

export function formatProcedureWithRelations(proc: any) {
  if (!proc) return proc;
  const directAgents = proc.procedureAgents?.map((pa: any) => pa.agent).filter(Boolean) || [];
  if (directAgents.length === 0 && proc.agent) {
    directAgents.push(proc.agent);
  }
  const directGovAgencies = proc.procedureGovAgencies?.map((pga: any) => pga.governmentAgency).filter(Boolean) || [];
  if (directGovAgencies.length === 0 && proc.governmentAgency) {
    directGovAgencies.push(proc.governmentAgency);
  }
  return {
    ...proc,
    agents: directAgents,
    governmentAgencies: directGovAgencies,
  };
}

export const formatProcedureWithAgents = formatProcedureWithRelations;

const stepCreateSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string().min(1, 'กรุณาระบุชื่อขั้นตอน'),
  description: z.string().optional().default(''),
  responsibleRole: z.string().optional().default('พนักงานหน้างาน'),
  sortOrder: z.number().int().default(0),
});

const variantCreateSchema = z.object({
  conditionName: z.string().min(1, 'กรุณาระบุชื่อเงื่อนไข/กรณี'),
  executionMethod: z.string().min(1, 'กรุณาระบุวิธีการดำเนินการ'),
  cutoffTime: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  sortOrder: z.number().int().default(0),
  steps: z.array(stepCreateSchema).optional().default([]),
});

const procedureCreateSchema = z.object({
  categoryId: z.number().int().positive().optional().nullable(),
  portId: z.number().int().positive().optional().nullable(),
  agentId: z.number().int().positive().optional().nullable(),
  agentIds: z.array(z.number().int().positive()).optional(),
  governmentAgencyId: z.number().int().positive().optional().nullable(),
  governmentAgencyIds: z.array(z.number().int().positive()).optional(),
  workTypeId: z.number().int().positive(),
  title: z.string().min(1, 'กรุณาระบุหัวข้อคู่มือ'),
  description: z.string().optional().default(''),
  referenceDocuments: z.string().optional().default('B/L, Booking Confirmation, ใบเสร็จชำระเงิน'),
  contactHotline: z.string().optional().default(''),
  variants: z.array(variantCreateSchema).optional().default([]),
});

// GET /api/procedures (List & Filter)
proceduresRouter.get('/', async (c) => {
  const categoryId = c.req.query('categoryId');
  const portId = c.req.query('portId');
  const agentId = c.req.query('agentId');
  const governmentAgencyId = c.req.query('governmentAgencyId');
  const workTypeId = c.req.query('workTypeId');
  const search = c.req.query('search');

  const conditions = [];

  if (categoryId) conditions.push(eq(procedures.categoryId, parseInt(categoryId)));
  if (portId) conditions.push(eq(procedures.portId, parseInt(portId)));
  if (agentId) {
    const targetAgentId = parseInt(agentId);
    conditions.push(
      or(
        eq(procedures.agentId, targetAgentId),
        inArray(
          procedures.id,
          db.select({ procedureId: procedureAgents.procedureId })
            .from(procedureAgents)
            .where(eq(procedureAgents.agentId, targetAgentId))
        )
      )
    );
  }
  if (governmentAgencyId) {
    const targetGovId = parseInt(governmentAgencyId);
    conditions.push(
      or(
        eq(procedures.governmentAgencyId, targetGovId),
        inArray(
          procedures.id,
          db.select({ procedureId: procedureGovAgencies.procedureId })
            .from(procedureGovAgencies)
            .where(eq(procedureGovAgencies.governmentAgencyId, targetGovId))
        )
      )
    );
  }
  if (workTypeId) conditions.push(eq(procedures.workTypeId, parseInt(workTypeId)));
  if (search) {
    conditions.push(or(
      ilike(procedures.title, `%${search}%`),
      ilike(procedures.description, `%${search}%`)
    ));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const list = await db.query.procedures.findMany({
    where: whereClause,
    with: {
      category: true,
      port: true,
      agent: true,
      governmentAgency: true,
      procedureAgents: {
        with: {
          agent: true,
        },
      },
      procedureGovAgencies: {
        with: {
          governmentAgency: true,
        },
      },
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
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });

  return successResponse(c, list.map(formatProcedureWithRelations));
});

// GET /api/procedures/meta/roles (Get standard & existing roles)
proceduresRouter.get('/meta/roles', async (c) => {
  const fallbackRoles = [
    'พนักงานหน้างาน / ชิปปิ้ง',
    'เจ้าหน้าที่ท่าเรือ',
    'เจ้าหน้าที่สายเรือ / เอเย่นต์',
    'พนักงานออฟฟิศ / การเงิน',
    'เจ้าหน้าที่ศุลกากร',
    'เจ้าหน้าที่หน่วยงานราชการ',
  ];

  try {
    const masterRoles = await db.query.responsibleRoles.findMany({
      orderBy: (r, { asc }) => [asc(r.sortOrder), asc(r.id)],
    });
    const stepRoles = await db.selectDistinct({ role: procedureSteps.responsibleRole })
      .from(procedureSteps);

    const combined = Array.from(new Set([
      ...masterRoles.map((r) => r.name),
      ...fallbackRoles,
      ...stepRoles.map((r) => r.role).filter(Boolean),
    ]));
    return successResponse(c, combined);
  } catch {
    return successResponse(c, fallbackRoles);
  }
});

// GET /api/procedures/:id (Single procedure detail with all relations)
proceduresRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const proc = await db.query.procedures.findFirst({
    where: eq(procedures.id, id),
    with: {
      category: true,
      port: true,
      agent: true,
      governmentAgency: true,
      procedureAgents: {
        with: {
          agent: true,
        },
      },
      procedureGovAgencies: {
        with: {
          governmentAgency: true,
        },
      },
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

  if (!proc) return errorResponse(c, 'ไม่พบคู่มือที่ระบุ', 404);
  return successResponse(c, formatProcedureWithRelations(proc));
});

// POST /api/procedures (Add Procedure with nested variants/steps) - Both Admin & User
proceduresRouter.post('/', requireAuth, zValidator('json', procedureCreateSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user') as AuthUser;

  const finalAgentIds = body.agentIds && body.agentIds.length > 0
    ? body.agentIds
    : (body.agentId ? [body.agentId] : []);

  const finalGovAgencyIds = body.governmentAgencyIds && body.governmentAgencyIds.length > 0
    ? body.governmentAgencyIds
    : (body.governmentAgencyId ? [body.governmentAgencyId] : []);

  // Create procedure
  const [createdProc] = await db.insert(procedures).values({
    categoryId: body.categoryId || null,
    portId: body.portId || null,
    agentId: finalAgentIds[0] || null,
    governmentAgencyId: finalGovAgencyIds[0] || null,
    workTypeId: body.workTypeId,
    title: body.title,
    description: body.description,
    referenceDocuments: body.referenceDocuments || 'B/L, Booking Confirmation, ใบเสร็จชำระเงิน',
    contactHotline: body.contactHotline || null,
    updatedBy: user.fullName || user.displayName || user.username,
  }).returning();

  // Insert procedureAgents junction records
  for (const aId of finalAgentIds) {
    await db.insert(procedureAgents).values({
      procedureId: createdProc.id,
      agentId: aId,
    });
  }

  // Insert procedureGovAgencies junction records
  for (const gId of finalGovAgencyIds) {
    await db.insert(procedureGovAgencies).values({
      procedureId: createdProc.id,
      governmentAgencyId: gId,
    });
  }

  // Create variants & steps if provided
  if (body.variants && body.variants.length > 0) {
    for (let i = 0; i < body.variants.length; i++) {
      const v = body.variants[i];
      const [createdVariant] = await db.insert(procedureVariants).values({
        procedureId: createdProc.id,
        conditionName: v.conditionName,
        executionMethod: v.executionMethod,
        cutoffTime: v.cutoffTime,
        notes: v.notes,
        sortOrder: v.sortOrder || i + 1,
      }).returning();

      if (v.steps && v.steps.length > 0) {
        for (let j = 0; j < v.steps.length; j++) {
          const s = v.steps[j];
          await db.insert(procedureSteps).values({
            variantId: createdVariant.id,
            stepNumber: s.stepNumber || j + 1,
            title: s.title,
            description: s.description,
            responsibleRole: s.responsibleRole || 'พนักงานหน้างาน',
            sortOrder: s.sortOrder || j + 1,
          });
        }
      }
    }
  }

  // Fetch full object
  const fullProc = await db.query.procedures.findFirst({
    where: eq(procedures.id, createdProc.id),
    with: {
      category: true,
      port: true,
      agent: true,
      governmentAgency: true,
      procedureAgents: {
        with: {
          agent: true,
        },
      },
      procedureGovAgencies: {
        with: {
          governmentAgency: true,
        },
      },
      workType: true,
      variants: {
        with: {
          steps: {
            with: {
              images: true,
            },
          },
        },
      },
    },
  });

  return successResponse(c, formatProcedureWithRelations(fullProc), 'สร้างคู่มือสำเร็จ', 201);
});

const stepUpdateItemSchema = z.object({
  id: z.number().int().optional(),
  stepNumber: z.number().int().positive().optional(),
  title: z.string().min(1, 'กรุณาระบุชื่อขั้นตอน'),
  description: z.string().optional().default(''),
  responsibleRole: z.string().optional().default('พนักงานหน้างาน'),
  sortOrder: z.number().int().optional().default(0),
});

const variantUpdateItemSchema = z.object({
  id: z.number().int().optional(),
  conditionName: z.string().min(1, 'กรุณาระบุชื่อเงื่อนไข/กรณี'),
  executionMethod: z.string().min(1, 'กรุณาระบุวิธีการดำเนินการ'),
  cutoffTime: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  sortOrder: z.number().int().optional().default(0),
  steps: z.array(stepUpdateItemSchema).optional().default([]),
});

const procedureUpdateFullSchema = z.object({
  categoryId: z.number().int().positive().optional().nullable(),
  portId: z.number().int().positive().optional().nullable(),
  workTypeId: z.number().int().positive().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  referenceDocuments: z.string().optional(),
  contactHotline: z.string().optional().nullable(),
  agentId: z.number().int().positive().optional().nullable(),
  agentIds: z.array(z.number().int().positive()).optional(),
  governmentAgencyId: z.number().int().positive().optional().nullable(),
  governmentAgencyIds: z.array(z.number().int().positive()).optional(),
  variants: z.array(variantUpdateItemSchema).optional(),
});

// PUT /api/procedures/:id (Update Procedure with variants & steps)
proceduresRouter.put('/:id', requireAuth, zValidator('json', procedureUpdateFullSchema), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');
  const user = c.get('user') as AuthUser;

  const existingProc = await db.query.procedures.findFirst({
    where: eq(procedures.id, id),
    with: {
      variants: {
        with: {
          steps: {
            with: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!existingProc) return errorResponse(c, 'ไม่พบคู่มือที่ต้องการแก้ไข', 404);

  // Update procedure header
  const updateData: Record<string, any> = {
    updatedBy: user.fullName || user.displayName || user.username,
    updatedAt: new Date(),
  };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.referenceDocuments !== undefined) updateData.referenceDocuments = body.referenceDocuments;
  if (body.contactHotline !== undefined) updateData.contactHotline = body.contactHotline || null;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
  if (body.portId !== undefined) updateData.portId = body.portId || null;
  if (body.workTypeId !== undefined) updateData.workTypeId = body.workTypeId;

  // Sync agents (handles clearing when empty array [] is passed)
  if (body.agentIds !== undefined) {
    const finalAgentIds = body.agentIds;
    updateData.agentId = finalAgentIds.length > 0 ? finalAgentIds[0] : null;
    await db.delete(procedureAgents).where(eq(procedureAgents.procedureId, id));
    for (const aId of finalAgentIds) {
      await db.insert(procedureAgents).values({
        procedureId: id,
        agentId: aId,
      });
    }
  } else if (body.agentId !== undefined) {
    updateData.agentId = body.agentId || null;
    await db.delete(procedureAgents).where(eq(procedureAgents.procedureId, id));
    if (body.agentId) {
      await db.insert(procedureAgents).values({
        procedureId: id,
        agentId: body.agentId,
      });
    }
  }

  // Sync government agencies (handles clearing when empty array [] is passed)
  if (body.governmentAgencyIds !== undefined) {
    const finalGovAgencyIds = body.governmentAgencyIds;
    updateData.governmentAgencyId = finalGovAgencyIds.length > 0 ? finalGovAgencyIds[0] : null;
    await db.delete(procedureGovAgencies).where(eq(procedureGovAgencies.procedureId, id));
    for (const gId of finalGovAgencyIds) {
      await db.insert(procedureGovAgencies).values({
        procedureId: id,
        governmentAgencyId: gId,
      });
    }
  } else if (body.governmentAgencyId !== undefined) {
    updateData.governmentAgencyId = body.governmentAgencyId || null;
    await db.delete(procedureGovAgencies).where(eq(procedureGovAgencies.procedureId, id));
    if (body.governmentAgencyId) {
      await db.insert(procedureGovAgencies).values({
        procedureId: id,
        governmentAgencyId: body.governmentAgencyId,
      });
    }
  }

  await db.update(procedures).set(updateData).where(eq(procedures.id, id));

  // If variants provided, synchronize variants and steps
  if (body.variants !== undefined) {
    const incomingVariantIds = body.variants.map((v) => v.id).filter(Boolean) as number[];

    // 1. Delete variants that are no longer present
    for (const existingVar of existingProc.variants) {
      if (!incomingVariantIds.includes(existingVar.id)) {
        for (const st of existingVar.steps) {
          for (const img of st.images) {
            try {
              await deleteFile(img.objectKey);
            } catch (err) {
              console.error(`Failed to delete MinIO file ${img.objectKey}:`, err);
            }
          }
        }
        await db.delete(procedureVariants).where(eq(procedureVariants.id, existingVar.id));
      }
    }

    // 2. Process each incoming variant
    for (let i = 0; i < body.variants.length; i++) {
      const v = body.variants[i];
      let variantId = v.id;

      if (variantId) {
        await db.update(procedureVariants).set({
          conditionName: v.conditionName,
          executionMethod: v.executionMethod,
          cutoffTime: v.cutoffTime,
          notes: v.notes,
          sortOrder: v.sortOrder || i + 1,
        }).where(eq(procedureVariants.id, variantId));
      } else {
        const [newVar] = await db.insert(procedureVariants).values({
          procedureId: id,
          conditionName: v.conditionName,
          executionMethod: v.executionMethod,
          cutoffTime: v.cutoffTime,
          notes: v.notes,
          sortOrder: v.sortOrder || i + 1,
        }).returning();
        variantId = newVar.id;
      }

      // Synchronize steps for this variant
      const existingVar = existingProc.variants.find((ev) => ev.id === variantId);
      const incomingStepIds = (v.steps || []).map((s) => s.id).filter(Boolean) as number[];

      if (existingVar) {
        for (const existingStep of existingVar.steps) {
          if (!incomingStepIds.includes(existingStep.id)) {
            for (const img of existingStep.images) {
              try {
                await deleteFile(img.objectKey);
              } catch (err) {
                console.error(`Failed to delete MinIO file ${img.objectKey}:`, err);
              }
            }
            await db.delete(procedureSteps).where(eq(procedureSteps.id, existingStep.id));
          }
        }
      }

      // Update or insert steps
      if (v.steps && v.steps.length > 0) {
        for (let j = 0; j < v.steps.length; j++) {
          const s = v.steps[j];
          if (s.id) {
            await db.update(procedureSteps).set({
              stepNumber: s.stepNumber || j + 1,
              title: s.title,
              description: s.description,
              responsibleRole: s.responsibleRole || 'พนักงานหน้างาน',
              sortOrder: s.sortOrder || j + 1,
            }).where(eq(procedureSteps.id, s.id));
          } else {
            await db.insert(procedureSteps).values({
              variantId: variantId!,
              stepNumber: s.stepNumber || j + 1,
              title: s.title,
              description: s.description,
              responsibleRole: s.responsibleRole || 'พนักงานหน้างาน',
              sortOrder: s.sortOrder || j + 1,
            });
          }
        }
      }
    }
  }

  // Fetch updated procedure with full relations
  const fullUpdated = await db.query.procedures.findFirst({
    where: eq(procedures.id, id),
    with: {
      category: true,
      port: true,
      agent: true,
      governmentAgency: true,
      procedureAgents: {
        with: {
          agent: true,
        },
      },
      procedureGovAgencies: {
        with: {
          governmentAgency: true,
        },
      },
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

  return successResponse(c, formatProcedureWithRelations(fullUpdated), 'แก้ไขคู่มือสำเร็จ');
});

// POST /api/procedures/:id/duplicate (Duplicate procedure with variants, steps, and copy MinIO images)
proceduresRouter.post('/:id/duplicate', requireAuth, async (c) => {
  const id = parseInt(c.req.param('id'));
  const user = c.get('user') as AuthUser;

  const orig = await db.query.procedures.findFirst({
    where: eq(procedures.id, id),
    with: {
      procedureAgents: true,
      procedureGovAgencies: true,
      variants: {
        with: {
          steps: {
            with: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!orig) return errorResponse(c, 'ไม่พบคู่มือต้นฉบับที่ต้องการคัดลอก', 404);

  // Strip any existing repeated (สำเนา) suffixes to find clean base title
  const baseTitle = orig.title.replace(/(\s*\(สำเนา(\s*\d+)?\))+$/g, '').trim();

  // Find all existing procedures sharing this baseTitle to find next copy number
  const allProcs = await db.query.procedures.findMany({
    columns: { title: true },
  });

  let maxCopyNum = 0;
  for (const p of allProcs) {
    if (p.title.startsWith(baseTitle)) {
      const match = p.title.match(/^(.*?)(?:\s*\(สำเนา(?:\s*(\d+))?\))+$/);
      if (match && match[1].trim() === baseTitle) {
        const num = match[2] ? parseInt(match[2], 10) : 1;
        if (num > maxCopyNum) maxCopyNum = num;
      }
    }
  }

  const newTitle = maxCopyNum === 0
    ? `${baseTitle} (สำเนา)`
    : `${baseTitle} (สำเนา ${maxCopyNum + 1})`;

  const [newProc] = await db.insert(procedures).values({
    categoryId: orig.categoryId,
    portId: orig.portId,
    agentId: orig.agentId,
    governmentAgencyId: orig.governmentAgencyId,
    workTypeId: orig.workTypeId,
    title: newTitle,
    description: orig.description,
    referenceDocuments: orig.referenceDocuments,
    contactHotline: orig.contactHotline,
    updatedBy: user.fullName || user.displayName || user.username,
  }).returning();

  if (orig.procedureAgents && orig.procedureAgents.length > 0) {
    for (const pa of orig.procedureAgents) {
      await db.insert(procedureAgents).values({
        procedureId: newProc.id,
        agentId: pa.agentId,
      });
    }
  }

  if (orig.procedureGovAgencies && orig.procedureGovAgencies.length > 0) {
    for (const pga of orig.procedureGovAgencies) {
      await db.insert(procedureGovAgencies).values({
        procedureId: newProc.id,
        governmentAgencyId: pga.governmentAgencyId,
      });
    }
  }

  if (orig.variants && orig.variants.length > 0) {
    for (const v of orig.variants) {
      const [newVar] = await db.insert(procedureVariants).values({
        procedureId: newProc.id,
        conditionName: v.conditionName,
        executionMethod: v.executionMethod,
        cutoffTime: v.cutoffTime,
        notes: v.notes,
        sortOrder: v.sortOrder,
      }).returning();

      if (v.steps && v.steps.length > 0) {
        for (const s of v.steps) {
          const [newStep] = await db.insert(procedureSteps).values({
            variantId: newVar.id,
            stepNumber: s.stepNumber,
            title: s.title,
            description: s.description,
            responsibleRole: s.responsibleRole,
            sortOrder: s.sortOrder,
          }).returning();

          if (s.images && s.images.length > 0) {
            for (const img of s.images) {
              const ext = img.originalFilename.split('.').pop() || 'png';
              const newObjectKey = `steps/${newStep.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
              try {
                await copyFile(img.objectKey, newObjectKey);
                await db.insert(stepImages).values({
                  stepId: newStep.id,
                  bucketName: img.bucketName,
                  objectKey: newObjectKey,
                  originalFilename: img.originalFilename,
                  caption: img.caption,
                  sortOrder: img.sortOrder,
                });
              } catch (copyErr) {
                console.error(`Failed to copy image ${img.objectKey} to ${newObjectKey}:`, copyErr);
              }
            }
          }
        }
      }
    }
  }

  const fullDuplicated = await db.query.procedures.findFirst({
    where: eq(procedures.id, newProc.id),
    with: {
      category: true,
      port: true,
      agent: true,
      governmentAgency: true,
      procedureAgents: {
        with: {
          agent: true,
        },
      },
      procedureGovAgencies: {
        with: {
          governmentAgency: true,
        },
      },
      workType: true,
      variants: {
        with: {
          steps: {
            with: {
              images: true,
            },
          },
        },
      },
    },
  });

  return successResponse(c, formatProcedureWithRelations(fullDuplicated), 'คัดลอกคู่มือและรูปภาพสำเร็จ', 201);
});

// DELETE /api/procedures/:id (ADMIN ONLY - Cascade delete MinIO images & DB)
proceduresRouter.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));

  const proc = await db.query.procedures.findFirst({
    where: eq(procedures.id, id),
    with: {
      variants: {
        with: {
          steps: {
            with: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!proc) return errorResponse(c, 'ไม่พบคู่มือที่ต้องการลบ', 404);

  // Clean up MinIO images
  for (const v of proc.variants) {
    for (const s of v.steps) {
      for (const img of s.images) {
        try {
          await deleteFile(img.objectKey);
        } catch (err) {
          console.error(`Failed to delete MinIO file ${img.objectKey}:`, err);
        }
      }
    }
  }

  // DB cascade deletes variants, steps, images, procedureGovAgencies automatically via foreign key ON DELETE CASCADE
  await db.delete(procedures).where(eq(procedures.id, id));

  return successResponse(c, { id }, 'ลบคู่มือและรูปภาพทั้งหมดสำเร็จ');
});

// POST /api/procedures/:id/variants (Add variant)
proceduresRouter.post('/:id/variants', requireAuth, zValidator('json', variantCreateSchema), async (c) => {
  const procedureId = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  const [variant] = await db.insert(procedureVariants).values({
    procedureId,
    conditionName: body.conditionName,
    executionMethod: body.executionMethod,
    cutoffTime: body.cutoffTime,
    notes: body.notes,
    sortOrder: body.sortOrder,
  }).returning();

  if (body.steps && body.steps.length > 0) {
    for (let j = 0; j < body.steps.length; j++) {
      const s = body.steps[j];
      await db.insert(procedureSteps).values({
        variantId: variant.id,
        stepNumber: s.stepNumber || j + 1,
        title: s.title,
        description: s.description,
        sortOrder: s.sortOrder || j + 1,
      });
    }
  }

  const result = await db.query.procedureVariants.findFirst({
    where: eq(procedureVariants.id, variant.id),
    with: { steps: { with: { images: true } } },
  });

  return successResponse(c, result, 'เพิ่มเงื่อนไขสำเร็จ', 201);
});

// PUT /api/procedures/variants/:variantId (Edit variant)
proceduresRouter.put('/variants/:variantId', requireAuth, zValidator('json', variantCreateSchema.partial()), async (c) => {
  const variantId = parseInt(c.req.param('variantId'));
  const body = c.req.valid('json');

  const [updated] = await db.update(procedureVariants)
    .set(body)
    .where(eq(procedureVariants.id, variantId))
    .returning();

  if (!updated) return errorResponse(c, 'ไม่พบเงื่อนไขที่ต้องการแก้ไข', 404);
  return successResponse(c, updated, 'แก้ไขเงื่อนไขสำเร็จ');
});

// DELETE /api/procedures/variants/:variantId (ADMIN ONLY)
proceduresRouter.delete('/variants/:variantId', requireAuth, requireAdmin, async (c) => {
  const variantId = parseInt(c.req.param('variantId'));

  const [deleted] = await db.delete(procedureVariants)
    .where(eq(procedureVariants.id, variantId))
    .returning();

  if (!deleted) return errorResponse(c, 'ไม่พบเงื่อนไขที่ต้องการลบ', 404);
  return successResponse(c, deleted, 'ลบเงื่อนไขสำเร็จ');
});

// POST /api/procedures/variants/:variantId/steps (Add step)
proceduresRouter.post('/variants/:variantId/steps', requireAuth, zValidator('json', stepCreateSchema), async (c) => {
  const variantId = parseInt(c.req.param('variantId'));
  const body = c.req.valid('json');

  const [step] = await db.insert(procedureSteps).values({
    variantId,
    stepNumber: body.stepNumber,
    title: body.title,
    description: body.description,
    responsibleRole: body.responsibleRole || 'พนักงานหน้างาน',
    sortOrder: body.sortOrder,
  }).returning();

  return successResponse(c, step, 'เพิ่มขั้นตอนสำเร็จ', 201);
});

// PUT /api/procedures/steps/:stepId (Edit step)
proceduresRouter.put('/steps/:stepId', requireAuth, zValidator('json', stepCreateSchema.partial()), async (c) => {
  const stepId = parseInt(c.req.param('stepId'));
  const body = c.req.valid('json');

  const [updated] = await db.update(procedureSteps)
    .set(body)
    .where(eq(procedureSteps.id, stepId))
    .returning();

  if (!updated) return errorResponse(c, 'ไม่พบขั้นตอนที่ต้องการแก้ไข', 404);
  return successResponse(c, updated, 'แก้ไขขั้นตอนสำเร็จ');
});

// DELETE /api/procedures/steps/:stepId (ADMIN ONLY)
proceduresRouter.delete('/steps/:stepId', requireAuth, requireAdmin, async (c) => {
  const stepId = parseInt(c.req.param('stepId'));

  const [deleted] = await db.delete(procedureSteps)
    .where(eq(procedureSteps.id, stepId))
    .returning();

  if (!deleted) return errorResponse(c, 'ไม่พบขั้นตอนที่ต้องการลบ', 404);
  return successResponse(c, deleted, 'ลบขั้นตอนสำเร็จ');
});

export default proceduresRouter;
