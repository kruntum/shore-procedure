CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT '📋' NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "government_agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"contact_info" text,
	"website" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "government_agencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "procedure_gov_agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"procedure_id" integer NOT NULL,
	"government_agency_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "procedures" DROP CONSTRAINT "procedures_port_id_ports_id_fk";
--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "port_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "government_agency_id" integer;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "contact_hotline" text;--> statement-breakpoint
ALTER TABLE "procedure_gov_agencies" ADD CONSTRAINT "procedure_gov_agencies_procedure_id_procedures_id_fk" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedure_gov_agencies" ADD CONSTRAINT "procedure_gov_agencies_government_agency_id_government_agencies_id_fk" FOREIGN KEY ("government_agency_id") REFERENCES "public"."government_agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "procedure_gov_agency_unique_idx" ON "procedure_gov_agencies" USING btree ("procedure_id","government_agency_id");--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_government_agency_id_government_agencies_id_fk" FOREIGN KEY ("government_agency_id") REFERENCES "public"."government_agencies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_port_id_ports_id_fk" FOREIGN KEY ("port_id") REFERENCES "public"."ports"("id") ON DELETE set null ON UPDATE no action;