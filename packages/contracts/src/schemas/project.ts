import { z } from "zod";
import { CONTRACT_VERSION } from "../version.js";
import { ErrorCodes } from "../errors.js";

export const MeasureSchema = z.enum(["4/4", "3/4", "6/8", "2/4", "5/4", "7/8"], {
  message: ErrorCodes.INVALID_MEASURE,
});

export const ProjectManifestSchema = z.object({
  version: z.number().refine((v) => v === CONTRACT_VERSION, {
    message: ErrorCodes.UNSUPPORTED_VERSION,
  }),
  projectId: z.string().uuid(),
  bpm: z.number().min(20).max(300, { message: ErrorCodes.INVALID_BPM }),
  measure: MeasureSchema,
  activeRuleVersionId: z.string().uuid().optional(),
});

export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
export type Measure = z.infer<typeof MeasureSchema>;
