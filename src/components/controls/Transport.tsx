import {
  SkipBack,
  StepBack,
  Play,
  Pause,
  StepForward,
  SkipForward,
  Rewind,
  FastForward,
} from "lucide-react";
import React from "react";

import { useI18n } from "@/i18n";
import { LogCategory, logger } from "@/services/monitoring";
import { cn } from "@/utils";

import "./Transport.css";

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

  // Use useEffect to update CSS custom property
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--transport-progress",
      `${progress}%`
    );
  }, [progress]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {/* Skip to Start */}
        <button
          onClick={onToStart}
          disabled={idx === 0}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center"
          )}
          title={t("controls.goToStart", { defaultValue: "Go to start" })}
          aria-label={t("controls.goToStart", { defaultValue: "Go to start" })}
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Step Backward */}
        <button
          onClick={() => {
            logger.info(LogCategory.USER_INTERACTION, "Step backward clicked", {
              currentStep: idx,
              totalSteps: total,
              timestamp: new Date().toISOString(),
            });
            onPrev();
          }}
          disabled={idx === 0}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center"
          )}
          title={t("controls.previousStep", { defaultValue: "Previous step" })}
          aria-label={t("controls.previousStep", {
            defaultValue: "Previous step",
          })}
        >
          <StepBack className="w-4 h-4" />
        </button>

        {/* Play Backward */}
        <button
          onClick={() => {
            logger.info(LogCategory.USER_INTERACTION, "Play backward clicked", {
              currentStep: idx,
              totalSteps: total,
              currentSpeed: speed,
              timestamp: new Date().toISOString(),
            });
            onPlayBackward();
          }}
          disabled={playing && direction === -1}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            playing && direction === -1
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center"
          )}
          title={t("controls.playBackward", { defaultValue: "Play backward" })}
          aria-label={t("controls.playBackward", {
            defaultValue: "Play backward",
          })}
        >
          <Rewind className="w-4 h-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => {
            const action = playing ? "pause" : "play_forward";
            logger.info(
              LogCategory.USER_INTERACTION,
              `Transport ${action} clicked`,
              {
                currentStep: idx,
                totalSteps: total,
                currentSpeed: speed,
                direction: playing ? direction : 1,
                timestamp: new Date().toISOString(),
              }
            );

            if (playing) {
              onPause();
            } else {
              onPlayForward();
            }
          }}
          className={cn(
            "p-3 rounded-lg transition-all duration-200",
            "bg-primary-600 hover:bg-primary-700 text-white shadow-sm",
            "flex items-center justify-center min-w-[44px]"
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
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        {/* Play Forward */}
        <button
          onClick={onPlayForward}
          disabled={playing && direction === 1}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            playing && direction === 1
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center"
          )}
          title={t("controls.playForward", { defaultValue: "Play forward" })}
          aria-label={t("controls.playForward", {
            defaultValue: "Play forward",
          })}
        >
          <FastForward className="w-4 h-4" />
        </button>

        {/* Step Forward */}
        <button
          onClick={onNext}
          disabled={idx >= total - 1}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center"
          )}
          title={t("controls.nextStep", { defaultValue: "Next step" })}
          aria-label={t("controls.nextStep", { defaultValue: "Next step" })}
        >
          <StepForward className="w-4 h-4" />
        </button>

        {/* Skip to End */}
        <button
          onClick={onToEnd}
          disabled={idx >= total - 1}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center"
          )}
          title={t("controls.goToEnd", { defaultValue: "Go to end" })}
          aria-label={t("controls.goToEnd", { defaultValue: "Go to end" })}
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>
            {t("controls.step", { defaultValue: "Step" })} {idx + 1}
          </span>
          <span>
            {total} {t("controls.total", { defaultValue: "total" })}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={Math.max(total - 1, 0)}
            value={idx}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg transport-slider focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={t("controls.seekToStep", {
              defaultValue: "Seek to step",
            })}
          />
          <div
            className="progress-overlay"
            data-progress={Math.round(progress)}
          />
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("controls.speed", { defaultValue: "Speed" })}
          </label>
          <div className={cn("text-sm font-mono", getSpeedColor(speed))}>
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
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg transport-slider focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={t("controls.animationSpeed", {
              defaultValue: "Animation speed",
            })}
          />

          {/* Speed markers */}
          <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
            <span>0.1×</span>
            <span className="font-semibold">1×</span>
            <span>4×</span>
          </div>
        </div>

        {/* Speed descriptions */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {speed < 0.5 &&
            t("controls.speedVerySlowDesc", {
              defaultValue: "Very slow - detailed analysis",
            })}
          {speed >= 0.5 &&
            speed < 1 &&
            t("controls.speedSlowDesc", {
              defaultValue: "Slow - step by step",
            })}
          {speed === 1 &&
            t("controls.speedNormalDesc", { defaultValue: "Normal speed" })}
          {speed > 1 &&
            speed <= 2 &&
            t("controls.speedFastDesc", {
              defaultValue: "Fast - quick overview",
            })}
          {speed > 2 &&
            t("controls.speedVeryFastDesc", {
              defaultValue: "Very fast - rapid execution",
            })}
        </div>
      </div>
    </div>
  );
}
