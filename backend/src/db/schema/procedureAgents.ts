import { pgTable, serial, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { procedures } from './procedures';
import { agents } from './agents';

export const procedureAgents = pgTable('procedure_agents', {
  id: serial('id').primaryKey(),
  procedureId: integer('procedure_id').references(() => procedures.id, { onDelete: 'cascade' }).notNull(),
  agentId: integer('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('procedure_agent_unique_idx').on(table.procedureId, table.agentId),
]);

export type ProcedureAgent = typeof procedureAgents.$inferSelect;
export type NewProcedureAgent = typeof procedureAgents.$inferInsert;
