import { pgTable, serial, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { ports } from './ports';
import { agents } from './agents';
import { workTypes } from './workTypes';

export const procedures = pgTable('procedures', {
  id: serial('id').primaryKey(),
  portId: integer('port_id').references(() => ports.id, { onDelete: 'restrict' }).notNull(),
  agentId: integer('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  workTypeId: integer('work_type_id').references(() => workTypes.id, { onDelete: 'restrict' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  referenceDocuments: text('reference_documents').default('B/L, Booking Confirmation, ใบเสร็จชำระเงิน'),
  updatedBy: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
