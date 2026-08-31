/**
 * useAudio hook
 *
 * Wraps AudioEngine lifecycle: initialize on mount, dispose on unmount.
 * Returns stable play/stop/stopAll callbacks.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import { SampleLoader } from "../audio/SampleLoader";
import { audioFocus } from "../platform/AudioFocus";

export interface UseAudioResult {
  ready: boolean;
  play: (note: number, velocity: number, touchTimestamp?: number) => void;
  stop: (note: number) => void;
  stopAll: () => void;
  averageLatencyMs: () => number;
}

export function useAudio(): UseAudioResult {
  const engineRef = useRef<AudioEngine | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loader = new SampleLoader();
    const engine = new AudioEngine(loader);
    engineRef.current = engine;

    audioFocus.startListening();

    engine
      .initialize()
      .then(() => setReady(true))
      .catch((err) => {
        console.warn("[useAudio] initialization failed:", err);
      });

    return () => {
      engine.dispose().catch(() => {});
      audioFocus.stopListening();
    };
  }, []);

  const play = useCallback(
    (note: number, velocity: number, touchTimestamp?: number) => {
      engineRef.current?.play(note, velocity, touchTimestamp).catch(() => {});
    },
    [],
  );

  const stop = useCallback((note: number) => {
    engineRef.current?.stop(note).catch(() => {});
  }, []);

  const stopAll = useCallback(() => {
    engineRef.current?.stopAll().catch(() => {});
  }, []);

  const averageLatencyMs = useCallback(() => {
    return engineRef.current?.averageLatencyMs() ?? 0;
  }, []);

  return { ready, play, stop, stopAll, averageLatencyMs };
}
