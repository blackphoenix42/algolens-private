import "./Transport.css";

import {
  FastForward,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
} from "lucide-react";
import React from "react";

import { useI18n } from "@/i18n";
// import { LogCategory, logger } from "@/services/monitoring";
import { cn } from "@/utils";

type Props = {
  playing: boolean;
  direction: 1 | -1;
  onPlayForward: () => void;
  onPlayBackward: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToStart: () => void;
  onToEnd: () => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  idx: number;
  total: number;
  onSeek: (v: number) => void;
};

export default function Transport(p: Props) {
  const { t } = useI18n();
  const {
    playing,
    direction,
    onPlayForward,
    onPlayBackward,
    onPause,
    onPrev,
    onNext,
    onToStart,
    onToEnd,
    speed,
    onSpeedChange,
    idx,
    total,
    onSeek,
  } = p;

  const formatSpeed = (speed: number): string => {
    if (speed < 1) {
      return `${Math.round(speed * 100)}%`;
    }
    return `${speed.toFixed(1)}×`;
  };

  const getSpeedColor = (speed: number): string => {
    if (speed < 0.5) return "text-blue-600";
    if (speed < 1) return "text-green-600";
    if (speed === 1) return "text-slate-900 dark:text-slate-100 font-semibold";
    if (speed <= 2) return "text-orange-600";
    return "text-red-600";
  };

  // Calculate progress percentage
  const progress = total > 1 ? (idx / (total - 1)) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Playback Controls */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {/* Skip to Start */}
        <button
          onClick={onToStart}
          disabled={idx === 0}
          className={cn(
            "rounded-lg p-2 transition-all duration-200",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center justify-center"
          )}
          title={t("controls.goToStart", { defaultValue: "Go to start" })}
          aria-label={t("controls.goToStart", { defaultValue: "Go to start" })}
        >
          <SkipBack className="h-4 w-4" />
        </button>

        {/* Step Backward */}
        <button
          onClick={() => {
            // logger.info(LogCategory.USER_INTERACTION, "Step backward clicked", {
            //   currentStep: idx,
            //   totalSteps: total,
            //   timestamp: new Date().toISOString(),
            // });
            onPrev();
          }}
          disabled={idx === 0}
          className={cn(
            "rounded-lg p-2 transition-all duration-200",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center justify-center"
          )}
          title={t("controls.previousStep", { defaultValue: "Previous step" })}
          aria-label={t("controls.previousStep", {
            defaultValue: "Previous step",
          })}
        >
          <StepBack className="h-4 w-4" />
        </button>

        {/* Play Backward */}
        <button
          onClick={() => {
            // logger.info(LogCategory.USER_INTERACTION, "Play backward clicked", {
            //   currentStep: idx,
            //   totalSteps: total,
            //   currentSpeed: speed,
            //   timestamp: new Date().toISOString(),
            // });
            onPlayBackward();
          }}
          disabled={playing && direction === -1}
          className={cn(
            "rounded-lg p-2 transition-all duration-200",
            playing && direction === -1
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center justify-center"
          )}
          title={t("controls.playBackward", { defaultValue: "Play backward" })}
          aria-label={t("controls.playBackward", {
            defaultValue: "Play backward",
          })}
        >
          <Rewind className="h-4 w-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => {
            const _action = playing ? "pause" : "play_forward";
            // logger.info(
            //   LogCategory.USER_INTERACTION,
            //   `Transport ${_action} clicked`,
            //   {
            //     currentStep: idx,
            //     totalSteps: total,
            //     currentSpeed: speed,
            //     direction: playing ? direction : 1,
            //     timestamp: new Date().toISOString(),
            //   }
            // );

            if (playing) {
              onPause();
            } else {
              onPlayForward();
            }
          }}
          className={cn(
            "rounded-lg p-3 transition-all duration-200",
            "bg-primary-600 hover:bg-primary-700 text-white shadow-sm",
            "flex min-w-[44px] items-center justify-center"
          )}
          title={
            playing
              ? t("controls.pause", { defaultValue: "Pause" })
              : t("controls.play", { defaultValue: "Play" })
          }
          aria-label={
            playing
              ? t("controls.pause", { defaultValue: "Pause" })
              : t("controls.play", { defaultValue: "Play" })
          }
        >
          {playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        {/* Play Forward */}
        <button
          onClick={onPlayForward}
          disabled={playing && direction === 1}
          className={cn(
            "rounded-lg p-2 transition-all duration-200",
            playing && direction === 1
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center justify-center"
          )}
          title={t("controls.playForward", { defaultValue: "Play forward" })}
          aria-label={t("controls.playForward", {
            defaultValue: "Play forward",
          })}
        >
          <FastForward className="h-4 w-4" />
        </button>

        {/* Step Forward */}
        <button
          onClick={onNext}
          disabled={idx >= total - 1}
          className={cn(
            "rounded-lg p-2 transition-all duration-200",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center justify-center"
          )}
          title={t("controls.nextStep", { defaultValue: "Next step" })}
          aria-label={t("controls.nextStep", { defaultValue: "Next step" })}
        >
          <StepForward className="h-4 w-4" />
        </button>

        {/* Skip to End */}
        <button
          onClick={onToEnd}
          disabled={idx >= total - 1}
          className={cn(
            "rounded-lg p-2 transition-all duration-200",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center justify-center"
          )}
          title={t("controls.goToEnd", { defaultValue: "Go to end" })}
          aria-label={t("controls.goToEnd", { defaultValue: "Go to end" })}
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <label className="font-medium text-slate-700 dark:text-slate-300">
            {t("controls.step", { defaultValue: "Step" })}
          </label>
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {idx + 1} / {total}
          </div>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={Math.max(total - 1, 0)}
            value={Math.min(idx, Math.max(total - 1, 0))}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="transport-slider focus:ring-primary-500 h-2 w-full rounded-lg bg-slate-200 focus:ring-2 focus:ring-offset-2 focus:outline-none dark:bg-slate-700"
            aria-label={t("controls.seekToStep", {
              defaultValue: "Seek to step",
            })}
          />
          <div className="progress-overlay" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("controls.speed", { defaultValue: "Speed" })}
          </label>
          <div className={cn("font-mono text-sm", getSpeedColor(speed))}>
            {formatSpeed(speed)}
          </div>
        </div>

        <div className="relative">
          <input
            type="range"
            min={0.1}
            max={4}
            step={0.1}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="transport-slider focus:ring-primary-500 h-2 w-full rounded-lg bg-slate-200 focus:ring-2 focus:ring-offset-2 focus:outline-none dark:bg-slate-700"
            aria-label={t("controls.animationSpeed", {
              defaultValue: "Animation speed",
            })}
          />

          {/* Speed markers */}
          <div className="relative mt-1 h-4">
            <span className="absolute left-0 text-xs text-slate-400">0.1×</span>
            <span
              className="absolute text-xs font-semibold text-slate-600 dark:text-slate-300"
              style={{ left: "23.08%", transform: "translateX(-50%)" }}
            >
              1×
            </span>
            <span
              className="absolute text-xs text-slate-400"
              style={{ left: "48.72%", transform: "translateX(-50%)" }}
            >
              2×
            </span>
            <span
              className="absolute text-xs text-slate-400"
              style={{ left: "74.36%", transform: "translateX(-50%)" }}
            >
              3×
            </span>
            <span className="absolute right-0 text-xs text-slate-400">4×</span>
          </div>
        </div>
      </div>
    </div>
  );
}
