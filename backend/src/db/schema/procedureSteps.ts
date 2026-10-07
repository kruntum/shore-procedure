import { pgTable, serial, text, integer, index } from 'drizzle-orm/pg-core';
import { procedureVariants } from './procedureVariants';

export const procedureSteps = pgTable('procedure_steps', {
  id: serial('id').primaryKey(),
  variantId: integer('variant_id').references(() => procedureVariants.id, { onDelete: 'cascade' }).notNull(),
  stepNumber: integer('step_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  responsibleRole: text('responsible_role').default('พนักงานหน้างาน').notNull(),
  estimatedMinutes: integer('estimated_minutes'), // e.g. 15, 30, 60 mins
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('step_variant_idx').on(table.variantId),
]);
