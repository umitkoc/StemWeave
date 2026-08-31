import {
  auditEvents,
  createDbConnection,
  projectMembers,
  projectRuleVersions,
  projects,
} from "@stemweave/db";
import { count, sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { buildApi } from "./app.js";
import { DevelopmentAuthAdapter } from "./auth/development-auth.js";
import { PostgresProjectRepository } from "./modules/projects/postgres-project-repository.js";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/stemweave";
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

describe("PostgreSQL project flow", () => {
  const connection = createDbConnection(databaseUrl);
  const repository = new PostgresProjectRepository(connection.db);
  let app: Awaited<ReturnType<typeof buildApi>>;

  beforeAll(async () => {
    app = await buildApi({ auth: new DevelopmentAuthAdapter(true), repository });
  });

  beforeEach(async () => {
    await connection.db.execute(sql`truncate table users cascade`);
  });

  afterAll(async () => {
    await connection.db.execute(sql`truncate table users cascade`);
    await app.close();
    await connection.close();
  });

  it("creates project, first rule, owner membership and audit atomically", async () => {
    const response = await app.inject({
      headers: owner,
      method: "POST",
      payload: { bpm: 120, measure: "4/4", name: "Transaction Test" },
      url: "/v1/projects",
    });
    expect(response.statusCode).toBe(201);

    const [[projectCount], [ruleCount], [memberCount], [auditCount]] = await Promise.all([
      connection.db.select({ value: count() }).from(projects),
      connection.db.select({ value: count() }).from(projectRuleVersions),
      connection.db.select({ value: count() }).from(projectMembers),
      connection.db.select({ value: count() }).from(auditEvents),
    ]);

    expect(projectCount?.value).toBe(1);
    expect(ruleCount?.value).toBe(1);
    expect(memberCount?.value).toBe(1);
    expect(auditCount?.value).toBe(1);
  });

  it("returns ready with PostgreSQL and protects the final OWNER", async () => {
    expect((await app.inject({ method: "GET", url: "/health/ready" })).statusCode).toBe(200);

    const projectResponse = await app.inject({
      headers: owner,
      method: "POST",
      payload: { bpm: 100, measure: "3/4", name: "Owner Transaction" },
      url: "/v1/projects",
    });
    const project = projectResponse.json();
    const roleResponse = await app.inject({
      headers: owner,
      method: "PUT",
      payload: { roles: ["CONDUCTOR"] },
      url: `/v1/projects/${project.id}/members/${project.ownerMemberId}/roles`,
    });

    expect(roleResponse.statusCode).toBe(409);
    expect(roleResponse.json().error.code).toBe("LAST_OWNER_REQUIRED");
  });

  it("persists a piano musician invitation and grants manifest access", async () => {
    const projectResponse = await app.inject({
      headers: owner,
      method: "POST",
      payload: { bpm: 90, measure: "4/4", name: "Piyano Akışı" },
      url: "/v1/projects",
    });
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

    const acceptResponse = await app.inject({
      headers: musician,
      method: "POST",
      url: `/v1/invitations/${invitationResponse.json().token}/accept`,
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
    expect(manifestResponse.json()).toMatchObject({ bpm: 90, measure: "4/4" });
  });
});
