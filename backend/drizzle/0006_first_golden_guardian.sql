CREATE TABLE "job_workflow_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" integer NOT NULL,
	"step_id" integer NOT NULL,
	"depends_on_step_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_workflow_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" integer NOT NULL,
	"title" text NOT NULL,
	"brief_description" text,
	"procedure_id" integer,
	"government_agency_id" integer,
	"port_id" integer,
	"sort_order" integer DEFAULT 1 NOT NULL,
	"step_type" text DEFAULT 'standard' NOT NULL,
	"outputs" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category_id" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"estimated_duration" text,
	"target_audience" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_workflows_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "job_workflow_dependencies" ADD CONSTRAINT "job_workflow_dependencies_workflow_id_job_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."job_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_workflow_dependencies" ADD CONSTRAINT "job_workflow_dependencies_step_id_job_workflow_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."job_workflow_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_workflow_dependencies" ADD CONSTRAINT "job_workflow_dependencies_depends_on_step_id_job_workflow_steps_id_fk" FOREIGN KEY ("depends_on_step_id") REFERENCES "public"."job_workflow_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_workflow_steps" ADD CONSTRAINT "job_workflow_steps_workflow_id_job_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."job_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_workflow_steps" ADD CONSTRAINT "job_workflow_steps_procedure_id_procedures_id_fk" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_workflow_steps" ADD CONSTRAINT "job_workflow_steps_government_agency_id_government_agencies_id_fk" FOREIGN KEY ("government_agency_id") REFERENCES "public"."government_agencies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_workflow_steps" ADD CONSTRAINT "job_workflow_steps_port_id_ports_id_fk" FOREIGN KEY ("port_id") REFERENCES "public"."ports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_workflows" ADD CONSTRAINT "job_workflows_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;