// src/engine/syncedRunner.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { clamp } from "@/utils";

/**
 * Optional debugger hooks for {@link useSyncedRunners}.
 *
 * `shouldBreak` is consulted on every auto-advance tick. It receives the
 * proposed indices for *every* timeline; if it returns true, playback
 * pauses. This mirrors {@link useRunner}'s contract but extended to N
 * timelines.
 */
export interface SyncedRunnerDebuggerOptions {
  shouldBreak?: (frameIndices: readonly number[]) => boolean;
}

export interface SyncedRunnersApi {
  /** One index per timeline, in the same order as `totals` was passed. */
  indices: readonly number[];
  /** True while the transport is auto-advancing. */
  playing: boolean;
  /** +1 forward / -1 backward. */
  direction: 1 | -1;
  /** Steps per second of the master clock. */
  speed: number;
  /** Master progress 0..100 based on the slowest timeline. */
  progress: number;
  /** True when *all* timelines are clamped at frame 0. */
  isAtStart: boolean;
  /** True when *all* timelines are clamped at their last frame. */
  isAtEnd: boolean;
  togglePlay: () => void;
  pause: () => void;
  playForward: () => void;
  playBackward: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  setMasterIndex: (idx: number) => void;
  setSpeed: (speed: number) => void;
}

/**
 * Drive multiple algorithm timelines from a single transport.
 *
 * Each tick advances every timeline by `direction`, clamping at its own
 * boundaries. Timelines of different lengths run lock-step in *frame
 * count*, not in real time — i.e. tick 5 on both means "frame 5 of each",
 * regardless of their total length. When all timelines are clamped at the
 * end, playback auto-pauses.
 *
 * For side-by-side runs the canonical usage is `totals=[a.length, b.length]`.
 */
export function useSyncedRunners(
  totals: readonly number[],
  initialSpeed = 2,
  options: SyncedRunnerDebuggerOptions = {}
): SyncedRunnersApi {
  const totalsSig = totals.join(",");
  const maxTotal = useMemo(
    () => (totals.length === 0 ? 0 : Math.max(...totals)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalsSig]
  );

  const [master, setMaster] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [speed, setSpeedState] = useState(initialSpeed);

  const masterRef = useRef(master);
  useEffect(() => {
    masterRef.current = master;
  }, [master]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breakAtRef = useRef<number | null>(null);
  const shouldBreakRef = useRef(options.shouldBreak);
  useEffect(() => {
    shouldBreakRef.current = options.shouldBreak;
  }, [options.shouldBreak]);

  // Derived per-timeline indices (each clamped to its own [0, total-1]).
  const indices = useMemo(
    () => totals.map((t) => clamp(master, 0, Math.max(0, t - 1))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [master, totalsSig]
  );

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    stopInterval();
    setPlaying(false);
  }, [stopInterval]);

  const play = useCallback(() => {
    if (intervalRef.current) return;
    if (maxTotal === 0) return;

    intervalRef.current = setInterval(() => {
      const prev = masterRef.current;
      let next = prev + direction;
      let shouldPause = false;

      if (next >= maxTotal || next < 0) {
        next = clamp(next, 0, maxTotal - 1);
        shouldPause = true;
      } else {
        const sb = shouldBreakRef.current;
        if (sb) {
          const projected = totals.map((t) =>
            clamp(next, 0, Math.max(0, t - 1))
          );
          if (breakAtRef.current !== next && sb(projected)) {
            breakAtRef.current = next;
            shouldPause = true;
          }
        }
      }

      masterRef.current = next;
      setMaster(next);

      if (shouldPause) {
        stopInterval();
        setPlaying(false);
      }
    }, 1000 / speed);
  }, [direction, speed, maxTotal, totals, stopInterval]);

  useEffect(() => {
    if (playing) play();
    else stopInterval();
    return () => stopInterval();
  }, [playing, play, stopInterval]);

  const setMasterIndex = useCallback(
    (idx: number) => {
      const clamped = clamp(idx, 0, Math.max(0, maxTotal - 1));
      breakAtRef.current = null;
      masterRef.current = clamped;
      setMaster(clamped);
    },
    [maxTotal]
  );

  const stepForward = useCallback(() => {
    setMasterIndex(masterRef.current + 1);
  }, [setMasterIndex]);

  const stepBackward = useCallback(() => {
    setMasterIndex(masterRef.current - 1);
  }, [setMasterIndex]);

  const reset = useCallback(() => {
    breakAtRef.current = null;
    masterRef.current = 0;
    setMaster(0);
    setPlaying(false);
    setDirection(1);
  }, []);

  const goToStart = useCallback(() => setMasterIndex(0), [setMasterIndex]);
  const goToEnd = useCallback(
    () => setMasterIndex(maxTotal - 1),
    [maxTotal, setMasterIndex]
  );

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const playForward = useCallback(() => {
    setDirection(1);
    setPlaying(true);
  }, []);
  const playBackward = useCallback(() => {
    setDirection(-1);
    setPlaying(true);
  }, []);
  const setSpeed = useCallback((s: number) => {
    setSpeedState(clamp(s, 0.1, 10));
  }, []);

  const progress = maxTotal > 1 ? (master / (maxTotal - 1)) * 100 : 0;
  const isAtStart = master === 0;
  const isAtEnd = maxTotal === 0 ? true : master >= maxTotal - 1;

  return {
    indices,
    playing,
    direction,
    speed,
    progress,
    isAtStart,
    isAtEnd,
    togglePlay,
    pause,
    playForward,
    playBackward,
    stepForward,
    stepBackward,
    reset,
    goToStart,
    goToEnd,
    setMasterIndex,
    setSpeed,
  };
}
