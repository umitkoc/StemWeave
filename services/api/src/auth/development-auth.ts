import type { FastifyRequest } from "fastify";
import { z } from "zod";

import { apiErrors } from "../errors.js";
import type { AuthAdapter, Principal } from "./model.js";

const DevelopmentIdentitySchema = z.object({
  displayName: z.string().trim().min(1).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  userId: z.uuid(),
});

function readSingleHeader(request: FastifyRequest, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

export class DevelopmentAuthAdapter implements AuthAdapter {
  constructor(private readonly enabled = process.env.NODE_ENV !== "production") {}

  async authenticate(request: FastifyRequest): Promise<Principal> {
    if (!this.enabled) {
      throw apiErrors.unauthorized("Development auth production ortamında kullanılamaz.");
    }

    const parsed = DevelopmentIdentitySchema.safeParse({
      displayName: readSingleHeader(request, "x-dev-display-name"),
      email: readSingleHeader(request, "x-dev-user-email"),
      userId: readSingleHeader(request, "x-dev-user-id"),
    });

    if (!parsed.success) {
      throw apiErrors.unauthorized(
        "x-dev-user-id, x-dev-user-email ve x-dev-display-name header'ları gereklidir.",
      );
    }

    return parsed.data;
  }
}
