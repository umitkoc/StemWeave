CREATE EXTENSION IF NOT EXISTS "citext";
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid,
	"actor_user_id" uuid,
	"action" varchar(120) NOT NULL,
	"target_type" varchar(80) NOT NULL,
	"target_id" uuid,
	"request_id" uuid,
	"before_data" jsonb,
	"after_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instrument_definitions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"display_name" varchar(80) NOT NULL,
	"family" varchar(50) NOT NULL,
	"color_hex" varchar(7) NOT NULL,
	"icon_key" varchar(80) NOT NULL,
	"sort_order" smallint NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instrument_definitions_family_check" CHECK ("instrument_definitions"."family" in ('KEYS', 'STRINGS', 'PERCUSSION', 'BRASS', 'WIND'))
);
--> statement-breakpoint
CREATE TABLE "project_invitations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"email" "citext" NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"roles" text[] NOT NULL,
	"instrument_ids" text[] DEFAULT '{}' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_member_instruments" (
	"project_member_id" uuid NOT NULL,
	"instrument_id" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_member_instruments_project_member_id_instrument_id_pk" PRIMARY KEY("project_member_id","instrument_id")
);
--> statement-breakpoint
CREATE TABLE "project_member_roles" (
	"project_member_id" uuid NOT NULL,
	"role" text NOT NULL,
	"granted_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_member_roles_project_member_id_role_pk" PRIMARY KEY("project_member_id","role"),
	CONSTRAINT "project_member_roles_role_check" CHECK ("project_member_roles"."role" in ('OWNER', 'CONDUCTOR', 'MUSICIAN', 'MIX_ENGINEER', 'MASTERING_ENGINEER', 'VIEWER'))
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"membership_status" text DEFAULT 'INVITED' NOT NULL,
	"invited_by_user_id" uuid,
	"joined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_members_status_check" CHECK ("project_members"."membership_status" in ('INVITED', 'ACTIVE', 'REMOVED'))
);
--> statement-breakpoint
CREATE TABLE "project_rule_versions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"bpm" numeric(6, 3) NOT NULL,
	"time_signature_numerator" smallint NOT NULL,
	"time_signature_denominator" smallint NOT NULL,
	"key_signature" varchar(20),
	"sample_rate_hz" integer DEFAULT 48000 NOT NULL,
	"tuning_hz" numeric(6, 2) DEFAULT '440.00' NOT NULL,
	"ticks_per_quarter" integer DEFAULT 960 NOT NULL,
	"count_in_bars" smallint DEFAULT 1 NOT NULL,
	"change_reason" text,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_rule_versions_bpm_check" CHECK ("project_rule_versions"."bpm" between 20 and 300),
	CONSTRAINT "project_rule_versions_time_signature_check" CHECK ("project_rule_versions"."time_signature_numerator" > 0 and "project_rule_versions"."time_signature_denominator" in (4, 8))
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"active_rule_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "projects_status_check" CHECK ("projects"."status" in ('DRAFT', 'ACTIVE', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" "citext" NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"avatar_url" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_status_check" CHECK ("users"."status" in ('ACTIVE', 'SUSPENDED', 'DELETED'))
);
--> statement-breakpoint
DROP TABLE "test_table" CASCADE;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_member_instruments" ADD CONSTRAINT "project_member_instruments_project_member_id_project_members_id_fk" FOREIGN KEY ("project_member_id") REFERENCES "public"."project_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_member_instruments" ADD CONSTRAINT "project_member_instruments_instrument_id_instrument_definitions_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instrument_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_member_roles" ADD CONSTRAINT "project_member_roles_project_member_id_project_members_id_fk" FOREIGN KEY ("project_member_id") REFERENCES "public"."project_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_member_roles" ADD CONSTRAINT "project_member_roles_granted_by_user_id_users_id_fk" FOREIGN KEY ("granted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_rule_versions" ADD CONSTRAINT "project_rule_versions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_rule_versions" ADD CONSTRAINT "project_rule_versions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_active_rule_version_id_project_rule_versions_id_fk" FOREIGN KEY ("active_rule_version_id") REFERENCES "public"."project_rule_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_project_created_idx" ON "audit_events" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_events_actor_created_idx" ON "audit_events" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_events_target_idx" ON "audit_events" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "instrument_definitions_color_unique" ON "instrument_definitions" USING btree ("color_hex");--> statement-breakpoint
CREATE UNIQUE INDEX "project_invitations_token_unique" ON "project_invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "project_invitations_project_email_unique" ON "project_invitations" USING btree ("project_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "project_members_project_user_unique" ON "project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "project_members_user_status_idx" ON "project_members" USING btree ("user_id","membership_status");--> statement-breakpoint
CREATE UNIQUE INDEX "project_rule_versions_number_unique" ON "project_rule_versions" USING btree ("project_id","version_number");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_owner_slug_unique" ON "projects" USING btree ("owner_user_id","slug");--> statement-breakpoint
CREATE INDEX "projects_status_updated_idx" ON "projects" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
INSERT INTO "instrument_definitions"
	("id", "display_name", "family", "color_hex", "icon_key", "sort_order", "metadata")
VALUES
	('piano', 'Piyano', 'KEYS', '#38A9FF', 'piano', 10, '{}'),
	('cello', 'Cello', 'STRINGS', '#9B6537', 'cello', 20, '{}'),
	('violin', 'Violin', 'STRINGS', '#E58A3A', 'violin', 30, '{}'),
	('guitar', 'Gitar', 'STRINGS', '#52BD66', 'guitar', 40, '{}'),
	('drums', 'Bateri', 'PERCUSSION', '#E6534A', 'drums', 50, '{}'),
	('brass', 'Brass', 'BRASS', '#F3C84B', 'brass', 60, '{}'),
	('flute', 'Flute', 'WIND', '#6FDDD3', 'flute', 70, '{}')
ON CONFLICT ("id") DO UPDATE SET
	"display_name" = EXCLUDED."display_name",
	"family" = EXCLUDED."family",
	"color_hex" = EXCLUDED."color_hex",
	"icon_key" = EXCLUDED."icon_key",
	"sort_order" = EXCLUDED."sort_order",
	"updated_at" = now();
