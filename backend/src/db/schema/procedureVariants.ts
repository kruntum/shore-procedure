import { pgTable, serial, text, integer, index } from 'drizzle-orm/pg-core';
import { procedures } from './procedures';

export const procedureVariants = pgTable('procedure_variants', {
  id: serial('id').primaryKey(),
  procedureId: integer('procedure_id').references(() => procedures.id, { onDelete: 'cascade' }).notNull(),
  conditionName: text('condition_name').notNull(), // เช่น 'งานปกติ (ออนไลน์)', 'ระบบขัดข้อง'
  executionMethod: text('execution_method').notNull(), // เช่น 'Web Portal', 'LINE', 'ยื่นหน้าเคาน์เตอร์'
  cutoffTime: text('cutoff_time'), // เช่น 'ก่อน 15:30 น.'
  notes: text('notes'),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('variant_procedure_idx').on(table.procedureId),
]);
