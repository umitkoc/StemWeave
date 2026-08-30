import { describe, expect, it } from "vitest";

import { instrumentCatalog } from "./index.js";

describe("instrumentCatalog", () => {
  it("keeps instrument identities and colors unique", () => {
    const ids = instrumentCatalog.map((instrument) => instrument.id);
    const colors = instrumentCatalog.map((instrument) => instrument.colorHex);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it("uses six-digit hexadecimal colors", () => {
    for (const instrument of instrumentCatalog) {
      expect(instrument.colorHex).toMatch(/^#[0-9A-F]{6}$/u);
    }
  });
});
