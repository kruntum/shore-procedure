import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. 'TERMINAL_SHIPPING', 'CUSTOMS', 'PERMITS_CERTS'
  name: text('name').notNull(),          // e.g. 'งานหน้าท่าและสายเรือ', 'พิธีการศุลกากร'
  icon: text('icon').default('📋').notNull(), // Emoji icon
  color: text('color').default('blue').notNull(), // Ant Design tag color
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
