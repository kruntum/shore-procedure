import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { ports } from './ports';
import { agents } from './agents';
import { workTypes } from './workTypes';
import { categories } from './categories';
import { governmentAgencies } from './governmentAgencies';

export const procedures = pgTable('procedures', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  portId: integer('port_id').references(() => ports.id, { onDelete: 'set null' }),
  agentId: integer('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  governmentAgencyId: integer('government_agency_id').references(() => governmentAgencies.id, { onDelete: 'set null' }),
  workTypeId: integer('work_type_id').references(() => workTypes.id, { onDelete: 'restrict' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  referenceDocuments: text('reference_documents').default('B/L, Booking Confirmation, ใบเสร็จชำระเงิน'),
  contactHotline: text('contact_hotline'),
  updatedBy: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Procedure = typeof procedures.$inferSelect;
export type NewProcedure = typeof procedures.$inferInsert;
