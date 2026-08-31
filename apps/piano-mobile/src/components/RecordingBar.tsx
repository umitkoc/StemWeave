/**
 * RecordingBar
 *
 * Bottom transport bar showing recording state + undo/redo controls.
 * - RECORD button: starts count-in → recording
 * - STOP button: stops recording
 * - UNDO / REDO buttons
 * - Note count badge
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface RecordingBarProps {
  isRecording: boolean;
  isCountIn: boolean;
  noteCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onRecord: () => void;
  onStop: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

export const RecordingBar: React.FC<RecordingBarProps> = ({
  isRecording,
  isCountIn,
  noteCount,
  canUndo,
  canRedo,
  onRecord,
  onStop,
  onUndo,
  onRedo,
  onReset,
}) => {
  return (
    <View style={styles.container}>
      {/* Left: undo / redo */}
      <View style={styles.group}>
        <Pressable
          onPress={onUndo}
          disabled={!canUndo}
          style={[styles.btn, !canUndo && styles.btnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Undo"
        >
          <Text style={[styles.btnText, !canUndo && styles.btnTextDisabled]}>
            ↩ Undo
          </Text>
        </Pressable>
        <Pressable
          onPress={onRedo}
          disabled={!canRedo}
          style={[styles.btn, !canRedo && styles.btnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Redo"
        >
          <Text style={[styles.btnText, !canRedo && styles.btnTextDisabled]}>
            Redo ↪
          </Text>
        </Pressable>
      </View>

      {/* Center: record / stop */}
      <View style={styles.group}>
        {isCountIn ? (
          <View style={[styles.btn, styles.btnCountIn]}>
            <Text style={styles.btnText}>Count-in…</Text>
          </View>
        ) : isRecording ? (
          <Pressable
            onPress={onStop}
            style={[styles.btn, styles.btnStop]}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
          >
            <Text style={styles.btnText}>⏹ Stop</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onRecord}
            style={[styles.btn, styles.btnRecord]}
            accessibilityRole="button"
            accessibilityLabel="Start recording"
          >
            <Text style={styles.btnText}>⏺ Record</Text>
          </Pressable>
        )}
      </View>

      {/* Right: note count + reset */}
      <View style={styles.group}>
        <Text style={styles.noteCount}>{noteCount} notes</Text>
        <Pressable
          onPress={onReset}
          style={[styles.btn, styles.btnReset]}
          accessibilityRole="button"
          accessibilityLabel="Reset recording"
        >
          <Text style={styles.btnText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#222",
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.3,
  },
  btnRecord: {
    backgroundColor: "#c0392b",
  },
  btnStop: {
    backgroundColor: "#555",
  },
  btnCountIn: {
    backgroundColor: "#e8a020",
  },
  btnReset: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#444",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  btnTextDisabled: {
    color: "#888",
  },
  noteCount: {
    color: "#888",
    fontSize: 12,
  },
});

export default RecordingBar;
