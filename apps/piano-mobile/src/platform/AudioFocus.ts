/**
 * AudioFocus
 *
 * Platform adapter for audio session management:
 * - iOS: AVAudioSession interruption (phone calls, Siri, etc.)
 * - Android: AudioManager focus (ducking, transient loss, etc.)
 *
 * Uses React Native's AppState + expo-av's Audio API to handle
 * audio focus correctly on both platforms.
 */

import { AppState, type AppStateStatus, Platform } from "react-native";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

export type AudioFocusCallback = (active: boolean) => void;

export class AudioFocus {
  private callbacks: Set<AudioFocusCallback> = new Set();
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private initialized = false;

  /**
   * Configure the audio session for low-latency instrument playback.
   * Must be called once before any Audio.Sound objects are created.
   */
  async configure(): Promise<void> {
    if (this.initialized) return;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      shouldDuckAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });

    this.initialized = true;
  }

  /** Register a callback to be notified when audio focus changes. */
  onFocusChange(cb: AudioFocusCallback): () => void {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  /** Start listening to AppState changes (background/foreground transitions). */
  startListening(): void {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange,
    );
  }

  /** Stop listening and release resources. */
  stopListening(): void {
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
  }

  private handleAppStateChange = (state: AppStateStatus): void => {
    const isActive = state === "active";
    for (const cb of this.callbacks) {
      cb(isActive);
    }
    if (!isActive && Platform.OS === "android") {
      // Abandon audio focus on Android when app goes to background
      Audio.setAudioModeAsync({ shouldDuckAndroid: false }).catch(() => {
        // ignore
      });
    }
  };
}

/** Singleton instance — share across the app. */
export const audioFocus = new AudioFocus();
