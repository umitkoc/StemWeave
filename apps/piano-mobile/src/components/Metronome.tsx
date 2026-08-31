/**
 * Metronome
 *
 * Visual beat indicator + count-in display.
 * Shows 4 beat dots that light up on each beat.
 * During count-in: shows "1… 2… 3… 4…" labels.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface MetronomeProps {
  bpm: number;
  beat: number; // 0-indexed current beat
  beatsPerMeasure?: number;
  isPlaying: boolean;
  isCountIn: boolean;
  measure: number;
}

export const Metronome: React.FC<MetronomeProps> = ({
  bpm,
  beat,
  beatsPerMeasure = 4,
  isPlaying,
  isCountIn,
  measure,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              isPlaying && beat === i && styles.dotActive,
              isCountIn && beat === i && styles.dotCountIn,
            ]}
          />
        ))}
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.bpmText}>{bpm} BPM</Text>
        {isCountIn && (
          <Text style={styles.countInText}>{beat + 1}…</Text>
        )}
        {isPlaying && !isCountIn && (
          <Text style={styles.measureText}>M{measure + 1}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#555",
  },
  dotActive: {
    backgroundColor: "#4a90d9",
    borderColor: "#4a90d9",
  },
  dotCountIn: {
    backgroundColor: "#e8a020",
    borderColor: "#e8a020",
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  bpmText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
  },
  countInText: {
    color: "#e8a020",
    fontSize: 18,
    fontWeight: "800",
  },
  measureText: {
    color: "#4a90d9",
    fontSize: 13,
  },
});

export default Metronome;
