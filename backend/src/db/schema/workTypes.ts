import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const workTypes = pgTable('work_types', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. SHORE_PAY, DEPOSIT_RETURN
  name: text('name').notNull(),          // e.g. จ่ายชอร์, วางบิล/มัดจำตู้
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
