import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildApi } from "./app.js";
import { DevelopmentAuthAdapter } from "./auth/development-auth.js";
import { InMemoryProjectRepository } from "./testing/in-memory-project-repository.js";

const owner = {
  "x-dev-display-name": "Şef Ada",
  "x-dev-user-email": "ada@example.com",
  "x-dev-user-id": "10000000-0000-4000-8000-000000000001",
};
const musician = {
  "x-dev-display-name": "Piyanist Deniz",
  "x-dev-user-email": "deniz@example.com",
  "x-dev-user-id": "20000000-0000-4000-8000-000000000002",
};
const viewer = {
  "x-dev-display-name": "İzleyici Ece",
  "x-dev-user-email": "ece@example.com",
  "x-dev-user-id": "30000000-0000-4000-8000-000000000003",
};

describe("StemWeave API", () => {
  let repository: InMemoryProjectRepository;
  let app: Awaited<ReturnType<typeof buildApi>>;

  beforeEach(async () => {
    repository = new InMemoryProjectRepository();
    app = await buildApi({ auth: new DevelopmentAuthAdapter(true), repository });
  });

  afterEach(async () => app.close());

  it("reports liveness and database readiness independently", async () => {
    expect((await app.inject({ method: "GET", url: "/health/live" })).statusCode).toBe(200);
    repository.setReady(false);
    expect((await app.inject({ method: "GET", url: "/health/ready" })).statusCode).toBe(503);
  });

  it("requires the development identity headers", async () => {
    const response = await app.inject({
      method: "POST",
      payload: { bpm: 120, measure: "4/4", name: "Eksik Kimlik" },
      url: "/v1/projects",
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("UNAUTHORIZED");
  });

  it("creates a project, assigns piano musician access and exposes the manifest", async () => {
    const projectResponse = await app.inject({
      headers: owner,
      method: "POST",
      payload: { bpm: 120, keySignature: "C_MAJOR", measure: "4/4", name: "İlk Beste" },
      url: "/v1/projects",
    });
    expect(projectResponse.statusCode).toBe(201);
    const project = projectResponse.json();

    const invitationResponse = await app.inject({
      headers: owner,
      method: "POST",
      payload: {
        email: musician["x-dev-user-email"],
        instrumentIds: ["piano"],
        roles: ["MUSICIAN"],
      },
      url: `/v1/projects/${project.id}/invitations`,
    });
    expect(invitationResponse.statusCode).toBe(201);
    const invitation = invitationResponse.json();

    const acceptResponse = await app.inject({
      headers: musician,
      method: "POST",
      url: `/v1/invitations/${invitation.token}/accept`,
    });
    expect(acceptResponse.statusCode).toBe(200);
    expect(acceptResponse.json().membership).toMatchObject({
      instrumentIds: ["piano"],
      roles: ["MUSICIAN"],
    });

    const manifestResponse = await app.inject({
      headers: musician,
      method: "GET",
      url: `/v1/projects/${project.id}/manifest`,
    });
    expect(manifestResponse.statusCode).toBe(200);
    expect(manifestResponse.json()).toMatchObject({
      bpm: 120,
      measure: "4/4",
      projectId: project.id,
    });
    expect(repository.auditActions).toEqual([
      "PROJECT_CREATED",
      "PROJECT_INVITATION_CREATED",
      "PROJECT_INVITATION_ACCEPTED",
    ]);
  });

  it("blocks member management for musicians", async () => {
    const projectResponse = await app.inject({
      headers: owner,
      method: "POST",
      payload: { bpm: 90, measure: "4/4", name: "Yetki Testi" },
      url: "/v1/projects",
    });
    const project = projectResponse.json();

    const response = await app.inject({
      headers: musician,
      method: "POST",
      payload: { email: "new@example.com", roles: ["MUSICIAN"] },
      url: `/v1/projects/${project.id}/invitations`,
    });
    expect(response.statusCode).toBe(403);
  });

  it("keeps viewers outside the draft project manifest", async () => {
    const projectResponse = await app.inject({
      headers: owner,
      method: "POST",
      payload: { bpm: 110, measure: "4/4", name: "Viewer Testi" },
      url: "/v1/projects",
    });
    const project = projectResponse.json();
    const invitationResponse = await app.inject({
      headers: owner,
      method: "POST",
      payload: { email: viewer["x-dev-user-email"], roles: ["VIEWER"] },
      url: `/v1/projects/${project.id}/invitations`,
    });
    await app.inject({
      headers: viewer,
      method: "POST",
      url: `/v1/invitations/${invitationResponse.json().token}/accept`,
    });

    const manifestResponse = await app.inject({
      headers: viewer,
      method: "GET",
      url: `/v1/projects/${project.id}/manifest`,
    });
    expect(manifestResponse.statusCode).toBe(403);
  });

  it("does not allow removing the final OWNER role", async () => {
    const projectResponse = await app.inject({
      headers: owner,
      method: "POST",
      payload: { bpm: 100, measure: "3/4", name: "Owner Testi" },
      url: "/v1/projects",
    });
    const project = projectResponse.json();

    const response = await app.inject({
      headers: owner,
      method: "PUT",
      payload: { roles: ["CONDUCTOR"] },
      url: `/v1/projects/${project.id}/members/${project.ownerMemberId}/roles`,
    });
    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe("LAST_OWNER_REQUIRED");
  });

  it("rate limits repeated invitation acceptance attempts", async () => {
    const responses = [];
    for (let attempt = 0; attempt < 11; attempt += 1) {
      responses.push(
        await app.inject({
          headers: musician,
          method: "POST",
          url: "/v1/invitations/not-a-real-invitation-token/accept",
        }),
      );
    }

    expect(responses.slice(0, 10).every((response) => response.statusCode === 404)).toBe(true);
    expect(responses[10]?.statusCode).toBe(429);
    expect(responses[10]?.json().error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("Center geliştirme origin'ine CORS erişimi verir", async () => {
    const response = await app.inject({
      headers: { origin: "http://127.0.0.1:1420" },
      method: "GET",
      url: "/health/live",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:1420");
  });
});
