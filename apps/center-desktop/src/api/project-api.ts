import { ProjectManifestSchema, type Measure, type ProjectManifest } from "@stemweave/contracts";

export type CreateProjectInput = {
  readonly bpm: number;
  readonly countInBars: number;
  readonly description?: string;
  readonly keySignature?: string;
  readonly measure: Measure;
  readonly name: string;
};

export type ProjectSummary = {
  readonly activeRuleVersionId: string;
  readonly id: string;
  readonly name: string;
  readonly ownerMemberId: string;
  readonly slug: string;
};

export type ProjectApi = {
  createProject(input: CreateProjectInput): Promise<ProjectSummary>;
  getManifest(projectId: string): Promise<ProjectManifest>;
};

type DevelopmentIdentity = {
  readonly displayName: string;
  readonly email: string;
  readonly userId: string;
};

function errorMessage(body: unknown, status: number): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "object" &&
    body.error !== null &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }
  return `API isteği başarısız oldu (${status}).`;
}

async function jsonOrNull(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isProjectSummary(value: unknown): value is ProjectSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "slug" in value &&
    typeof value.slug === "string" &&
    "activeRuleVersionId" in value &&
    typeof value.activeRuleVersionId === "string" &&
    "ownerMemberId" in value &&
    typeof value.ownerMemberId === "string"
  );
}

export function createProjectApi(
  baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3000",
  identity: DevelopmentIdentity = {
    displayName: import.meta.env.VITE_DEV_DISPLAY_NAME ?? "Yerel Şef",
    email: import.meta.env.VITE_DEV_USER_EMAIL ?? "conductor@stemweave.local",
    userId: import.meta.env.VITE_DEV_USER_ID ?? "11111111-1111-4111-8111-111111111111",
  },
): ProjectApi {
  const headers = {
    "content-type": "application/json",
    "x-dev-display-name": identity.displayName,
    "x-dev-user-email": identity.email,
    "x-dev-user-id": identity.userId,
  };

  return {
    async createProject(input) {
      const response = await fetch(`${baseUrl}/v1/projects`, {
        body: JSON.stringify(input),
        headers,
        method: "POST",
      });
      const body = await jsonOrNull(response);
      if (!response.ok) throw new Error(errorMessage(body, response.status));
      if (!isProjectSummary(body)) throw new Error("API geçersiz proje cevabı döndürdü.");
      return body;
    },
    async getManifest(projectId) {
      const response = await fetch(`${baseUrl}/v1/projects/${projectId}/manifest`, { headers });
      const body = await jsonOrNull(response);
      if (!response.ok) throw new Error(errorMessage(body, response.status));
      return ProjectManifestSchema.parse(body);
    },
  };
}
