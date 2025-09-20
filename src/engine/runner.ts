import { useCallback, useEffect, useRef, useState } from "react";

// import { LogCategory, logger } from "@/services/monitoring";
import { clamp } from "@/utils";

export function useRunner(total: number, initialSpeed = 1) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [speed, setSpeed] = useState(initialSpeed); // steps / second

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize runner with logging disabled
  useEffect(() => {
    // logger.debug(LogCategory.RUNNER, "Runner initialized", {
    //   total,
    //   initialSpeed,
    //   timestamp: new Date().toISOString(),
    // });
  }, [total, initialSpeed]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (intervalRef.current) return;

    const _startTime = Date.now();
    // logger.time(`animation-loop-${_startTime}`, LogCategory.ANIMATION);

    intervalRef.current = setInterval(() => {
      setIdx((prevIdx) => {
        let newIdx = prevIdx + direction;

        // Logging disabled
        // if (process.env.NODE_ENV === "development") {
        //   logger.trace(LogCategory.ANIMATION, "Animation step", {
        //     prevIdx,
        //     newIdx,
        //     direction,
        //     speed,
        //     timestamp: performance.now(),
        //   });
        // }

        // Check boundaries
        if (newIdx >= total || newIdx < 0) {
          // logger.debug(LogCategory.ANIMATION, "Animation reached boundary", {
          //   prevIdx,
          //   attemptedIdx: newIdx,
          //   total,
          //   direction,
          //   action: "clamping",
          // });

          newIdx = clamp(newIdx, 0, total - 1);

          // Auto-pause when reaching boundaries
          setTimeout(() => {
            setPlaying(false);
          }, 0);
        }

        return newIdx;
      });
    }, 1000 / speed);
  }, [direction, speed, total]);

  // Handle play/pause
  useEffect(() => {
    if (playing) {
      play();
    } else {
      pause();
    }

    return () => pause(); // cleanup
  }, [playing, play, pause]);

  const setIndex = (newIdx: number) => {
    const clampedIdx = clamp(newIdx, 0, total - 1);
    // logger.debug(LogCategory.RUNNER, "Manual index change", {
    //   requestedIdx: newIdx,
    //   actualIdx: clampedIdx,
    //   total,
    // });
    setIdx(clampedIdx);
  };

  const togglePlay = () => {
    // logger.debug(LogCategory.RUNNER, "Play state change", {
    //   from: playing,
    //   to: !playing,
    //   idx,
    // });
    setPlaying(!playing);
  };

  const toggleDirection = () => {
    const newDirection = direction === 1 ? -1 : 1;
    // logger.debug(LogCategory.RUNNER, "Direction change", {
    //   from: direction,
    //   to: newDirection,
    //   idx,
    // });
    setDirection(newDirection as 1 | -1);
  };

  const setSpeedValue = (newSpeed: number) => {
    const clampedSpeed = clamp(newSpeed, 0.1, 10);
    // logger.debug(LogCategory.RUNNER, "Speed change", {
    //   from: speed,
    //   to: clampedSpeed,
    //   requested: newSpeed,
    // });
    setSpeed(clampedSpeed);
  };

  const reset = () => {
    // logger.debug(LogCategory.RUNNER, "Runner reset", {
    //   previousIdx: idx,
    //   wasPlaying: playing,
    // });
    setIdx(0);
    setPlaying(false);
    setDirection(1);
  };

  const stepForward = () => {
    const newIdx = clamp(idx + 1, 0, total - 1);
    // logger.trace(LogCategory.RUNNER, "Step forward", {
    //   from: idx,
    //   to: newIdx,
    //   total,
    // });
    setIdx(newIdx);
  };

  const stepBackward = () => {
    const newIdx = clamp(idx - 1, 0, total - 1);
    // logger.trace(LogCategory.RUNNER, "Step backward", {
    //   from: idx,
    //   to: newIdx,
    //   total,
    // });
    setIdx(newIdx);
  };

  const goToStart = () => {
    // logger.debug(LogCategory.RUNNER, "Go to start", {
    //   from: idx,
    //   to: 0,
    // });
    setIdx(0);
  };

  const goToEnd = () => {
    const endIdx = total - 1;
    // logger.debug(LogCategory.RUNNER, "Go to end", {
    //   from: idx,
    //   to: endIdx,
    //   total,
    // });
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
