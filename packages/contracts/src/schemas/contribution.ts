import { z } from "zod";
import { CONTRACT_VERSION } from "../version.js";
import { ErrorCodes } from "../errors.js";

export const ContributionManifestSchema = z.object({
  version: z.number().refine((v) => v === CONTRACT_VERSION, {
    message: ErrorCodes.UNSUPPORTED_VERSION,
  }),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  instrumentId: z.string().min(1, { message: ErrorCodes.INVALID_INSTRUMENT }),
  ruleVersionId: z.string().uuid(),
  assetChecksum: z.string().length(64, { message: ErrorCodes.INVALID_CHECKSUM }), // SHA-256 assumed
  startTick: z.number().int().min(0),
  durationTicks: z.number().int().min(1),
});

export type ContributionManifest = z.infer<typeof ContributionManifestSchema>;
