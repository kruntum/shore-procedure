CREATE TABLE "procedure_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"procedure_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "procedures" DROP CONSTRAINT "procedures_agent_id_agents_id_fk";
--> statement-breakpoint
DROP INDEX "port_agent_work_type_idx";--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "agent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "procedure_agents" ADD CONSTRAINT "procedure_agents_procedure_id_procedures_id_fk" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedure_agents" ADD CONSTRAINT "procedure_agents_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "procedure_agent_unique_idx" ON "procedure_agents" USING btree ("procedure_id","agent_id");--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;