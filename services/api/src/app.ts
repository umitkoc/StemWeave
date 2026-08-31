import Fastify, { type FastifyInstance } from "fastify";
import { z } from "zod";

import type { AuthAdapter } from "./auth/model.js";
import { ApiError } from "./errors.js";
import type { ProjectRepository } from "./modules/projects/model.js";
import { ProjectService } from "./modules/projects/project-service.js";
import { registerProjectRoutes } from "./modules/projects/routes.js";

export type ApiDependencies = {
  readonly auth: AuthAdapter;
  readonly repository: ProjectRepository;
};

export async function buildApi(dependencies: ApiDependencies): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  const projectService = new ProjectService(dependencies.repository);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
      return reply.code(error.statusCode).send({
        error: { code: error.code, message: error.message },
        requestId: request.id,
      });
    }
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          issues: error.issues,
          message: "İstek doğrulanamadı.",
        },
        requestId: request.id,
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      error: { code: "INTERNAL_ERROR", message: "Beklenmeyen bir hata oluştu." },
      requestId: request.id,
    });
  });

  app.get("/health/live", async () => ({ status: "ok" }));
  app.get("/health/ready", async (_request, reply) => {
    const ready = await dependencies.repository.isReady();
    return reply.code(ready ? 200 : 503).send({ status: ready ? "ready" : "not_ready" });
  });

  await app.register(async (v1) => registerProjectRoutes(v1, projectService, dependencies.auth), {
    prefix: "/v1",
  });

  return app;
}
