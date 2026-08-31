import type { Measure } from "@stemweave/contracts";
import { instrumentCatalog } from "@stemweave/instrument-catalog";
import type { InstrumentDefinition } from "@stemweave/instrument-catalog";
import type {
  CSSProperties,
  DragEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useMemo, useRef } from "react";

import type { Contribution, TimelineClip, TimelineMarker } from "../timeline/model";
import {
  createClip,
  DEFAULT_PIXELS_PER_QUARTER,
  moveClip,
  pixelToSnappedTick,
  tickToPixel,
  ticksPerMeasure,
} from "../timeline/model";
import { InstrumentIcon } from "./InstrumentIcon";
import { Waveform } from "./Waveform";

const CONTRIBUTION_MIME = "application/x-stemweave-contribution";
const CLIP_MIME = "application/x-stemweave-clip";
const BAR_COUNT = 32;

type TimelineProps = {
  readonly clips: readonly TimelineClip[];
  readonly contributions: readonly Contribution[];
  readonly markers: readonly TimelineMarker[];
  readonly measure: Measure;
  readonly onClipsChange: (clips: readonly TimelineClip[]) => void;
  readonly onMarkersChange: (markers: readonly TimelineMarker[]) => void;
  readonly onStatus: (message: string) => void;
  readonly showChannels: boolean;
};

function readDragId(event: DragEvent, mime: string): string | null {
  const value = event.dataTransfer.getData(mime);
  return value.length === 0 ? null : value;
}

export function writeContributionDrag(event: DragEvent, contributionId: string): void {
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData(CONTRIBUTION_MIME, contributionId);
}

export function Timeline({
  clips,
  contributions,
  markers,
  measure,
  onClipsChange,
  onMarkersChange,
  onStatus,
  showChannels,
}: TimelineProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panState = useRef<
    | {
        readonly pointerId: number;
        readonly startScrollLeft: number;
        readonly startScrollTop: number;
        readonly x: number;
        readonly y: number;
      }
    | undefined
  >(undefined);
  const measureTicks = ticksPerMeasure(measure);
  const measureWidth = tickToPixel(measureTicks);
  const timelineWidth = measureWidth * BAR_COUNT;
  const clipsByInstrument = useMemo(() => {
    const result = new Map<string, readonly TimelineClip[]>();
    for (const instrument of instrumentCatalog) {
      result.set(
        instrument.id,
        clips.filter((clip) => clip.instrumentId === instrument.id),
      );
    }
    return result;
  }, [clips]);

  function tickAtDrop(event: DragEvent<HTMLElement>): number {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativePixel = event.clientX - bounds.left;
    return pixelToSnappedTick(
      Number.isFinite(relativePixel) ? relativePixel : 0,
      DEFAULT_PIXELS_PER_QUARTER,
    );
  }

  function dropOnTrack(event: DragEvent<HTMLDivElement>, instrumentId: string) {
    event.preventDefault();
    const startTick = tickAtDrop(event);
    const contributionId = readDragId(event, CONTRIBUTION_MIME);
    if (contributionId !== null) {
      const contribution = contributions.find((item) => item.id === contributionId);
      if (contribution === undefined) return;
      if (contribution.instrumentId !== instrumentId) {
        onStatus("Bu katkı yalnızca kendi enstrüman kanalına bırakılabilir.");
        return;
      }
      onClipsChange([...clips, createClip(contribution, startTick)]);
      onStatus(
        `${contribution.name}, ${Math.round(startTick / measureTicks) + 1}. ölçüye eklendi.`,
      );
      return;
    }

    const clipId = readDragId(event, CLIP_MIME);
    if (clipId === null) return;
    const clip = clips.find((item) => item.id === clipId);
    if (clip === undefined || clip.instrumentId !== instrumentId) {
      onStatus("MVP'de klip farklı bir enstrüman kanalına taşınamaz.");
      return;
    }
    onClipsChange(moveClip(clips, clipId, startTick));
    onStatus(`${clip.label} yeni müzikal konuma taşındı.`);
  }

  function addMarker(event: ReactMouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const tick = pixelToSnappedTick(
      event.clientX - bounds.left,
      DEFAULT_PIXELS_PER_QUARTER,
      measureTicks,
    );
    const markerNumber = markers.length + 1;
    onMarkersChange([...markers, { id: crypto.randomUUID(), label: `M${markerNumber}`, tick }]);
    onStatus(`${Math.floor(tick / measureTicks) + 1}. ölçüye marker eklendi.`);
  }

  function beginPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.ctrlKey || event.button !== 0) return;
    const scroller = scrollerRef.current;
    if (scroller === null) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panState.current = {
      pointerId: event.pointerId,
      startScrollLeft: scroller.scrollLeft,
      startScrollTop: scroller.scrollTop,
      x: event.clientX,
      y: event.clientY,
    };
    scroller.classList.add("is-panning");
  }

  function pan(event: ReactPointerEvent<HTMLDivElement>) {
    const state = panState.current;
    const scroller = scrollerRef.current;
    if (state === undefined || scroller === null || state.pointerId !== event.pointerId) return;
    scroller.scrollLeft = state.startScrollLeft - (event.clientX - state.x);
    scroller.scrollTop = state.startScrollTop - (event.clientY - state.y);
  }

  function endPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (panState.current?.pointerId !== event.pointerId) return;
    panState.current = undefined;
    scrollerRef.current?.classList.remove("is-panning");
  }

  return (
    <div
      aria-label="Müzik timeline"
      className="timeline-scroller"
      onPointerCancel={endPan}
      onPointerDown={beginPan}
      onPointerMove={pan}
      onPointerUp={endPan}
      ref={scrollerRef}
      role="region"
    >
      <div
        className={`timeline-grid ${showChannels ? "with-channels" : "without-channels"}`}
        style={{ "--timeline-width": `${timelineWidth}px` } as CSSProperties}
      >
        {showChannels ? <div className="ruler-corner">KANAL / ÖLÇÜ</div> : null}
        <div
          aria-label="Ölçü cetveli; marker eklemek için çift tıklayın"
          className="timeline-ruler"
          onDoubleClick={addMarker}
          style={{ width: timelineWidth }}
        >
          {Array.from({ length: BAR_COUNT }, (_, index) => (
            <div className="measure-cell" key={index} style={{ width: measureWidth }}>
              {String(index + 1).padStart(2, "0")}
            </div>
          ))}
          {markers.map((marker) => (
            <div
              className="timeline-marker"
              key={marker.id}
              style={{ left: tickToPixel(marker.tick) }}
              title={`${marker.label} — ölçü ${Math.floor(marker.tick / measureTicks) + 1}`}
            >
              <span>{marker.label}</span>
            </div>
          ))}
        </div>

        {instrumentCatalog.flatMap((instrument: InstrumentDefinition) => {
          const trackClips = clipsByInstrument.get(instrument.id) ?? [];
          const label = showChannels ? (
            <div className="track-label" key={`${instrument.id}-label`}>
              <span className="instrument-swatch" style={{ background: instrument.colorHex }} />
              <InstrumentIcon iconKey={instrument.iconKey} />
              <span>
                <strong>{instrument.displayName.toUpperCase()}</strong>
                <small>{instrument.family}</small>
              </span>
              <button aria-label={`${instrument.displayName} kanalını sustur`} type="button">
                M
              </button>
            </div>
          ) : null;
          const row = (
            <div
              aria-label={`${instrument.displayName} kanalı`}
              className="timeline-track"
              key={`${instrument.id}-track`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => dropOnTrack(event, instrument.id)}
              style={
                {
                  "--instrument-color": instrument.colorHex,
                  "--measure-width": `${measureWidth}px`,
                  width: timelineWidth,
                } as CSSProperties
              }
            >
              {trackClips.map((clip) => (
                <button
                  aria-label={`${clip.label}, revizyon ${clip.revision}`}
                  className="timeline-clip"
                  draggable
                  key={clip.id}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData(CLIP_MIME, clip.id);
                  }}
                  style={
                    {
                      "--clip-color": instrument.colorHex,
                      left: tickToPixel(clip.startTick),
                      width: Math.max(40, tickToPixel(clip.durationTicks)),
                    } as CSSProperties
                  }
                  type="button"
                >
                  <span className="clip-heading">
                    <InstrumentIcon iconKey={instrument.iconKey} size={14} />
                    {clip.label}
                    <small>r{clip.revision}</small>
                  </span>
                  <Waveform seed={clip.id} />
                </button>
              ))}
            </div>
          );
          return showChannels ? [label, row] : [row];
        })}
      </div>
    </div>
  );
}
