import { describe, expect, it } from "vitest";

import { createPerformanceFixture } from "./demo-data";
import { buildTimelineLayout } from "./layout";
import {
  measureForTick,
  pixelToSnappedTick,
  quartersPerMeasure,
  tickToPixel,
  ticksPerMeasure,
  TICKS_PER_QUARTER,
} from "./model";

describe("timeline müzikal koordinatları", () => {
  it("ölçüyü tick ve piksel koordinatına dönüştürür", () => {
    expect(quartersPerMeasure("4/4")).toBe(4);
    expect(quartersPerMeasure("6/8")).toBe(3);
    expect(ticksPerMeasure("3/4")).toBe(3 * TICKS_PER_QUARTER);
    expect(tickToPixel(TICKS_PER_QUARTER)).toBe(64);
    expect(pixelToSnappedTick(71)).toBe(TICKS_PER_QUARTER);
    expect(measureForTick(4 * TICKS_PER_QUARTER, "4/4")).toBe(2);
  });

  it("50 kanal ve 500 klip sentetik layout bütçesini karşılar", () => {
    const fixture = createPerformanceFixture();
    const startedAt = performance.now();
    const layout = buildTimelineLayout(fixture.instrumentIds, fixture.clips);
    const durationMs = performance.now() - startedAt;

    expect(fixture.instrumentIds).toHaveLength(50);
    expect(layout).toHaveLength(500);
    expect(layout.every((clip) => clip.width >= 24)).toBe(true);
    expect(durationMs).toBeLessThan(100);
  });
});
