/**
 * MidiRecorder unit tests
 *
 * Tests:
 * 1. msToTicks at 120 BPM
 * 2. msToTicks at 60 BPM
 * 3. quantizeTick to 1/16 note
 * 4. recordNoteOn + recordNoteOff → RecordedNote with correct tick and duration
 * 5. Multiple simultaneous notes (polyphony)
 * 6. Undo of incomplete note (no noteOff before stop)
 */

import { describe, expect, it } from "vitest";
import { MidiRecorder, msToTicks, quantizeTick, TICKS_PER_QUARTER } from "../src/midi/MidiRecorder";

describe("msToTicks", () => {
  it("converts 500ms to 960 ticks at 120 BPM (= 1 quarter)", () => {
    // At 120 BPM: quarter note = 500ms
    expect(msToTicks(500, 120)).toBe(TICKS_PER_QUARTER); // 960
  });

  it("converts 1000ms to 960 ticks at 60 BPM (= 1 quarter)", () => {
    // At 60 BPM: quarter note = 1000ms
    expect(msToTicks(1000, 60)).toBe(TICKS_PER_QUARTER); // 960
  });

  it("converts 250ms to 480 ticks at 120 BPM (= 1/8 note)", () => {
    expect(msToTicks(250, 120)).toBe(480);
  });

  it("converts 0ms to 0 ticks", () => {
    expect(msToTicks(0, 120)).toBe(0);
  });
});

describe("quantizeTick", () => {
  it("snaps tick to nearest 1/16 note grid (240 ticks)", () => {
    // 1/16 note at 960 PPQ = 240 ticks (gridDivision=4 → gridTicks = 960/4 = 240)
    expect(quantizeTick(260, 120, 4)).toBe(240); // 260/240=1.08 → rounds to 1 → 240
    expect(quantizeTick(100, 120, 4)).toBe(0);   // 100/240=0.42 → rounds to 0 → 0
    expect(quantizeTick(130, 120, 4)).toBe(240); // 130/240=0.54 → rounds up to 1 → 240
  });

  it("snaps to nearest quarter note", () => {
    expect(quantizeTick(970, 120, 1)).toBe(TICKS_PER_QUARTER);
    expect(quantizeTick(480, 120, 1)).toBe(TICKS_PER_QUARTER);
  });
});

describe("MidiRecorder", () => {
  it("produces a RecordedNote with correct tick position and duration", () => {
    const recorder = new MidiRecorder(120);
    const startMs = 1000;
    recorder.start(startMs);

    // Note on at t=0ms (startTick=0), note off at t=500ms (= 1 quarter = 960 ticks)
    recorder.recordNoteOn(60, 100, startMs);
    recorder.recordNoteOff(60, startMs + 500);

    const notes = recorder.stop();

    expect(notes).toHaveLength(1);
    expect(notes[0]!.note).toBe(60);
    expect(notes[0]!.velocity).toBe(100);
    expect(notes[0]!.startTick).toBe(0);
    expect(notes[0]!.durationTicks).toBe(960); // 500ms at 120BPM
  });

  it("handles multiple simultaneous notes (polyphony)", () => {
    const recorder = new MidiRecorder(120);
    const t = 2000;
    recorder.start(t);

    recorder.recordNoteOn(60, 80, t);        // C4
    recorder.recordNoteOn(64, 80, t + 10);   // E4 (10ms later)
    recorder.recordNoteOn(67, 80, t + 20);   // G4 (20ms later)

    recorder.recordNoteOff(60, t + 500);
    recorder.recordNoteOff(64, t + 500);
    recorder.recordNoteOff(67, t + 500);

    const notes = recorder.stop();
    expect(notes).toHaveLength(3);
    const noteNumbers = notes.map((n) => n.note).sort((a, b) => a - b);
    expect(noteNumbers).toEqual([60, 64, 67]);
  });

  it("clamps open notes on stop (no noteOff received)", () => {
    const recorder = new MidiRecorder(120);
    const t = 3000;
    recorder.start(t);
    recorder.recordNoteOn(48, 90, t);
    // No recordNoteOff — recorder.stop() should still produce a note
    const notes = recorder.stop();
    expect(notes).toHaveLength(1);
    expect(notes[0]!.note).toBe(48);
    expect(notes[0]!.durationTicks).toBeGreaterThanOrEqual(1);
  });

  it("returns empty array when stopped without recording", () => {
    const recorder = new MidiRecorder(120);
    const notes = recorder.stop();
    expect(notes).toHaveLength(0);
  });

  it("isRecording reflects state correctly", () => {
    const recorder = new MidiRecorder(120);
    expect(recorder.isRecording).toBe(false);
    recorder.start();
    expect(recorder.isRecording).toBe(true);
    recorder.stop();
    expect(recorder.isRecording).toBe(false);
  });
});
