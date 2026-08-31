/**
 * useMetronome hook
 *
 * BPM tick engine using setInterval.
 * Provides beat index, isPlaying state, and count-in support.
 *
 * Count-in: fires `onCountIn(beat)` for beats 0..beatsPerMeasure-1
 * before the first "real" beat, then switches to normal playback.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseMetronomeOptions {
  bpm: number;
  beatsPerMeasure?: number;
  /** Called on each count-in beat (0-indexed). */
  onCountIn?: (beat: number) => void;
  /** Called on each real playback beat (0-indexed within measure). */
  onBeat?: (beat: number, measure: number) => void;
}

export interface UseMetronomeResult {
  isPlaying: boolean;
  beat: number;
  measure: number;
  isCountIn: boolean;
  start: (withCountIn?: boolean) => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
}

export function useMetronome({
  bpm,
  beatsPerMeasure = 4,
  onCountIn,
  onBeat,
}: UseMetronomeOptions): UseMetronomeResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [measure, setMeasure] = useState(0);
  const [isCountIn, setIsCountIn] = useState(false);

  const bpmRef = useRef(bpm);
  const beatRef = useRef(0);
  const measureRef = useRef(0);
  const countInBeatRef = useRef(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onBeatRef = useRef(onBeat);
  const onCountInRef = useRef(onCountIn);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { onBeatRef.current = onBeat; }, [onBeat]);
  useEffect(() => { onCountInRef.current = onCountIn; }, [onCountIn]);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const msPerBeat = 60_000 / bpmRef.current;

    if (countInBeatRef.current >= 0) {
      // Count-in mode
      onCountInRef.current?.(countInBeatRef.current);
      countInBeatRef.current++;
      if (countInBeatRef.current >= beatsPerMeasure) {
        countInBeatRef.current = -1;
        setIsCountIn(false);
        // Restart interval at correct BPM (might have drifted)
        clearTick();
        intervalRef.current = setInterval(tick, msPerBeat);
      }
    } else {
      // Normal playback
      const nextBeat = (beatRef.current + 1) % beatsPerMeasure;
      const nextMeasure = nextBeat === 0 ? measureRef.current + 1 : measureRef.current;
      beatRef.current = nextBeat;
      measureRef.current = nextMeasure;
      setBeat(nextBeat);
      setMeasure(nextMeasure);
      onBeatRef.current?.(nextBeat, nextMeasure);
    }
  }, [beatsPerMeasure, clearTick]);

  const start = useCallback(
    (withCountIn = true) => {
      clearTick();
      beatRef.current = 0;
      measureRef.current = 0;
      setBeat(0);
      setMeasure(0);

      const msPerBeat = 60_000 / bpmRef.current;

      if (withCountIn) {
        countInBeatRef.current = 0;
        setIsCountIn(true);
        onCountInRef.current?.(0);
      } else {
        countInBeatRef.current = -1;
        setIsCountIn(false);
      }

      setIsPlaying(true);
      intervalRef.current = setInterval(tick, msPerBeat);
    },
    [clearTick, tick],
  );

  const stop = useCallback(() => {
    clearTick();
    countInBeatRef.current = -1;
    setIsPlaying(false);
    setIsCountIn(false);
    setBeat(0);
    setMeasure(0);
  }, [clearTick]);

  const setBpm = useCallback(
    (newBpm: number) => {
      bpmRef.current = newBpm;
      if (isPlaying) {
        // Restart with new BPM
        clearTick();
        const msPerBeat = 60_000 / newBpm;
        intervalRef.current = setInterval(tick, msPerBeat);
      }
    },
    [clearTick, isPlaying, tick],
  );

  // Cleanup on unmount
  useEffect(() => clearTick, [clearTick]);

  return { isPlaying, beat, measure, isCountIn, start, stop, setBpm };
}
