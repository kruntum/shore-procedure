import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const governmentAgencies = pgTable('government_agencies', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. 'CUSTOMS_DEPT', 'DFT', 'DOA', 'ACFS'
  name: text('name').notNull(),          // e.g. 'กรมศุลกากร', 'กรมการค้าต่างประเทศ'
  shortName: text('short_name'),         // e.g. 'ศุลกากร', 'อย.', 'มกอช.'
  contactInfo: text('contact_info'),     // เบอร์โทรศัพท์ หรือเคาน์เตอร์ติดต่อ
  website: text('website'),              // URL ระบบ e-Service
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type GovernmentAgency = typeof governmentAgencies.$inferSelect;
export type NewGovernmentAgency = typeof governmentAgencies.$inferInsert;
