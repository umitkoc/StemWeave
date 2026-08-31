import type { FastifyRequest } from "fastify";

export type Principal = {
  readonly displayName: string;
  readonly email: string;
  readonly userId: string;
};

export interface AuthAdapter {
  authenticate(request: FastifyRequest): Promise<Principal>;
}
