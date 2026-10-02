CREATE TABLE "responsible_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"icon" text DEFAULT '👤' NOT NULL,
	"description" text DEFAULT '',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "responsible_roles_code_unique" UNIQUE("code"),
	CONSTRAINT "responsible_roles_name_unique" UNIQUE("name")
);
