import { CONTRACT_VERSION } from "../version.js";

export const validProjectFixture = {
  version: CONTRACT_VERSION,
  projectId: "123e4567-e89b-12d3-a456-426614174000",
  bpm: 120,
  measure: "4/4",
  activeRuleVersionId: "123e4567-e89b-12d3-a456-426614174001",
};

export const validContributionFixture = {
  version: CONTRACT_VERSION,
  projectId: "123e4567-e89b-12d3-a456-426614174000",
  userId: "999e4567-e89b-12d3-a456-426614174999",
  instrumentId: "piano",
  ruleVersionId: "123e4567-e89b-12d3-a456-426614174001",
  assetChecksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // 64 chars
  startTick: 0,
  durationTicks: 3840, // e.g. 4 measures in 960 PPQ
};

export const invalidBpmProjectFixture = {
  ...validProjectFixture,
  bpm: 500, // Invalid, max 300
};

export const invalidChecksumContributionFixture = {
  ...validContributionFixture,
  assetChecksum: "too-short", // Invalid, must be 64 chars
};
