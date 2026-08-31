/**
 * MidiRecorder
 *
 * Converts raw touch timestamps + BPM into MIDI ticks and produces
 * a ContributionManifest-compatible event list.
 *
 * Tick resolution: 960 PPQ (pulses per quarter note) — matches the desktop shell.
 */

export const TICKS_PER_QUARTER = 960;

export interface NoteOnEvent {
  type: "note_on";
  /** MIDI note number (0–127). Middle C = 60. */
  note: number;
  /** Velocity 0–127 derived from touch pressure / reaction time. */
  velocity: number;
  /** Absolute timestamp in milliseconds (performance.now() epoch). */
  timeMs: number;
  /** Tick position relative to recording start. */
  tick: number;
}

export interface NoteOffEvent {
  type: "note_off";
  note: number;
  timeMs: number;
  tick: number;
}

export type MidiEvent = NoteOnEvent | NoteOffEvent;

export interface RecordedNote {
  note: number;
  velocity: number;
  startTick: number;
  durationTicks: number;
}

/** Convert milliseconds elapsed to MIDI ticks at a given BPM. */
export function msToTicks(ms: number, bpm: number): number {
  // ms per quarter note = 60000 / bpm
  const msPerQuarter = 60_000 / bpm;
  return Math.round((ms / msPerQuarter) * TICKS_PER_QUARTER);
}

/** Quantize a tick to the nearest grid division. Default: 1/16 note. */
export function quantizeTick(
  tick: number,
  bpm: number,
  gridDivision: number = 4, // 1 = quarter, 4 = 1/16, 8 = 1/32
): number {
  const gridTicks = TICKS_PER_QUARTER / gridDivision;
  return Math.round(tick / gridTicks) * gridTicks;
}

export class MidiRecorder {
  private bpm: number;
  private recordingStartMs: number | null = null;
  private events: MidiEvent[] = [];
  /** noteOn events awaiting a corresponding noteOff, keyed by note number */
  private openNotes: Map<number, NoteOnEvent> = new Map();

  constructor(bpm: number) {
    this.bpm = bpm;
  }

  /** Call once when the user presses Record (after count-in). */
  start(nowMs: number = Date.now()): void {
    this.recordingStartMs = nowMs;
    this.events = [];
    this.openNotes.clear();
  }

  /** Stop recording. Returns the recorded note list. */
  stop(): RecordedNote[] {
    // Close any still-open notes at current time
    const nowMs = Date.now();
    for (const [note] of this.openNotes) {
      const elapsed = nowMs - (this.recordingStartMs ?? nowMs);
      const tick = msToTicks(elapsed, this.bpm);
      this.events.push({ type: "note_off", note, timeMs: nowMs, tick });
    }
    this.openNotes.clear();
    const notes = this.buildNotes();
    this.recordingStartMs = null; // ← mark as stopped
    return notes;
  }

  recordNoteOn(note: number, velocity: number, nowMs: number = Date.now()): void {
    if (this.recordingStartMs === null) return;
    const elapsed = nowMs - this.recordingStartMs;
    const tick = msToTicks(elapsed, this.bpm);
    const event: NoteOnEvent = { type: "note_on", note, velocity, timeMs: nowMs, tick };
    this.events.push(event);
    this.openNotes.set(note, event);
  }

  recordNoteOff(note: number, nowMs: number = Date.now()): void {
    if (this.recordingStartMs === null) return;
    const elapsed = nowMs - this.recordingStartMs;
    const tick = msToTicks(elapsed, this.bpm);
    this.events.push({ type: "note_off", note, timeMs: nowMs, tick });
    this.openNotes.delete(note);
  }

  private buildNotes(): RecordedNote[] {
    const notes: RecordedNote[] = [];
    const pendingOn = new Map<number, NoteOnEvent>();

    for (const ev of this.events) {
      if (ev.type === "note_on") {
        pendingOn.set(ev.note, ev);
      } else {
        const on = pendingOn.get(ev.note);
        if (on) {
          const durationTicks = Math.max(1, ev.tick - on.tick);
          notes.push({
            note: on.note,
            velocity: on.velocity,
            startTick: on.tick,
            durationTicks,
          });
          pendingOn.delete(ev.note);
        }
      }
    }
    return notes;
  }

  /** Total duration in ticks from first note to last note-off. */
  get totalDurationTicks(): number {
    const all = this.events;
    if (all.length === 0) return 0;
    const last = all[all.length - 1];
    return last?.tick ?? 0;
  }

  get isRecording(): boolean {
    return this.recordingStartMs !== null;
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
  }
}
