import { createHash, randomBytes, randomUUID } from "node:crypto";

import { ProjectManifestSchema, type Measure } from "@stemweave/contracts";

import type { Principal } from "../../auth/model.js";
import { apiErrors } from "../../errors.js";
import type { Membership, ProjectRepository, ProjectRole } from "./model.js";
import { hasProjectPermission } from "./policies.js";

export type CreateProjectInput = {
  readonly bpm: number;
  readonly countInBars?: number;
  readonly description?: string;
  readonly keySignature?: string;
  readonly measure: Measure;
  readonly name: string;
  readonly slug?: string;
};

export type CreateInvitationInput = {
  readonly email: string;
  readonly instrumentIds: readonly string[];
  readonly roles: readonly ProjectRole[];
};

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 180);

  if (slug.length === 0)
    throw apiErrors.badRequest("INVALID_SLUG", "Geçerli bir slug üretilemedi.");
  return slug;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async createProject(principal: Principal, input: CreateProjectInput) {
    return this.repository.createProject({
      bpm: input.bpm,
      countInBars: input.countInBars ?? 1,
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.keySignature === undefined ? {} : { keySignature: input.keySignature }),
      measure: input.measure,
      name: input.name,
      principal,
      requestId: randomUUID(),
      slug: slugify(input.slug ?? input.name),
    });
  }

  async getManifest(principal: Principal, projectId: string) {
    const membership = await this.repository.getMembership(projectId, principal.userId);
    if (!hasProjectPermission(membership, "READ_MANIFEST")) throw apiErrors.forbidden();

    const manifest = await this.repository.getManifest(projectId);
    if (manifest === null) throw apiErrors.notFound("Proje manifesti bulunamadı.");
    return ProjectManifestSchema.parse(manifest);
  }

  async createInvitation(principal: Principal, projectId: string, input: CreateInvitationInput) {
    const membership = await this.requirePermission(principal, projectId, "MANAGE_MEMBERS");
    if (input.roles.includes("OWNER")) {
      throw apiErrors.badRequest(
        "OWNER_INVITATION_NOT_ALLOWED",
        "OWNER rolü davetle verilemez; mevcut owner rol yönetimi akışını kullanmalıdır.",
      );
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000);
    const invitation = await this.repository.createInvitation({
      actorUserId: membership.userId,
      email: input.email.toLowerCase(),
      expiresAt,
      id: randomUUID(),
      instrumentIds: input.instrumentIds,
      projectId,
      requestId: randomUUID(),
      roles: input.roles,
      tokenHash: tokenHash(token),
    });

    return { ...invitation, token };
  }

  async acceptInvitation(principal: Principal, token: string) {
    return this.repository.acceptInvitation({
      principal,
      requestId: randomUUID(),
      tokenHash: tokenHash(token),
    });
  }

  async replaceMemberRoles(
    principal: Principal,
    projectId: string,
    memberId: string,
    roles: readonly ProjectRole[],
  ): Promise<Membership> {
    await this.requirePermission(principal, projectId, "MANAGE_MEMBERS");
    return this.repository.replaceMemberRoles({
      actorUserId: principal.userId,
      memberId,
      projectId,
      requestId: randomUUID(),
      roles,
    });
  }

  private async requirePermission(
    principal: Principal,
    projectId: string,
    permission: "MANAGE_MEMBERS" | "READ_MANIFEST",
  ): Promise<Membership> {
    const membership = await this.repository.getMembership(projectId, principal.userId);
    if (!hasProjectPermission(membership, permission) || membership === null) {
      throw apiErrors.forbidden();
    }
    return membership;
  }
}
