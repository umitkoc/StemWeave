import type { Measure, ProjectManifest } from "@stemweave/contracts";
import { z } from "zod";

import type { Principal } from "../../auth/model.js";

export const ProjectRoleSchema = z.enum([
  "OWNER",
  "CONDUCTOR",
  "MUSICIAN",
  "MIX_ENGINEER",
  "MASTERING_ENGINEER",
  "VIEWER",
]);

export type ProjectRole = z.infer<typeof ProjectRoleSchema>;

export type Membership = {
  readonly id: string;
  readonly instrumentIds: readonly string[];
  readonly projectId: string;
  readonly roles: readonly ProjectRole[];
  readonly status: "ACTIVE" | "INVITED" | "REMOVED";
  readonly userId: string;
};

export type ProjectSummary = {
  readonly activeRuleVersionId: string;
  readonly id: string;
  readonly name: string;
  readonly ownerMemberId: string;
  readonly slug: string;
};

export type CreateProjectCommand = {
  readonly bpm: number;
  readonly countInBars: number;
  readonly description?: string;
  readonly keySignature?: string;
  readonly measure: Measure;
  readonly name: string;
  readonly principal: Principal;
  readonly requestId: string;
  readonly slug: string;
};

export type CreateInvitationCommand = {
  readonly actorUserId: string;
  readonly email: string;
  readonly expiresAt: Date;
  readonly id: string;
  readonly instrumentIds: readonly string[];
  readonly projectId: string;
  readonly requestId: string;
  readonly roles: readonly ProjectRole[];
  readonly tokenHash: string;
};

export type AcceptInvitationCommand = {
  readonly principal: Principal;
  readonly requestId: string;
  readonly tokenHash: string;
};

export type ReplaceMemberRolesCommand = {
  readonly actorUserId: string;
  readonly memberId: string;
  readonly projectId: string;
  readonly requestId: string;
  readonly roles: readonly ProjectRole[];
};

export type AcceptedInvitation = {
  readonly membership: Membership;
  readonly projectId: string;
};

export interface ProjectRepository {
  acceptInvitation(command: AcceptInvitationCommand): Promise<AcceptedInvitation>;
  createInvitation(command: CreateInvitationCommand): Promise<{ id: string; expiresAt: Date }>;
  createProject(command: CreateProjectCommand): Promise<ProjectSummary>;
  getManifest(projectId: string): Promise<ProjectManifest | null>;
  getMembership(projectId: string, userId: string): Promise<Membership | null>;
  isReady(): Promise<boolean>;
  replaceMemberRoles(command: ReplaceMemberRolesCommand): Promise<Membership>;
}
