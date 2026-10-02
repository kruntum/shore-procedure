import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const responsibleRoles = pgTable('responsible_roles', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull().unique(),
  color: text('color').default('blue').notNull(),
  icon: text('icon').default('👤').notNull(),
  description: text('description').default(''),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ResponsibleRole = typeof responsibleRoles.$inferSelect;
export type NewResponsibleRole = typeof responsibleRoles.$inferInsert;
