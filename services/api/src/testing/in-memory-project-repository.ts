import { randomUUID } from "node:crypto";

import { CONTRACT_VERSION, type ProjectManifest } from "@stemweave/contracts";

import { apiErrors } from "../errors.js";
import {
  type AcceptInvitationCommand,
  type AcceptedInvitation,
  type CreateInvitationCommand,
  type CreateProjectCommand,
  type Membership,
  type ProjectRepository,
  type ProjectRole,
  type ProjectSummary,
  type ReplaceMemberRolesCommand,
} from "../modules/projects/model.js";

type StoredProject = ProjectSummary & { manifest: ProjectManifest };

export class InMemoryProjectRepository implements ProjectRepository {
  readonly auditActions: string[] = [];
  private readonly invitations = new Map<string, CreateInvitationCommand & { accepted: boolean }>();
  private readonly memberships = new Map<string, Membership>();
  private readonly projects = new Map<string, StoredProject>();

  constructor(private ready = true) {}

  setReady(ready: boolean): void {
    this.ready = ready;
  }

  async isReady(): Promise<boolean> {
    return this.ready;
  }

  async createProject(command: CreateProjectCommand): Promise<ProjectSummary> {
    const id = randomUUID();
    const activeRuleVersionId = randomUUID();
    const ownerMemberId = randomUUID();
    const summary = {
      activeRuleVersionId,
      id,
      name: command.name,
      ownerMemberId,
      slug: command.slug,
    };

    this.projects.set(id, {
      ...summary,
      manifest: {
        activeRuleVersionId,
        bpm: command.bpm,
        measure: command.measure,
        projectId: id,
        version: CONTRACT_VERSION,
      },
    });
    this.memberships.set(ownerMemberId, {
      id: ownerMemberId,
      instrumentIds: [],
      projectId: id,
      roles: ["OWNER"],
      status: "ACTIVE",
      userId: command.principal.userId,
    });
    this.auditActions.push("PROJECT_CREATED");
    return summary;
  }

  async getMembership(projectId: string, userId: string): Promise<Membership | null> {
    return (
      [...this.memberships.values()].find(
        (membership) => membership.projectId === projectId && membership.userId === userId,
      ) ?? null
    );
  }

  async getManifest(projectId: string): Promise<ProjectManifest | null> {
    return this.projects.get(projectId)?.manifest ?? null;
  }

  async createInvitation(
    command: CreateInvitationCommand,
  ): Promise<{ id: string; expiresAt: Date }> {
    this.invitations.set(command.tokenHash, { ...command, accepted: false });
    this.auditActions.push("PROJECT_INVITATION_CREATED");
    return { expiresAt: command.expiresAt, id: command.id };
  }

  async acceptInvitation(command: AcceptInvitationCommand): Promise<AcceptedInvitation> {
    const invitation = this.invitations.get(command.tokenHash);
    if (invitation === undefined) throw apiErrors.notFound("Davet bulunamadı.");
    if (invitation.accepted) throw apiErrors.conflict("INVITATION_USED", "Davet kullanılmış.");
    if (invitation.expiresAt.getTime() <= Date.now()) {
      throw apiErrors.conflict("INVITATION_EXPIRED", "Davetin süresi dolmuş.");
    }
    if (invitation.email !== command.principal.email.toLowerCase()) throw apiErrors.forbidden();

    invitation.accepted = true;
    const id = randomUUID();
    const membership: Membership = {
      id,
      instrumentIds: invitation.instrumentIds,
      projectId: invitation.projectId,
      roles: invitation.roles,
      status: "ACTIVE",
      userId: command.principal.userId,
    };
    this.memberships.set(id, membership);
    this.auditActions.push("PROJECT_INVITATION_ACCEPTED");
    return { membership, projectId: invitation.projectId };
  }

  async replaceMemberRoles(command: ReplaceMemberRolesCommand): Promise<Membership> {
    const target = this.memberships.get(command.memberId);
    if (target === undefined || target.projectId !== command.projectId) {
      throw apiErrors.notFound("Proje üyesi bulunamadı.");
    }

    if (target.roles.includes("OWNER") && !command.roles.includes("OWNER")) {
      const ownerCount = [...this.memberships.values()].filter(
        (membership) =>
          membership.projectId === command.projectId &&
          membership.status === "ACTIVE" &&
          membership.roles.includes("OWNER"),
      ).length;
      if (ownerCount <= 1) {
        throw apiErrors.conflict("LAST_OWNER_REQUIRED", "Projenin son OWNER rolü kaldırılamaz.");
      }
    }

    const updated = { ...target, roles: [...command.roles] as ProjectRole[] };
    this.memberships.set(target.id, updated);
    this.auditActions.push("PROJECT_MEMBER_ROLES_REPLACED");
    return updated;
  }
}
