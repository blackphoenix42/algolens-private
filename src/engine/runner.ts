import { useEffect, useRef, useState } from "react";

import { LogCategory, logger } from "@/services/monitoring";
import { clamp } from "@/utils";

export function useRunner(total: number, initialSpeed = 1) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [speed, setSpeed] = useState(initialSpeed); // steps / second
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  const carry = useRef<number>(0); // fractional steps accumulator

  // Log runner initialization
  useEffect(() => {
    logger.debug(LogCategory.RUNNER, "Runner initialized", {
      total,
      initialSpeed,
      idx,
    });
  }, [total, initialSpeed, idx]);

  // Log state changes
  useEffect(() => {
    if (playing) {
      logger.debug(LogCategory.RUNNER, "Animation started", {
        direction: direction === 1 ? "forward" : "backward",
        speed,
        currentIndex: idx,
        total,
      });
    } else {
      logger.debug(LogCategory.RUNNER, "Animation stopped", {
        currentIndex: idx,
        total,
      });
    }
  }, [playing, direction, speed, idx, total]);

  useEffect(() => {
    if (!playing) return;

    const startTime = performance.now();
    logger.time(`animation-loop-${startTime}`, LogCategory.ANIMATION);

    const loop = (t: number) => {
      if (!last.current) last.current = t;
      const dt = (t - last.current) / 1000;
      carry.current += dt * Math.max(0, speed);
      const steps = Math.floor(carry.current);
      if (steps > 0) {
        carry.current -= steps;
        setIdx((i) => {
          const next = clamp(i + direction * steps, 0, Math.max(total - 1, 0));

          // Log step progression
          if (next !== i) {
            logger.trace(LogCategory.ANIMATION, "Animation step", {
              from: i,
              to: next,
              steps,
              direction,
              speed,
            });
          }

          if (next === 0 || next === Math.max(total - 1, 0)) {
            setPlaying(false);
            logger.debug(LogCategory.ANIMATION, "Animation reached boundary", {
              index: next,
              boundary: next === 0 ? "start" : "end",
            });
          }
          return next;
        });
        last.current = t;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        logger.timeEnd(`animation-loop-${startTime}`, LogCategory.ANIMATION);
      }
      last.current = 0;
      carry.current = 0;
    };
  }, [playing, speed, direction, total]);

  return {
    idx,
    setIdx: (newIdx: number) => {
      logger.debug(LogCategory.RUNNER, "Manual index change", {
        from: idx,
        to: newIdx,
      });
      setIdx(newIdx);
    },
    playing,
    setPlaying: (newPlaying: boolean) => {
      logger.debug(LogCategory.RUNNER, "Play state change", {
        from: playing,
        to: newPlaying,
      });
      setPlaying(newPlaying);
    },
    direction,
    setDirection: (newDirection: 1 | -1) => {
      logger.debug(LogCategory.RUNNER, "Direction change", {
        from: direction === 1 ? "forward" : "backward",
        to: newDirection === 1 ? "forward" : "backward",
      });
      setDirection(newDirection);
    },
    speed,
    setSpeed: (newSpeed: number) => {
      logger.debug(LogCategory.RUNNER, "Speed change", {
        from: speed,
        to: newSpeed,
      });
      setSpeed(newSpeed);
    },
    playForward: () => {
      logger.debug(LogCategory.RUNNER, "Play forward triggered");
      setDirection(1);
      setPlaying(true);
    },
    playBackward: () => {
      logger.debug(LogCategory.RUNNER, "Play backward triggered");
      setDirection(-1);
      setPlaying(true);
    },
    pause: () => {
      logger.debug(LogCategory.RUNNER, "Pause triggered");
      setPlaying(false);
    },
    stepNext: () => {
      logger.debug(LogCategory.RUNNER, "Step next triggered");
      setIdx((i) => {
        const next = clamp(i + 1, 0, Math.max(total - 1, 0));
        logger.trace(LogCategory.RUNNER, "Manual step forward", {
          from: i,
          to: next,
        });
        return next;
      });
    },
    stepPrev: () => {
      logger.debug(LogCategory.RUNNER, "Step previous triggered");
      setIdx((i) => {
        const next = clamp(i - 1, 0, Math.max(total - 1, 0));
        logger.trace(LogCategory.RUNNER, "Manual step backward", {
          from: i,
          to: next,
        });
        return next;
      });
    },
    toStart: () => {
      logger.debug(LogCategory.RUNNER, "Jump to start triggered");
      setIdx(0);
    },
    toEnd: () => {
      logger.debug(LogCategory.RUNNER, "Jump to end triggered");
      setIdx(Math.max(total - 1, 0));
    },
  };
}
