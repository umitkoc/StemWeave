import type { TimelineClip } from "./model";
import { tickToPixel } from "./model";

export type ClipLayout = {
  readonly id: string;
  readonly left: number;
  readonly trackIndex: number;
  readonly width: number;
};

export function buildTimelineLayout(
  instrumentIds: readonly string[],
  clips: readonly TimelineClip[],
): readonly ClipLayout[] {
  const trackIndexByInstrument = new Map<string, number>();
  instrumentIds.forEach((instrumentId, index) => {
    if (!trackIndexByInstrument.has(instrumentId)) trackIndexByInstrument.set(instrumentId, index);
  });

  return clips.map((clip) => ({
    id: clip.id,
    left: tickToPixel(clip.startTick),
    trackIndex: trackIndexByInstrument.get(clip.instrumentId) ?? -1,
    width: Math.max(24, tickToPixel(clip.durationTicks)),
  }));
}
