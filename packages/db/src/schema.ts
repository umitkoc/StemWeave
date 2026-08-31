import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: citext("email").notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    avatarUrl: text("avatar_url"),
    status: text("status").notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_status_idx").on(table.status),
    check("users_status_check", sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'DELETED')`),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    description: text("description"),
    status: text("status").notNull().default("DRAFT"),
    activeRuleVersionId: uuid("active_rule_version_id").references(
      (): AnyPgColumn => projectRuleVersions.id,
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("projects_owner_slug_unique").on(table.ownerUserId, table.slug),
    index("projects_status_updated_idx").on(table.status, table.updatedAt),
    check("projects_status_check", sql`${table.status} in ('DRAFT', 'ACTIVE', 'ARCHIVED')`),
  ],
);

export const projectRuleVersions = pgTable(
  "project_rule_versions",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    bpm: numeric("bpm", { precision: 6, scale: 3 }).notNull(),
    timeSignatureNumerator: smallint("time_signature_numerator").notNull(),
    timeSignatureDenominator: smallint("time_signature_denominator").notNull(),
    keySignature: varchar("key_signature", { length: 20 }),
    sampleRateHz: integer("sample_rate_hz").notNull().default(48_000),
    tuningHz: numeric("tuning_hz", { precision: 6, scale: 2 }).notNull().default("440.00"),
    ticksPerQuarter: integer("ticks_per_quarter").notNull().default(960),
    countInBars: smallint("count_in_bars").notNull().default(1),
    changeReason: text("change_reason"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("project_rule_versions_number_unique").on(table.projectId, table.versionNumber),
    check("project_rule_versions_bpm_check", sql`${table.bpm} between 20 and 300`),
    check(
      "project_rule_versions_time_signature_check",
      sql`${table.timeSignatureNumerator} > 0 and ${table.timeSignatureDenominator} in (4, 8)`,
    ),
  ],
);

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    membershipStatus: text("membership_status").notNull().default("INVITED"),
    invitedByUserId: uuid("invited_by_user_id").references(() => users.id),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("project_members_project_user_unique").on(table.projectId, table.userId),
    index("project_members_user_status_idx").on(table.userId, table.membershipStatus),
    check(
      "project_members_status_check",
      sql`${table.membershipStatus} in ('INVITED', 'ACTIVE', 'REMOVED')`,
    ),
  ],
);

export const projectMemberRoles = pgTable(
  "project_member_roles",
  {
    projectMemberId: uuid("project_member_id")
      .notNull()
      .references(() => projectMembers.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    grantedByUserId: uuid("granted_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.projectMemberId, table.role] }),
    check(
      "project_member_roles_role_check",
      sql`${table.role} in ('OWNER', 'CONDUCTOR', 'MUSICIAN', 'MIX_ENGINEER', 'MASTERING_ENGINEER', 'VIEWER')`,
    ),
  ],
);

export const instrumentDefinitions = pgTable(
  "instrument_definitions",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    displayName: varchar("display_name", { length: 80 }).notNull(),
    family: varchar("family", { length: 50 }).notNull(),
    colorHex: varchar("color_hex", { length: 7 }).notNull(),
    iconKey: varchar("icon_key", { length: 80 }).notNull(),
    sortOrder: smallint("sort_order").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    metadata: jsonb("metadata").notNull().default({}),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("instrument_definitions_color_unique").on(table.colorHex),
    check(
      "instrument_definitions_family_check",
      sql`${table.family} in ('KEYS', 'STRINGS', 'PERCUSSION', 'BRASS', 'WIND')`,
    ),
  ],
);

export const projectMemberInstruments = pgTable(
  "project_member_instruments",
  {
    projectMemberId: uuid("project_member_id")
      .notNull()
      .references(() => projectMembers.id, { onDelete: "cascade" }),
    instrumentId: varchar("instrument_id", { length: 50 })
      .notNull()
      .references(() => instrumentDefinitions.id),
    createdAt: createdAt(),
  },
  (table) => [primaryKey({ columns: [table.projectMemberId, table.instrumentId] })],
);

export const projectInvitations = pgTable(
  "project_invitations",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    email: citext("email").notNull(),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    roles: text("roles").array().notNull(),
    instrumentIds: text("instrument_ids").array().notNull().default([]),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("project_invitations_token_unique").on(table.tokenHash),
    uniqueIndex("project_invitations_project_email_unique").on(table.projectId, table.email),
  ],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    action: varchar("action", { length: 120 }).notNull(),
    targetType: varchar("target_type", { length: 80 }).notNull(),
    targetId: uuid("target_id"),
    requestId: uuid("request_id"),
    beforeData: jsonb("before_data"),
    afterData: jsonb("after_data"),
    createdAt: createdAt(),
  },
  (table) => [
    index("audit_events_project_created_idx").on(table.projectId, table.createdAt),
    index("audit_events_actor_created_idx").on(table.actorUserId, table.createdAt),
    index("audit_events_target_idx").on(table.targetType, table.targetId),
  ],
);

export type ProjectRole =
  "CONDUCTOR" | "MASTERING_ENGINEER" | "MIX_ENGINEER" | "MUSICIAN" | "OWNER" | "VIEWER";
