/**
 * AudioEngine
 *
 * Platform adapter sitting between the UI and expo-av.
 * Provides a simple load / play / stop interface and logs
 * touch-to-sound latency for the spike.
 *
 * Polyphony strategy: each note plays its own Sound instance.
 * expo-av sounds are reused via setPositionAsync(0) to minimise
 * allocation overhead.
 */

import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { SampleLoader } from "./SampleLoader";
import { audioFocus } from "../platform/AudioFocus";

export interface LatencyMeasurement {
  noteMs: number; // timestamp when touch happened (performance.now())
  playMs: number; // timestamp when play() was called (after engine overhead)
  deltaMs: number; // = playMs - noteMs
}

const MAX_POLYPHONY = 16;

export class AudioEngine {
  private loader: SampleLoader;
  private activeSounds: Map<number, Sound> = new Map();
  private latencyLog: LatencyMeasurement[] = [];
  private initialized = false;

  constructor(loader?: SampleLoader) {
    this.loader = loader ?? new SampleLoader();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await audioFocus.configure();
    await this.loader.preload();
    audioFocus.onFocusChange((active) => {
      if (!active) this.stopAll();
    });
    this.initialized = true;
  }

  /**
   * Play a note.
   * @param note MIDI note number
   * @param velocity 0–127
   * @param touchTimestamp performance.now() at the moment of touch — used for latency tracking
   */
  async play(note: number, velocity: number, touchTimestamp?: number): Promise<void> {
    // Enforce polyphony limit: steal the oldest active note
    if (this.activeSounds.size >= MAX_POLYPHONY) {
      const oldest = this.activeSounds.keys().next().value;
      if (oldest !== undefined) await this.stop(oldest);
    }

    const sound = this.loader.getSound(note, velocity);
    const playMs = Date.now();

    if (touchTimestamp !== undefined) {
      this.latencyLog.push({
        noteMs: touchTimestamp,
        playMs,
        deltaMs: playMs - touchTimestamp,
      });
    }

    if (sound) {
      try {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(velocity / 127);
        await sound.playAsync();
        this.activeSounds.set(note, sound);
      } catch {
        // Ignore individual play errors — don't crash the whole UI
      }
    } else {
      // No sample loaded — log and skip (synthesized sound not available without native module)
      console.debug(`[AudioEngine] No sample for note ${note}`);
    }
  }

  async stop(note: number): Promise<void> {
    const sound = this.activeSounds.get(note);
    if (!sound) return;
    try {
      await sound.stopAsync();
    } catch {
      // ignore
    }
    this.activeSounds.delete(note);
  }

  async stopAll(): Promise<void> {
    await Promise.allSettled(
      Array.from(this.activeSounds.keys()).map((n) => this.stop(n)),
    );
    this.activeSounds.clear();
  }

  async dispose(): Promise<void> {
    await this.stopAll();
    await this.loader.unloadAll();
    this.initialized = false;
  }

  /** Average latency over last N measurements. */
  averageLatencyMs(last = 10): number {
    const slice = this.latencyLog.slice(-last);
    if (slice.length === 0) return 0;
    return slice.reduce((s, m) => s + m.deltaMs, 0) / slice.length;
  }

  get latencyMeasurements(): ReadonlyArray<LatencyMeasurement> {
    return this.latencyLog;
  }
}
