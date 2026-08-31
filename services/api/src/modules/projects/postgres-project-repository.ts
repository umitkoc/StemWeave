import { randomUUID } from "node:crypto";

import { CONTRACT_VERSION, type Measure, type ProjectManifest } from "@stemweave/contracts";
import {
  auditEvents,
  type Database,
  projectInvitations,
  projectMemberInstruments,
  projectMemberRoles,
  projectMembers,
  projectRuleVersions,
  projects,
  users,
} from "@stemweave/db";
import { and, count, eq, ne, sql } from "drizzle-orm";

import { apiErrors } from "../../errors.js";
import {
  ProjectRoleSchema,
  type AcceptInvitationCommand,
  type AcceptedInvitation,
  type CreateInvitationCommand,
  type CreateProjectCommand,
  type Membership,
  type ProjectRepository,
  type ProjectRole,
  type ProjectSummary,
  type ReplaceMemberRolesCommand,
} from "./model.js";

function splitMeasure(measure: Measure): readonly [number, number] {
  const [numerator, denominator] = measure.split("/").map(Number);
  if (numerator === undefined || denominator === undefined) {
    throw apiErrors.badRequest("INVALID_MEASURE", "Ölçü değeri ayrıştırılamadı.");
  }
  return [numerator, denominator];
}

function parseRoles(rows: readonly { role: string }[]): ProjectRole[] {
  return rows.map((row) => ProjectRoleSchema.parse(row.role));
}

export class PostgresProjectRepository implements ProjectRepository {
  constructor(private readonly db: Database) {}

  async isReady(): Promise<boolean> {
    try {
      await this.db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }

  async createProject(command: CreateProjectCommand): Promise<ProjectSummary> {
    const projectId = randomUUID();
    const ruleVersionId = randomUUID();
    const ownerMemberId = randomUUID();
    const [numerator, denominator] = splitMeasure(command.measure);

    await this.db.transaction(async (transaction) => {
      await transaction
        .insert(users)
        .values({
          displayName: command.principal.displayName,
          email: command.principal.email,
          id: command.principal.userId,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            displayName: command.principal.displayName,
            email: command.principal.email,
            status: "ACTIVE",
            updatedAt: new Date(),
          },
        });

      await transaction.insert(projects).values({
        ...(command.description === undefined ? {} : { description: command.description }),
        id: projectId,
        name: command.name,
        ownerUserId: command.principal.userId,
        slug: command.slug,
        status: "ACTIVE",
      });

      await transaction.insert(projectRuleVersions).values({
        bpm: command.bpm.toFixed(3),
        countInBars: command.countInBars,
        createdByUserId: command.principal.userId,
        id: ruleVersionId,
        ...(command.keySignature === undefined ? {} : { keySignature: command.keySignature }),
        projectId,
        timeSignatureDenominator: denominator,
        timeSignatureNumerator: numerator,
        versionNumber: 1,
      });

      await transaction
        .update(projects)
        .set({ activeRuleVersionId: ruleVersionId, updatedAt: new Date() })
        .where(eq(projects.id, projectId));

      await transaction.insert(projectMembers).values({
        id: ownerMemberId,
        joinedAt: new Date(),
        membershipStatus: "ACTIVE",
        projectId,
        userId: command.principal.userId,
      });
      await transaction.insert(projectMemberRoles).values({
        grantedByUserId: command.principal.userId,
        projectMemberId: ownerMemberId,
        role: "OWNER",
      });
      await transaction.insert(auditEvents).values({
        action: "PROJECT_CREATED",
        actorUserId: command.principal.userId,
        afterData: { bpm: command.bpm, measure: command.measure, name: command.name },
        id: randomUUID(),
        projectId,
        requestId: command.requestId,
        targetId: projectId,
        targetType: "PROJECT",
      });
    });

    return {
      activeRuleVersionId: ruleVersionId,
      id: projectId,
      name: command.name,
      ownerMemberId,
      slug: command.slug,
    };
  }

  async getMembership(projectId: string, userId: string): Promise<Membership | null> {
    const [member] = await this.db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        status: projectMembers.membershipStatus,
        userId: projectMembers.userId,
      })
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
      .limit(1);

    if (member === undefined) return null;

    const [roleRows, instrumentRows] = await Promise.all([
      this.db
        .select({ role: projectMemberRoles.role })
        .from(projectMemberRoles)
        .where(eq(projectMemberRoles.projectMemberId, member.id)),
      this.db
        .select({ instrumentId: projectMemberInstruments.instrumentId })
        .from(projectMemberInstruments)
        .where(eq(projectMemberInstruments.projectMemberId, member.id)),
    ]);

    return {
      id: member.id,
      instrumentIds: instrumentRows.map((row) => row.instrumentId),
      projectId: member.projectId,
      roles: parseRoles(roleRows),
      status: member.status as Membership["status"],
      userId: member.userId,
    };
  }

  async getManifest(projectId: string): Promise<ProjectManifest | null> {
    const [row] = await this.db
      .select({
        bpm: projectRuleVersions.bpm,
        denominator: projectRuleVersions.timeSignatureDenominator,
        numerator: projectRuleVersions.timeSignatureNumerator,
        projectId: projects.id,
        ruleVersionId: projectRuleVersions.id,
      })
      .from(projects)
      .innerJoin(projectRuleVersions, eq(projects.activeRuleVersionId, projectRuleVersions.id))
      .where(eq(projects.id, projectId))
      .limit(1);

    if (row === undefined) return null;
    return {
      activeRuleVersionId: row.ruleVersionId,
      bpm: Number(row.bpm),
      measure: `${row.numerator}/${row.denominator}` as Measure,
      projectId: row.projectId,
      version: CONTRACT_VERSION,
    };
  }

  async createInvitation(
    command: CreateInvitationCommand,
  ): Promise<{ id: string; expiresAt: Date }> {
    const [invitation] = await this.db.transaction(async (transaction) => {
      const rows = await transaction
        .insert(projectInvitations)
        .values({
          createdByUserId: command.actorUserId,
          email: command.email,
          expiresAt: command.expiresAt,
          id: command.id,
          instrumentIds: [...command.instrumentIds],
          projectId: command.projectId,
          roles: [...command.roles],
          tokenHash: command.tokenHash,
        })
        .onConflictDoUpdate({
          target: [projectInvitations.projectId, projectInvitations.email],
          set: {
            acceptedAt: null,
            createdByUserId: command.actorUserId,
            expiresAt: command.expiresAt,
            instrumentIds: [...command.instrumentIds],
            roles: [...command.roles],
            tokenHash: command.tokenHash,
          },
        })
        .returning({ expiresAt: projectInvitations.expiresAt, id: projectInvitations.id });

      const created = rows[0];
      if (created === undefined)
        throw apiErrors.conflict("INVITATION_FAILED", "Davet oluşturulamadı.");

      await transaction.insert(auditEvents).values({
        action: "PROJECT_INVITATION_CREATED",
        actorUserId: command.actorUserId,
        afterData: {
          email: command.email,
          instrumentIds: command.instrumentIds,
          roles: command.roles,
        },
        id: randomUUID(),
        projectId: command.projectId,
        requestId: command.requestId,
        targetId: created.id,
        targetType: "PROJECT_INVITATION",
      });
      return rows;
    });

    if (invitation === undefined)
      throw apiErrors.conflict("INVITATION_FAILED", "Davet oluşturulamadı.");
    return invitation;
  }

  async acceptInvitation(command: AcceptInvitationCommand): Promise<AcceptedInvitation> {
    return this.db.transaction(async (transaction) => {
      const [invitation] = await transaction
        .select()
        .from(projectInvitations)
        .where(eq(projectInvitations.tokenHash, command.tokenHash))
        .limit(1)
        .for("update");

      if (invitation === undefined) throw apiErrors.notFound("Davet bulunamadı.");
      if (invitation.acceptedAt !== null) {
        throw apiErrors.conflict("INVITATION_USED", "Davet daha önce kullanılmış.");
      }
      if (invitation.expiresAt.getTime() <= Date.now()) {
        throw apiErrors.conflict("INVITATION_EXPIRED", "Davetin süresi dolmuş.");
      }
      if (invitation.email.toLowerCase() !== command.principal.email.toLowerCase()) {
        throw apiErrors.forbidden("Davet başka bir e-posta adresi için oluşturulmuş.");
      }

      await transaction
        .insert(users)
        .values({
          displayName: command.principal.displayName,
          email: command.principal.email,
          id: command.principal.userId,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            displayName: command.principal.displayName,
            email: command.principal.email,
            status: "ACTIVE",
            updatedAt: new Date(),
          },
        });

      const [membership] = await transaction
        .insert(projectMembers)
        .values({
          id: randomUUID(),
          invitedByUserId: invitation.createdByUserId,
          joinedAt: new Date(),
          membershipStatus: "ACTIVE",
          projectId: invitation.projectId,
          userId: command.principal.userId,
        })
        .onConflictDoUpdate({
          target: [projectMembers.projectId, projectMembers.userId],
          set: {
            invitedByUserId: invitation.createdByUserId,
            joinedAt: new Date(),
            membershipStatus: "ACTIVE",
            updatedAt: new Date(),
          },
        })
        .returning({ id: projectMembers.id });

      if (membership === undefined) {
        throw apiErrors.conflict("MEMBERSHIP_FAILED", "Üyelik oluşturulamadı.");
      }

      await transaction
        .delete(projectMemberRoles)
        .where(eq(projectMemberRoles.projectMemberId, membership.id));
      await transaction.insert(projectMemberRoles).values(
        invitation.roles.map((role) => ({
          grantedByUserId: invitation.createdByUserId,
          projectMemberId: membership.id,
          role,
        })),
      );

      await transaction
        .delete(projectMemberInstruments)
        .where(eq(projectMemberInstruments.projectMemberId, membership.id));
      if (invitation.instrumentIds.length > 0) {
        await transaction.insert(projectMemberInstruments).values(
          invitation.instrumentIds.map((instrumentId) => ({
            instrumentId,
            projectMemberId: membership.id,
          })),
        );
      }

      await transaction
        .update(projectInvitations)
        .set({ acceptedAt: new Date() })
        .where(
          and(
            eq(projectInvitations.id, invitation.id),
            sql`${projectInvitations.acceptedAt} is null`,
          ),
        );
      await transaction.insert(auditEvents).values({
        action: "PROJECT_INVITATION_ACCEPTED",
        actorUserId: command.principal.userId,
        afterData: { instrumentIds: invitation.instrumentIds, roles: invitation.roles },
        id: randomUUID(),
        projectId: invitation.projectId,
        requestId: command.requestId,
        targetId: membership.id,
        targetType: "PROJECT_MEMBER",
      });

      return {
        membership: {
          id: membership.id,
          instrumentIds: invitation.instrumentIds,
          projectId: invitation.projectId,
          roles: parseRoles(invitation.roles.map((role) => ({ role }))),
          status: "ACTIVE",
          userId: command.principal.userId,
        },
        projectId: invitation.projectId,
      };
    });
  }

  async replaceMemberRoles(command: ReplaceMemberRolesCommand): Promise<Membership> {
    return this.db.transaction(async (transaction) => {
      const [project] = await transaction
        .select({ ownerUserId: projects.ownerUserId })
        .from(projects)
        .where(eq(projects.id, command.projectId))
        .limit(1)
        .for("update");
      if (project === undefined) throw apiErrors.notFound("Proje bulunamadı.");

      const [target] = await transaction
        .select({
          id: projectMembers.id,
          projectId: projectMembers.projectId,
          status: projectMembers.membershipStatus,
          userId: projectMembers.userId,
        })
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.id, command.memberId),
            eq(projectMembers.projectId, command.projectId),
          ),
        )
        .limit(1)
        .for("update");
      if (target === undefined) throw apiErrors.notFound("Proje üyesi bulunamadı.");

      const previousRoleRows = await transaction
        .select({ role: projectMemberRoles.role })
        .from(projectMemberRoles)
        .where(eq(projectMemberRoles.projectMemberId, target.id));
      const previousRoles = parseRoles(previousRoleRows);
      let replacementOwnerUserId: string | undefined;

      if (previousRoles.includes("OWNER") && !command.roles.includes("OWNER")) {
        const [ownerCount] = await transaction
          .select({ value: count() })
          .from(projectMemberRoles)
          .innerJoin(projectMembers, eq(projectMemberRoles.projectMemberId, projectMembers.id))
          .where(
            and(
              eq(projectMembers.projectId, command.projectId),
              eq(projectMembers.membershipStatus, "ACTIVE"),
              eq(projectMemberRoles.role, "OWNER"),
            ),
          );

        if ((ownerCount?.value ?? 0) <= 1) {
          throw apiErrors.conflict("LAST_OWNER_REQUIRED", "Projenin son OWNER rolü kaldırılamaz.");
        }

        if (project.ownerUserId === target.userId) {
          const [replacementOwner] = await transaction
            .select({ userId: projectMembers.userId })
            .from(projectMemberRoles)
            .innerJoin(projectMembers, eq(projectMemberRoles.projectMemberId, projectMembers.id))
            .where(
              and(
                eq(projectMembers.projectId, command.projectId),
                eq(projectMembers.membershipStatus, "ACTIVE"),
                eq(projectMemberRoles.role, "OWNER"),
                ne(projectMembers.id, target.id),
              ),
            )
            .limit(1);
          replacementOwnerUserId = replacementOwner?.userId;
        }
      }

      await transaction
        .delete(projectMemberRoles)
        .where(eq(projectMemberRoles.projectMemberId, target.id));
      await transaction.insert(projectMemberRoles).values(
        command.roles.map((role) => ({
          grantedByUserId: command.actorUserId,
          projectMemberId: target.id,
          role,
        })),
      );
      if (replacementOwnerUserId !== undefined) {
        await transaction
          .update(projects)
          .set({ ownerUserId: replacementOwnerUserId, updatedAt: new Date() })
          .where(eq(projects.id, command.projectId));
      }
      await transaction.insert(auditEvents).values({
        action: "PROJECT_MEMBER_ROLES_REPLACED",
        actorUserId: command.actorUserId,
        afterData: { roles: command.roles },
        beforeData: { roles: previousRoles },
        id: randomUUID(),
        projectId: command.projectId,
        requestId: command.requestId,
        targetId: target.id,
        targetType: "PROJECT_MEMBER",
      });

      const instrumentRows = await transaction
        .select({ instrumentId: projectMemberInstruments.instrumentId })
        .from(projectMemberInstruments)
        .where(eq(projectMemberInstruments.projectMemberId, target.id));

      return {
        id: target.id,
        instrumentIds: instrumentRows.map((row) => row.instrumentId),
        projectId: target.projectId,
        roles: [...command.roles],
        status: target.status as Membership["status"],
        userId: target.userId,
      };
    });
  }
}
