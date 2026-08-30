import { z } from "zod";
import { CONTRACT_VERSION } from "../version.js";
import { ErrorCodes } from "../errors.js";

// We validate the generic shape here. Actual valid catalogs can be checked via instrument-catalog.
export const InstrumentFamilySchema = z.enum([
  "BRASS",
  "KEYS",
  "PERCUSSION",
  "STRINGS",
  "WIND",
]);

export const InstrumentDefinitionSchema = z.object({
  version: z.number().refine((v) => v === CONTRACT_VERSION, {
    message: ErrorCodes.UNSUPPORTED_VERSION,
  }).optional(), // Optional since it might be static catalog data
  id: z.string().min(1, { message: ErrorCodes.INVALID_INSTRUMENT }),
  displayName: z.string().min(1),
  family: InstrumentFamilySchema,
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  iconKey: z.string().min(1),
});

export type InstrumentFamilyContract = z.infer<typeof InstrumentFamilySchema>;
export type InstrumentDefinitionContract = z.infer<typeof InstrumentDefinitionSchema>;
