import { z } from "zod";
import { CONTRACT_VERSION } from "../version.js";
import { ErrorCodes } from "../errors.js";

export const TempoChangeRequestSchema = z.object({
  version: z.number().refine((v) => v === CONTRACT_VERSION, {
    message: ErrorCodes.UNSUPPORTED_VERSION,
  }),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  requestedBpm: z.number().min(20).max(300, { message: ErrorCodes.INVALID_BPM }),
});

export type TempoChangeRequest = z.infer<typeof TempoChangeRequestSchema>;
