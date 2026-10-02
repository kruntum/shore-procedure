import { pgTable, serial, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { procedureSteps } from './procedureSteps';

export const stepImages = pgTable('step_images', {
  id: serial('id').primaryKey(),
  stepId: integer('step_id').references(() => procedureSteps.id, { onDelete: 'cascade' }).notNull(),
  bucketName: text('bucket_name').notNull(),
  objectKey: text('object_key').notNull(),
  originalFilename: text('original_filename').notNull(),
  caption: text('caption'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('image_step_idx').on(table.stepId),
]);
