import type { Measure } from "@stemweave/contracts";

export const TICKS_PER_QUARTER = 960;
export const DEFAULT_PIXELS_PER_QUARTER = 64;

export type TimelineClip = {
  readonly contributionId: string;
  readonly durationTicks: number;
  readonly id: string;
  readonly instrumentId: string;
  readonly label: string;
  readonly revision: number;
  readonly startTick: number;
};

export type TimelineMarker = {
  readonly id: string;
  readonly label: string;
  readonly tick: number;
};

export type Contribution = {
  readonly durationTicks: number;
  readonly id: string;
  readonly instrumentId: string;
  readonly musician: string;
  readonly name: string;
  readonly revision: number;
};

export function quartersPerMeasure(measure: Measure): number {
  const [beatsText, denominatorText] = measure.split("/");
  const beats = Number(beatsText);
  const denominator = Number(denominatorText);
  return beats * (4 / denominator);
}

export function ticksPerMeasure(measure: Measure): number {
  return quartersPerMeasure(measure) * TICKS_PER_QUARTER;
}

export function tickToPixel(tick: number, pixelsPerQuarter = DEFAULT_PIXELS_PER_QUARTER): number {
  return (tick / TICKS_PER_QUARTER) * pixelsPerQuarter;
}

export function pixelToSnappedTick(
  pixel: number,
  pixelsPerQuarter = DEFAULT_PIXELS_PER_QUARTER,
  snapTicks = TICKS_PER_QUARTER / 4,
): number {
  const rawTick = (Math.max(0, pixel) / pixelsPerQuarter) * TICKS_PER_QUARTER;
  return Math.round(rawTick / snapTicks) * snapTicks;
}

export function measureForTick(tick: number, measure: Measure): number {
  return Math.floor(Math.max(0, tick) / ticksPerMeasure(measure)) + 1;
}

export function moveClip(
  clips: readonly TimelineClip[],
  clipId: string,
  startTick: number,
): readonly TimelineClip[] {
  return clips.map((clip) => (clip.id === clipId ? { ...clip, startTick } : clip));
}

export function createClip(
  contribution: Contribution,
  startTick: number,
  createId: () => string = () => crypto.randomUUID(),
): TimelineClip {
  return {
    contributionId: contribution.id,
    durationTicks: contribution.durationTicks,
    id: createId(),
    instrumentId: contribution.instrumentId,
    label: contribution.name,
    revision: contribution.revision,
    startTick,
  };
}
