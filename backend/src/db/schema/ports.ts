import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const ports = pgTable('ports', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. A2, A3, C1C2, B2
  name: text('name').notNull(),          // e.g. ท่าเรือ A2
  paymentMethod: text('payment_method').default('ออนไลน์').notNull(), // เช่น ออนไลน์, หน้าเคาน์เตอร์เท่านั้น
  operatingHours: text('operating_hours'), // เช่น 24 ชม., 08:00-19:30
  notes: text('notes'),                    // เช่น รอดราฟ ช้า, ปิดเคาน์เตอร์ 2 ช่วง
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
