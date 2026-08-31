/**
 * SampleLoader
 *
 * Pre-loads piano WAV samples into memory so playback has minimal latency.
 * We use a simple sine-wave generated "sample" as a placeholder for the
 * Salamander Grand Piano files (which are downloaded separately / bundled).
 *
 * Key map: C3 (MIDI 48) → B5 (MIDI 83)
 *   Two velocity layers: forte (≥64) and piano (<64)
 */

import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";

export type VelocityLayer = "forte" | "piano";

export interface LoadedSample {
  forte: Sound;
  piano: Sound;
}

/**
 * Maps MIDI note number to sample file name.
 * Files live in apps/piano-mobile/assets/samples/
 * e.g. "C3_forte.wav", "C3_piano.wav"
 *
 * For notes without a dedicated sample we use the closest neighbour.
 */
const NOTE_NAMES: Record<number, string> = {
  48: "C3",
  50: "D3",
  52: "E3",
  53: "F3",
  55: "G3",
  57: "A3",
  59: "B3",
  60: "C4",
  62: "D4",
  64: "E4",
  65: "F4",
  67: "G4",
  69: "A4",
  71: "B4",
  72: "C5",
  74: "D5",
  76: "E5",
  77: "F5",
  79: "G5",
  81: "A5",
  83: "B5",
};

/** Nearest sample note for any MIDI note (nearest downward). */
function nearestSampleNote(note: number): number {
  const keys = Object.keys(NOTE_NAMES).map(Number).sort((a, b) => a - b);
  let nearest = keys[0] ?? 48;
  for (const k of keys) {
    if (k <= note) nearest = k;
  }
  return nearest;
}

/** Static asset require map — populated via require() to work with Metro bundler. */
const SAMPLE_ASSETS: Partial<
  Record<string, { forte: number; piano: number }>
> = {
  // Assets will be bundled by Metro when the files are present.
  // When samples are absent we fall back to a generated tone.
};

export class SampleLoader {
  /** note → { forte, piano } */
  private cache: Map<number, LoadedSample> = new Map();
  private loading = false;

  /** Pre-load samples for notes in range [minNote, maxNote]. */
  async preload(minNote = 48, maxNote = 83): Promise<void> {
    if (this.loading) return;
    this.loading = true;

    const toLoad = new Set<number>();
    for (let n = minNote; n <= maxNote; n++) {
      toLoad.add(nearestSampleNote(n));
    }

    await Promise.all(
      Array.from(toLoad).map(async (note) => {
        if (this.cache.has(note)) return;
        try {
          const sample = await this.loadNote(note);
          this.cache.set(note, sample);
        } catch {
          // Skip missing samples silently — engine will synthesize tone
        }
      }),
    );

    this.loading = false;
  }

  private async loadNote(note: number): Promise<LoadedSample> {
    const name = NOTE_NAMES[note];
    if (!name) throw new Error(`No sample name for note ${note}`);

    const assets = SAMPLE_ASSETS[name];
    if (!assets) throw new Error(`No asset bundle for ${name}`);

    const [forte, piano] = await Promise.all([
      Audio.Sound.createAsync({ uri: assets.forte as unknown as string }),
      Audio.Sound.createAsync({ uri: assets.piano as unknown as string }),
    ]);
    return { forte: forte.sound, piano: piano.sound };
  }

  /** Get the Sound for a given MIDI note and velocity. Returns null if not loaded. */
  getSound(note: number, velocity: number): Sound | null {
    const sampleNote = nearestSampleNote(note);
    const loaded = this.cache.get(sampleNote);
    if (!loaded) return null;
    const layer: VelocityLayer = velocity >= 64 ? "forte" : "piano";
    return loaded[layer];
  }

  /** Unload all samples and free memory. */
  async unloadAll(): Promise<void> {
    await Promise.all(
      Array.from(this.cache.values()).flatMap(({ forte, piano }) => [
        forte.unloadAsync(),
        piano.unloadAsync(),
      ]),
    );
    this.cache.clear();
  }

  get isReady(): boolean {
    return !this.loading && this.cache.size > 0;
  }
}
