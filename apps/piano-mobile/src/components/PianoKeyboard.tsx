/**
 * PianoKeyboard
 *
 * 2-octave (C3–B4, MIDI 48–71) piano keyboard laid out horizontally.
 *
 * Layout approach:
 *  - White keys rendered in a row
 *  - Black keys overlaid using absolute positioning
 *
 * Each white key is 44 px wide. The keyboard scrolls horizontally
 * if it exceeds the screen width.
 *
 * NFR-013: touch target ≥ 44×44 px — satisfied by white key width=44 and
 * black key has a Pressable hit-slop expansion.
 */

import React, { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { KeyboardKey } from "./KeyboardKey";

/** MIDI note layout for one octave starting at C */
const OCTAVE_PATTERN: Array<{ semitone: number; type: "white" | "black"; label?: string }> = [
  { semitone: 0,  type: "white", label: "C" },
  { semitone: 1,  type: "black" },
  { semitone: 2,  type: "white", label: "D" },
  { semitone: 3,  type: "black" },
  { semitone: 4,  type: "white", label: "E" },
  { semitone: 5,  type: "white", label: "F" },
  { semitone: 6,  type: "black" },
  { semitone: 7,  type: "white", label: "G" },
  { semitone: 8,  type: "black" },
  { semitone: 9,  type: "white", label: "A" },
  { semitone: 10, type: "black" },
  { semitone: 11, type: "white", label: "B" },
];

const WHITE_KEY_WIDTH = 46; // px, includes 1px margin each side
const BLACK_KEY_WIDTH = 28;
const WHITE_KEY_HEIGHT = 160;
const BLACK_KEY_HEIGHT = 100;

/** Build a flat list of all keys for the given octave range. */
function buildKeys(startMidi: number, octaves: number) {
  const keys: Array<{
    note: number;
    type: "white" | "black";
    label?: string;
    octave: number;
    semitone: number;
  }> = [];

  for (let oct = 0; oct < octaves; oct++) {
    for (const p of OCTAVE_PATTERN) {
      const noteNum = startMidi + oct * 12 + p.semitone;
      const octaveNum = Math.floor(noteNum / 12) - 1;
      keys.push({
        note: noteNum,
        type: p.type,
        ...(p.label !== undefined ? { label: `${p.label}${octaveNum}` } : {}),
        octave: oct,
        semitone: p.semitone,
      });
    }
  }
  return keys;
}

/** Compute the left offset in px of a black key relative to keyboard left edge. */
function blackKeyLeft(
  octave: number,
  semitone: number,
  startOctaveWhiteCount: number,
): number {
  // White key index within the octave (0-indexed)
  const whitesBefore = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][semitone] ?? 0;
  const globalWhiteIndex = octave * 7 + whitesBefore + startOctaveWhiteCount;
  // Black key sits 2/3 of the way through the previous white key
  return globalWhiteIndex * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH * 0.65 - BLACK_KEY_WIDTH / 2;
}

export interface PianoKeyboardProps {
  startMidi?: number; // default 48 (C3)
  octaves?: number;   // default 2
  onNoteOn: (note: number, velocity: number) => void;
  onNoteOff: (note: number) => void;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  startMidi = 48,
  octaves = 2,
  onNoteOn,
  onNoteOff,
}) => {
  const keys = buildKeys(startMidi, octaves);
  const whiteKeys = keys.filter((k) => k.type === "white");
  const blackKeys = keys.filter((k) => k.type === "black");

  const totalWidth = whiteKeys.length * WHITE_KEY_WIDTH;

  const handleNoteOn = useCallback(
    (note: number, velocity: number) => onNoteOn(note, velocity),
    [onNoteOn],
  );
  const handleNoteOff = useCallback(
    (note: number) => onNoteOff(note),
    [onNoteOff],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      <View style={[styles.keyboard, { width: totalWidth }]}>
        {/* White keys */}
        <View style={styles.whiteRow}>
          {whiteKeys.map((k) => (
            <KeyboardKey
              key={k.note}
              note={k.note}
              {...(k.label !== undefined ? { label: k.label } : {})}
              keyType="white"
              onNoteOn={handleNoteOn}
              onNoteOff={handleNoteOff}
            />
          ))}
        </View>

        {/* Black keys — absolutely positioned */}
        {blackKeys.map((k) => (
          <View
            key={k.note}
            style={[
              styles.blackKeyWrapper,
              {
                left: blackKeyLeft(k.octave, k.semitone, 0),
                width: BLACK_KEY_WIDTH,
                height: BLACK_KEY_HEIGHT,
              },
            ]}
          >
            <KeyboardKey
              note={k.note}
              keyType="black"
              onNoteOn={handleNoteOn}
              onNoteOff={handleNoteOff}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  keyboard: {
    height: WHITE_KEY_HEIGHT,
    position: "relative",
  },
  whiteRow: {
    flexDirection: "row",
    position: "absolute",
    top: 0,
    left: 0,
  },
  blackKeyWrapper: {
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
});

export default PianoKeyboard;
