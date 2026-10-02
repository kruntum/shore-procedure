import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. WHL, YML, EMC
  name: text('name').notNull(),          // e.g. WAN HAI LINES (THAILAND) LTD.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
