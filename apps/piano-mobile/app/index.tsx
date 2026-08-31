/**
 * index.tsx — Main Piano Screen
 *
 * Wires together:
 *  - PianoKeyboard (2 octaves, C3–B4)
 *  - Metronome (visual beat indicator)
 *  - RecordingBar (record / stop / undo / redo)
 *  - useAudio, useMetronome, useRecording hooks
 *
 * BPM is fixed at 120 for this spike; tempo picker comes in Adım 9.
 */

import React, { useCallback, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { PianoKeyboard } from "../src/components/PianoKeyboard";
import { Metronome } from "../src/components/Metronome";
import { RecordingBar } from "../src/components/RecordingBar";
import { useAudio } from "../src/hooks/useAudio";
import { useMetronome } from "../src/hooks/useMetronome";
import { useRecording } from "../src/hooks/useRecording";

const BPM = 120;
const BEATS_PER_MEASURE = 4;

export default function PianoScreen() {
  const audio = useAudio();
  const recording = useRecording(BPM);

  const handleBeat = useCallback(
    (beat: number, measure: number) => {
      // Could trigger a click sound here in future
    },
    [],
  );

  const handleCountIn = useCallback(
    (_beat: number) => {
      // Could trigger a hi-hat click here
    },
    [],
  );

  const metronome = useMetronome({
    bpm: BPM,
    beatsPerMeasure: BEATS_PER_MEASURE,
    onBeat: handleBeat,
    onCountIn: handleCountIn,
  });

  // When count-in ends, start real recording
  useEffect(() => {
    if (!metronome.isCountIn && metronome.isPlaying && !recording.isRecording) {
      recording.startRecording();
    }
  }, [metronome.isCountIn, metronome.isPlaying, recording]);

  const handleRecord = useCallback(() => {
    metronome.start(true); // withCountIn = true
  }, [metronome]);

  const handleStop = useCallback(() => {
    metronome.stop();
    recording.stopRecording();
  }, [metronome, recording]);

  const handleNoteOn = useCallback(
    (note: number, velocity: number) => {
      audio.play(note, velocity, Date.now());
      recording.recordNoteOn(note, velocity);
    },
    [audio, recording],
  );

  const handleNoteOff = useCallback(
    (note: number) => {
      audio.stop(note);
      recording.recordNoteOff(note);
    },
    [audio, recording],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Status bar */}
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>
          {audio.ready ? "🎹 Ready" : "⏳ Loading…"}
        </Text>
        {recording.notes.length > 0 && (
          <Text style={styles.latencyText}>
            avg latency: {audio.averageLatencyMs().toFixed(1)} ms
          </Text>
        )}
      </View>

      {/* Metronome */}
      <Metronome
        bpm={BPM}
        beat={metronome.beat}
        measure={metronome.measure}
        beatsPerMeasure={BEATS_PER_MEASURE}
        isPlaying={metronome.isPlaying}
        isCountIn={metronome.isCountIn}
      />

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Piano */}
      <PianoKeyboard
        startMidi={48}
        octaves={2}
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
      />

      {/* Transport */}
      <RecordingBar
        isRecording={recording.isRecording}
        isCountIn={metronome.isCountIn}
        noteCount={recording.notes.length}
        canUndo={recording.canUndo}
        canRedo={recording.canRedo}
        onRecord={handleRecord}
        onStop={handleStop}
        onUndo={recording.undo}
        onRedo={recording.redo}
        onReset={recording.reset}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statusText: {
    color: "#aaa",
    fontSize: 13,
  },
  latencyText: {
    color: "#4a90d9",
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
});
