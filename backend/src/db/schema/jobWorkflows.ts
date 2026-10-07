import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { categories } from './categories';
import { procedures } from './procedures';
import { governmentAgencies } from './governmentAgencies';
import { ports } from './ports';

export const jobWorkflows = pgTable('job_workflows', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. 'WF-IMP-FOOD', 'WF-EXP-FRUIT'
  title: text('title').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  status: text('status').default('active').notNull(), // 'active', 'draft', 'archived'
  estimatedDuration: text('estimated_duration'), // e.g. '1-2 วันทำการ', '3-5 ชั่วโมง'
  targetAudience: text('target_audience'), // e.g. 'ชิปปิ้ง, พนักงานประสานงานนำเข้า'
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const jobWorkflowSteps = pgTable('job_workflow_steps', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').references(() => jobWorkflows.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  briefDescription: text('brief_description'),
  procedureId: integer('procedure_id').references(() => procedures.id, { onDelete: 'set null' }), // Optional link to SOP
  governmentAgencyId: integer('government_agency_id').references(() => governmentAgencies.id, { onDelete: 'set null' }),
  portId: integer('port_id').references(() => ports.id, { onDelete: 'set null' }),
  sortOrder: integer('sort_order').notNull().default(1),
  stepType: text('step_type').default('standard').notNull(), // 'standard', 'parallel', 'decision'
  estimatedMinutes: integer('estimated_minutes'), // e.g. 15, 30, 60 mins
  outputs: jsonb('outputs').$type<string[]>().default([]), // e.g. ['เลขที่ใบอนุญาต LPI 13 หลัก', 'เอกสาร พก.5']
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const jobWorkflowDependencies = pgTable('job_workflow_dependencies', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').references(() => jobWorkflows.id, { onDelete: 'cascade' }).notNull(),
  stepId: integer('step_id').references(() => jobWorkflowSteps.id, { onDelete: 'cascade' }).notNull(),
  dependsOnStepId: integer('depends_on_step_id').references(() => jobWorkflowSteps.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type JobWorkflow = typeof jobWorkflows.$inferSelect;
export type NewJobWorkflow = typeof jobWorkflows.$inferInsert;

export type JobWorkflowStep = typeof jobWorkflowSteps.$inferSelect;
export type NewJobWorkflowStep = typeof jobWorkflowSteps.$inferInsert;

export type JobWorkflowDependency = typeof jobWorkflowDependencies.$inferSelect;
export type NewJobWorkflowDependency = typeof jobWorkflowDependencies.$inferInsert;
