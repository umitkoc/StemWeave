import { instrumentCatalog } from "@stemweave/instrument-catalog";

import type { Contribution, TimelineClip, TimelineMarker } from "./model";
import { TICKS_PER_QUARTER } from "./model";

export const demoContributions: readonly Contribution[] = [
  {
    durationTicks: 4 * TICKS_PER_QUARTER,
    id: "contribution-piano-01",
    instrumentId: "piano",
    musician: "Ada",
    name: "Piyano tema A",
    revision: 2,
  },
  {
    durationTicks: 8 * TICKS_PER_QUARTER,
    id: "contribution-cello-01",
    instrumentId: "cello",
    musician: "Deniz",
    name: "Cello uzun nota",
    revision: 1,
  },
  {
    durationTicks: 4 * TICKS_PER_QUARTER,
    id: "contribution-drums-01",
    instrumentId: "drums",
    musician: "Mert",
    name: "Bateri groove 01",
    revision: 3,
  },
  {
    durationTicks: 4 * TICKS_PER_QUARTER,
    id: "contribution-flute-01",
    instrumentId: "flute",
    musician: "Ece",
    name: "Flute cevap",
    revision: 1,
  },
] as const;

export const initialClips: readonly TimelineClip[] = [
  {
    contributionId: "demo-piano",
    durationTicks: 6 * TICKS_PER_QUARTER,
    id: "clip-piano-01",
    instrumentId: "piano",
    label: "Piyano intro",
    revision: 1,
    startTick: 0,
  },
  {
    contributionId: "demo-guitar",
    durationTicks: 4 * TICKS_PER_QUARTER,
    id: "clip-guitar-01",
    instrumentId: "guitar",
    label: "Gitar ritim",
    revision: 2,
    startTick: 4 * TICKS_PER_QUARTER,
  },
  {
    contributionId: "demo-drums",
    durationTicks: 8 * TICKS_PER_QUARTER,
    id: "clip-drums-01",
    instrumentId: "drums",
    label: "Bateri temel",
    revision: 1,
    startTick: 0,
  },
] as const;

export const initialMarkers: readonly TimelineMarker[] = [
  { id: "marker-intro", label: "INTRO", tick: 0 },
  { id: "marker-a", label: "A", tick: 8 * TICKS_PER_QUARTER },
] as const;

export function createPerformanceFixture(): {
  readonly clips: readonly TimelineClip[];
  readonly instrumentIds: readonly string[];
} {
  const instrumentIds = Array.from(
    { length: 50 },
    (_, index) => instrumentCatalog[index % instrumentCatalog.length]?.id ?? "piano",
  );
  const clips = Array.from({ length: 500 }, (_, index) => ({
    contributionId: `performance-contribution-${index}`,
    durationTicks: (2 + (index % 6)) * TICKS_PER_QUARTER,
    id: `performance-clip-${index}`,
    instrumentId: instrumentIds[index % instrumentIds.length] ?? "piano",
    label: `Klip ${index + 1}`,
    revision: (index % 4) + 1,
    startTick: (index % 64) * (TICKS_PER_QUARTER / 2),
  }));

  return { clips, instrumentIds };
}
