import { describe, expect, it } from "vitest";

import { pixelCssVariables, pixelTheme } from "./index.js";

describe("pixel UI token'ları", () => {
  it("Consolas ve köşesiz pixel değerlerini CSS değişkenlerine taşır", () => {
    expect(pixelTheme.fontFamily).toContain("Consolas");
    expect(pixelTheme.radiusPx).toBe(0);
    expect(pixelCssVariables()["--sw-font"]).toBe(pixelTheme.fontFamily);
    expect(pixelCssVariables()["--sw-border"]).toBe("2px");
  });
});
