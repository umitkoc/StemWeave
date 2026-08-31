/**
 * useRecording hook
 *
 * MIDI event stack with undo/redo (command pattern).
 * Wraps MidiRecorder and exposes start/stop/undo/redo.
 */

import { useCallback, useRef, useState } from "react";
import { MidiRecorder, type RecordedNote } from "../midi/MidiRecorder";

export interface UseRecordingResult {
  isRecording: boolean;
  notes: RecordedNote[];
  canUndo: boolean;
  canRedo: boolean;
  startRecording: (nowMs?: number) => void;
  stopRecording: (nowMs?: number) => RecordedNote[];
  recordNoteOn: (note: number, velocity: number, nowMs?: number) => void;
  recordNoteOff: (note: number, nowMs?: number) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

export function useRecording(bpm: number): UseRecordingResult {
  const recorderRef = useRef<MidiRecorder>(new MidiRecorder(bpm));
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState<RecordedNote[]>([]);

  // Undo/redo stacks: each entry is a full snapshot of RecordedNote[]
  const undoStack = useRef<RecordedNote[][]>([]);
  const redoStack = useRef<RecordedNote[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushSnapshot = useCallback((snapshot: RecordedNote[]) => {
    undoStack.current.push(snapshot);
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const startRecording = useCallback((nowMs?: number) => {
    recorderRef.current.setBpm(bpm);
    recorderRef.current.start(nowMs);
    setIsRecording(true);
  }, [bpm]);

  const stopRecording = useCallback((nowMs?: number): RecordedNote[] => {
    const recorded = recorderRef.current.stop();
    setIsRecording(false);
    if (recorded.length > 0) {
      pushSnapshot([...notes]);
      setNotes((prev) => {
        const next = [...prev, ...recorded];
        return next;
      });
    }
    return recorded;
  }, [notes, pushSnapshot]);

  const recordNoteOn = useCallback((note: number, velocity: number, nowMs?: number) => {
    recorderRef.current.recordNoteOn(note, velocity, nowMs);
  }, []);

  const recordNoteOff = useCallback((note: number, nowMs?: number) => {
    recorderRef.current.recordNoteOff(note, nowMs);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push([...notes]);
    setNotes(prev);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }, [notes]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push([...notes]);
    setNotes(next);
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  }, [notes]);

  const reset = useCallback(() => {
    recorderRef.current.start();
    recorderRef.current.stop();
    undoStack.current = [];
    redoStack.current = [];
    setNotes([]);
    setIsRecording(false);
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  return {
    isRecording,
    notes,
    canUndo,
    canRedo,
    startRecording,
    stopRecording,
    recordNoteOn,
    recordNoteOff,
    undo,
    redo,
    reset,
  };
}
