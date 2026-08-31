import type { Membership, ProjectRole } from "./model.js";

export type ProjectPermission = "MANAGE_MEMBERS" | "READ_MANIFEST";

const permissionRoles: Record<ProjectPermission, ReadonlySet<ProjectRole>> = {
  MANAGE_MEMBERS: new Set(["OWNER"]),
  READ_MANIFEST: new Set(["OWNER", "CONDUCTOR", "MUSICIAN", "MIX_ENGINEER", "MASTERING_ENGINEER"]),
};

export function hasProjectPermission(
  membership: Membership | null,
  permission: ProjectPermission,
): boolean {
  if (membership?.status !== "ACTIVE") return false;
  return membership.roles.some((role) => permissionRoles[permission].has(role));
}
