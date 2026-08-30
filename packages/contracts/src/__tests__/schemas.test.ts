import { describe, expect, it } from "vitest";
import { ProjectManifestSchema, ContributionManifestSchema } from "../index.js";
import {
  validProjectFixture,
  invalidBpmProjectFixture,
  validContributionFixture,
  invalidChecksumContributionFixture,
} from "./fixtures.js";
import { ErrorCodes } from "../errors.js";

describe("ProjectManifestSchema", () => {
  it("should parse a valid project manifest", () => {
    const result = ProjectManifestSchema.safeParse(validProjectFixture);
    expect(result.success).toBe(true);
  });

  it("should fail when BPM is out of bounds", () => {
    const result = ProjectManifestSchema.safeParse(invalidBpmProjectFixture);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(ErrorCodes.INVALID_BPM);
    }
  });

  it("should fail with unsupported version", () => {
    const result = ProjectManifestSchema.safeParse({ ...validProjectFixture, version: 999 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(ErrorCodes.UNSUPPORTED_VERSION);
    }
  });
});

describe("ContributionManifestSchema", () => {
  it("should parse a valid contribution manifest", () => {
    const result = ContributionManifestSchema.safeParse(validContributionFixture);
    expect(result.success).toBe(true);
  });

  it("should fail when checksum length is invalid", () => {
    const result = ContributionManifestSchema.safeParse(invalidChecksumContributionFixture);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(ErrorCodes.INVALID_CHECKSUM);
    }
  });
});
