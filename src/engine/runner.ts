import { useCallback, useEffect, useRef, useState } from "react";

import { clamp } from "@/utils";

/**
 * Optional debugger hooks for the runner.
 *
 * `shouldBreak` is consulted on every auto-advance while playing. If it
 * returns true, playback pauses on that frame. Manual stepping / seeking
 * bypasses breakpoints, mirroring how IDE debuggers work.
 */
export interface RunnerDebuggerOptions {
  shouldBreak?: (frameIdx: number) => boolean;
}

export function useRunner(
  total: number,
  initialSpeed = 2,
  options: RunnerDebuggerOptions = {}
) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [speed, setSpeed] = useState(initialSpeed); // steps / second

  // Mirror idx in a ref so the interval tick can read the latest value
  // synchronously. React 19 runs setState updaters lazily during render,
  // so we can't rely on closure variables set from inside an updater being
  // visible to code that runs immediately after setIdx returns.
  const idxRef = useRef(idx);
  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Track the last index where a breakpoint fired so resuming from that frame
  // doesn't immediately re-pause on it.
  const breakAtRef = useRef<number | null>(null);
  // Keep the latest shouldBreak in a ref so the interval callback always sees
  // the current breakpoint set without restarting the timer on every change.
  const shouldBreakRef = useRef<RunnerDebuggerOptions["shouldBreak"]>(
    options.shouldBreak
  );
  useEffect(() => {
    shouldBreakRef.current = options.shouldBreak;
  }, [options.shouldBreak]);

  const pauseInternal = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    pauseInternal();
    setPlaying(false);
  }, [pauseInternal]);

  const play = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      const prevIdx = idxRef.current;
      let newIdx = prevIdx + direction;
      let shouldPause = false;

      // Check boundaries
      if (newIdx >= total || newIdx < 0) {
        newIdx = clamp(newIdx, 0, total - 1);
        shouldPause = true;
      } else {
        // Breakpoint check (only while auto-playing; skip the frame we just
        // resumed from so the user can step past it).
        const sb = shouldBreakRef.current;
        if (sb && breakAtRef.current !== newIdx && sb(newIdx)) {
          breakAtRef.current = newIdx;
          shouldPause = true;
        }
      }

      idxRef.current = newIdx;
      setIdx(newIdx);

      if (shouldPause) {
        // Stop the interval immediately so no further ticks fire before
        // React re-renders and the play/pause useEffect cleans up.
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setPlaying(false);
      }
    }, 1000 / speed);
  }, [direction, speed, total]);

  // Handle play/pause
  useEffect(() => {
    if (playing) {
      play();
    } else {
      pauseInternal();
    }

    return () => pauseInternal(); // cleanup
  }, [playing, play, pauseInternal]);

  const setIndex = (newIdx: number) => {
    const clampedIdx = clamp(newIdx, 0, total - 1);
    breakAtRef.current = null;
    idxRef.current = clampedIdx;
    setIdx(clampedIdx);
  };

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const toggleDirection = () => {
    const newDirection = direction === 1 ? -1 : 1;
    setDirection(newDirection as 1 | -1);
  };

  const setSpeedValue = (newSpeed: number) => {
    const clampedSpeed = clamp(newSpeed, 0.1, 10);
    setSpeed(clampedSpeed);
  };

  const reset = () => {
    breakAtRef.current = null;
    idxRef.current = 0;
    setIdx(0);
    setPlaying(false);
    setDirection(1);
  };

  const stepForward = () => {
    const newIdx = clamp(idxRef.current + 1, 0, total - 1);
    breakAtRef.current = null;
    idxRef.current = newIdx;
    setIdx(newIdx);
  };

  const stepBackward = () => {
    const newIdx = clamp(idxRef.current - 1, 0, total - 1);
    breakAtRef.current = null;
    idxRef.current = newIdx;
    setIdx(newIdx);
  };

  const goToStart = () => {
    breakAtRef.current = null;
    idxRef.current = 0;
    setIdx(0);
  };

  const goToEnd = () => {
    const endIdx = total - 1;
    breakAtRef.current = null;
    idxRef.current = endIdx;
    setIdx(endIdx);
  };

  // Compatibility methods for existing code
  const playForward = () => {
    setDirection(1);
    setPlaying(true);
  };

  const playBackward = () => {
    setDirection(-1);
    setPlaying(true);
  };

  return {
    idx,
    playing,
    direction,
    speed,
    setIndex,
    setIdx: setIndex, // alias for compatibility
    togglePlay,
    toggleDirection,
    setSpeed: setSpeedValue,
    reset,
    stepForward,
    stepNext: stepForward, // alias for compatibility
    stepBackward,
    stepPrev: stepBackward, // alias for compatibility
    goToStart,
    toStart: goToStart, // alias for compatibility
    goToEnd,
    toEnd: goToEnd, // alias for compatibility
    playForward,
    playBackward,
    pause,
    // Utility methods
    isAtStart: idx === 0,
    isAtEnd: idx === total - 1,
    progress: total > 0 ? (idx / (total - 1)) * 100 : 0,
    canStepForward: idx < total - 1,
    canStepBackward: idx > 0,
  };
}
