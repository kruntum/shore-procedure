import { pgTable, serial, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { procedures } from './procedures';
import { governmentAgencies } from './governmentAgencies';

export const procedureGovAgencies = pgTable('procedure_gov_agencies', {
  id: serial('id').primaryKey(),
  procedureId: integer('procedure_id').references(() => procedures.id, { onDelete: 'cascade' }).notNull(),
  governmentAgencyId: integer('government_agency_id').references(() => governmentAgencies.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('procedure_gov_agency_unique_idx').on(table.procedureId, table.governmentAgencyId),
]);

export type ProcedureGovAgency = typeof procedureGovAgencies.$inferSelect;
export type NewProcedureGovAgency = typeof procedureGovAgencies.$inferInsert;
