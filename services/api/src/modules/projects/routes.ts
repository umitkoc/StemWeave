import { MeasureSchema } from "@stemweave/contracts";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";

import type { AuthAdapter } from "../../auth/model.js";
import { ProjectRoleSchema } from "./model.js";
import { ProjectService } from "./project-service.js";

const ProjectIdParamsSchema = z.object({ projectId: z.uuid() });
const InvitationTokenParamsSchema = z.object({ token: z.string().min(20).max(200) });
const MemberParamsSchema = z.object({ memberId: z.uuid(), projectId: z.uuid() });

const CreateProjectBodySchema = z.object({
  bpm: z.number().min(20).max(300),
  countInBars: z.number().int().min(0).max(8).optional(),
  description: z.string().trim().max(4_000).optional(),
  keySignature: z.string().trim().max(20).optional(),
  measure: MeasureSchema,
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
});

const CreateInvitationBodySchema = z.object({
  email: z.email(),
  instrumentIds: z.array(z.string().trim().min(1).max(50)).max(16).default([]),
  roles: z.array(ProjectRoleSchema).min(1).max(6),
});

const ReplaceRolesBodySchema = z.object({
  roles: z.array(ProjectRoleSchema).min(1).max(6),
});

export async function registerProjectRoutes(
  app: FastifyInstance,
  service: ProjectService,
  auth: AuthAdapter,
): Promise<void> {
  const principal = (request: FastifyRequest) => auth.authenticate(request);

  app.post("/projects", async (request, reply) => {
    const identity = await principal(request);
    const body = CreateProjectBodySchema.parse(request.body);
    const project = await service.createProject(identity, {
      bpm: body.bpm,
      ...(body.countInBars === undefined ? {} : { countInBars: body.countInBars }),
      ...(body.description === undefined ? {} : { description: body.description }),
      ...(body.keySignature === undefined ? {} : { keySignature: body.keySignature }),
      measure: body.measure,
      name: body.name,
      ...(body.slug === undefined ? {} : { slug: body.slug }),
    });
    return reply.code(201).send(project);
  });

  app.get("/projects/:projectId/manifest", async (request) => {
    const identity = await principal(request);
    const { projectId } = ProjectIdParamsSchema.parse(request.params);
    return service.getManifest(identity, projectId);
  });

  app.post("/projects/:projectId/invitations", async (request, reply) => {
    const identity = await principal(request);
    const { projectId } = ProjectIdParamsSchema.parse(request.params);
    const body = CreateInvitationBodySchema.parse(request.body);
    const invitation = await service.createInvitation(identity, projectId, body);
    return reply.code(201).send(invitation);
  });

  app.post("/invitations/:token/accept", async (request) => {
    const identity = await principal(request);
    const { token } = InvitationTokenParamsSchema.parse(request.params);
    return service.acceptInvitation(identity, token);
  });

  app.put("/projects/:projectId/members/:memberId/roles", async (request) => {
    const identity = await principal(request);
    const { memberId, projectId } = MemberParamsSchema.parse(request.params);
    const { roles } = ReplaceRolesBodySchema.parse(request.body);
    return service.replaceMemberRoles(identity, projectId, memberId, roles);
  });
}
