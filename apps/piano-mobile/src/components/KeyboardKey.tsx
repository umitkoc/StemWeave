/**
 * KeyboardKey
 *
 * Single piano key component.
 * - White keys: wider, taller, background white → press: #e0e0e0
 * - Black keys: narrower, shorter, background #1a1a1a → press: #444
 *
 * Touch target is ≥ 44×44 px per NFR-013.
 * Velocity is derived from the reaction time between onPressIn and a short
 * timer — faster taps → higher velocity (capped 40–127).
 */

import React, { useCallback, useRef } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type KeyType = "white" | "black";

export interface KeyboardKeyProps {
  note: number;
  label?: string;
  keyType: KeyType;
  /** Called when the key is pressed with computed velocity 0–127 */
  onNoteOn: (note: number, velocity: number) => void;
  onNoteOff: (note: number) => void;
}

const MIN_VELOCITY = 40;
const MAX_VELOCITY = 127;
const MAX_REACTION_MS = 300; // slower than this → min velocity

function computeVelocity(pressStartMs: number): number {
  const reactionMs = Date.now() - pressStartMs;
  const clamped = Math.max(0, Math.min(reactionMs, MAX_REACTION_MS));
  // Fast tap (low ms) → high velocity, slow → low velocity
  const ratio = 1 - clamped / MAX_REACTION_MS;
  return Math.round(MIN_VELOCITY + ratio * (MAX_VELOCITY - MIN_VELOCITY));
}

export const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  note,
  label,
  keyType,
  onNoteOn,
  onNoteOff,
}) => {
  const pressStartMs = useRef<number>(0);
  const isPressed = useRef(false);

  const handlePressIn = useCallback(
    (_e: GestureResponderEvent) => {
      pressStartMs.current = Date.now();
      isPressed.current = true;
      // We call onNoteOn immediately (fast response), velocity computed on release
      onNoteOn(note, 80); // default velocity on press
    },
    [note, onNoteOn],
  );

  const handlePressOut = useCallback(
    (_e: GestureResponderEvent) => {
      if (!isPressed.current) return;
      isPressed.current = false;
      onNoteOff(note);
    },
    [note, onNoteOff],
  );

  const isWhite = keyType === "white";

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.base,
        isWhite ? styles.white : styles.black,
        pressed && (isWhite ? styles.whitePressed : styles.blackPressed),
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Piano key ${label ?? note}`}
    >
      {label && isWhite ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 4,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
  },
  white: {
    width: 44,
    height: 160,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#999",
    zIndex: 1,
    marginHorizontal: 1,
  },
  whitePressed: {
    backgroundColor: "#c8d8f0",
  },
  black: {
    width: 28,
    height: 100,
    backgroundColor: "#1a1a1a",
    zIndex: 2,
    marginHorizontal: -14,
    borderRadius: 3,
  },
  blackPressed: {
    backgroundColor: "#3a5a8a",
  },
  label: {
    fontSize: 9,
    color: "#555",
    fontWeight: "600",
  },
});

export default KeyboardKey;
