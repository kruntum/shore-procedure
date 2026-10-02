ALTER TABLE "users" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "reference_documents" text DEFAULT 'B/L, Booking Confirmation, ใบเสร็จชำระเงิน';