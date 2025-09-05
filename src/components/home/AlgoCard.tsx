import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n/exports";
import { cn, getDifficultyColor, formatDifficulty } from "@/utils";

export type AlgoItem = {
  slug: string;
  title: string;
  summary: string;
  tags?: string[];
  difficulty?: "Easy" | "Medium" | "Hard" | number;
  related?: string[];
  badge?: "Training" | "Beta" | "New"; // optional small badge
};

function DifficultyPill({ v }: { v?: AlgoItem["difficulty"] }) {
  if (v == null) return null;
  const label = formatDifficulty(v);
  const styles = getDifficultyColor(v);

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200",
        styles
      )}
    >
      {label}
    </span>
  );
}

/** Enhanced tiny bars for the thumbnail with animations */
function TinyBars({ seed = 1, accent }: { seed?: number; accent: string }) {
  // deterministic pseudo-random heights (0.25..1) based on seed
  const rand = (i: number) => {
    const x = Math.sin(seed * 997 + i * 131) * 43758.5453;
    return 0.25 + (x - Math.floor(x));
  };
  const hs = [0, 1, 2, 3, 4].map((i) => rand(i));

  return (
    <div className="absolute inset-0 flex items-end gap-2 p-6 transition-all duration-300">
      {hs.map((t, i) => (
        <div
          key={i}
          className="bg-white/95 rounded-sm transition-all duration-300 transform hover:scale-110"
          style={{
            width: 18,
            height: `${t * 70}%`,
            background: `linear-gradient(to top, ${accent || "#3b82f6"}, ${accent || "#60a5fa"})`,
          }}
        />
      ))}
    </div>
  );
}

function AlgoCard({
  topic,
  item,
  titleMap: _titleMap, // eslint-disable-line @typescript-eslint/no-unused-vars
  accent,
  "data-tour": dataTour,
}: {
  topic: string;
  item: AlgoItem;
  titleMap: Record<string, { title: string; topic: string }>;
  accent?: string;
  "data-tour"?: string;
}) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const seed = [...item.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  const headerBg = `bg-${accent}-500`; // e.g., bg-emerald-500

  const handleCardClick = () => {
    navigate(`/viz/${topic}/${item.slug}`);
  };

  return (
    <Card
      variant="default"
      hover="lift"
      interactive={true}
      data-tour={dataTour}
      className={cn(
        "group overflow-hidden transition-all duration-300 transform cursor-pointer",
        "hover:shadow-xl hover:scale-105",
        "border-0 shadow-soft min-h-[44px] touch-target",
        isHovered && "shadow-glow"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Enhanced thumbnail with animations */}
      <div
        className={cn(
          "relative h-36 transition-all duration-500 overflow-hidden",
          headerBg,
          "bg-gradient-to-br from-current to-opacity-80"
        )}
      >
        <TinyBars seed={seed} accent={accent || "#3b82f6"} />

        {/* Animated background overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent",
            "transform -skew-x-12 -translate-x-full transition-transform duration-1000",
            isHovered && "translate-x-full"
          )}
        />

        {/* Badge row (right) */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {item.badge ? (
            <span
              className={cn(
                "px-2 py-1 rounded-full text-xs font-semibold",
                "bg-white/90 text-slate-900 border border-white/60",
                "dark:bg-slate-900/80 dark:text-slate-100 dark:border-slate-700",
                "transition-all duration-200 transform",
                isHovered && "scale-110"
              )}
            >
              {item.badge}
            </span>
          ) : null}
        </div>

        {/* Algorithm type indicator */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              "bg-black/20 text-white backdrop-blur-sm",
              "transition-all duration-200",
              isHovered && "bg-black/30"
            )}
          >
            {topic.replace("-", " ").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Enhanced content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "text-base font-semibold leading-tight text-slate-900 dark:text-slate-100",
              "transition-colors duration-200 group-hover:text-primary-600",
              "dark:group-hover:text-primary-400"
            )}
          >
            {item.title}
          </h3>
          <DifficultyPill v={item.difficulty} />
        </div>

        <p
          className={cn(
            "text-sm text-slate-600 dark:text-slate-300 line-clamp-2",
            "transition-colors duration-200"
          )}
        >
          {item.summary}
        </p>

        {/* Enhanced tags */}
        {item.tags?.length ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium",
                  "bg-slate-100 text-slate-700 border border-slate-200",
                  "dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
                  "transition-all duration-200 hover:scale-105",
                  "hover:bg-primary-100 hover:text-primary-700",
                  "dark:hover:bg-primary-900 dark:hover:text-primary-300"
                )}
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span
                className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium",
                  "bg-slate-100 text-slate-500 border border-slate-200",
                  "dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                )}
              >
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        ) : null}

        {/* Quick action buttons */}
        <div
          className={cn(
            "flex items-center justify-between pt-2 opacity-0 transform translate-y-2",
            "transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
          )}
        >
          <div className="flex items-center space-x-2">
            <button
              className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-md text-xs",
                "text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400",
                "hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200",
                "min-h-[44px] touch-target"
              )}
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to visualizer with autostart
                navigate(`/viz/${topic}/${item.slug}?autostart=true`);
              }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{t("common.tryNow", { defaultValue: "Try Now" })}</span>
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t("common.ready", { defaultValue: "Ready" })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AlgoCard;
