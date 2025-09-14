import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { cn, formatDifficulty, getDifficultyColor } from "@/utils";
import { getRelevantTags } from "@/utils/algorithmTags";

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
        "rounded-full px-2 py-1 text-xs font-semibold transition-all duration-200",
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
          className="transform rounded-sm bg-white/95 transition-all duration-300 hover:scale-110"
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
  titleMap: _titleMap,
  accent,
  showTags = true,
  onTagClick,
  "data-tour": dataTour,
}: {
  topic: string;
  item: AlgoItem;
  titleMap: Record<string, { title: string; topic: string }>;
  accent?: string;
  showTags?: boolean;
  onTagClick?: (tag: string) => void;
  "data-tour"?: string;
}) {
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
        "group liquid-glass-card liquid-glass-glow transform cursor-pointer overflow-hidden transition-all duration-300",
        "hover:scale-105 hover:shadow-xl",
        "shadow-soft touch-target min-h-[44px]",
        isHovered && "shadow-glow"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Enhanced thumbnail with animations */}
      <div
        className={cn(
          "relative h-36 overflow-hidden transition-all duration-500",
          headerBg,
          "to-opacity-80 bg-gradient-to-br from-current"
        )}
      >
        <TinyBars seed={seed} accent={accent || "#3b82f6"} />

        {/* Animated background overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent",
            "-translate-x-full -skew-x-12 transform transition-transform duration-1000",
            isHovered && "translate-x-full"
          )}
        />

        {/* Badge row (right) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {item.badge ? (
            <span
              className={cn(
                "liquid-glass-filter px-2 py-1 text-xs font-semibold",
                "text-slate-900 dark:text-slate-100",
                "transform transition-all duration-200",
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
              "liquid-glass-filter px-2 py-1 text-xs font-medium",
              "text-white backdrop-blur-sm",
              "transition-all duration-200"
            )}
          >
            {topic.replace("-", " ").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Enhanced content */}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "text-base leading-tight font-semibold text-slate-900 dark:text-slate-100",
              "group-hover:text-primary-600 transition-colors duration-200",
              "dark:group-hover:text-primary-400"
            )}
          >
            {item.title}
          </h3>
          <DifficultyPill v={item.difficulty} />
        </div>

        <p
          className={cn(
            "line-clamp-2 text-sm text-slate-600 dark:text-slate-300",
            "transition-colors duration-200"
          )}
        >
          {item.summary}
        </p>

        {/* Enhanced tags */}
        {showTags && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {/* Use existing tags if available, otherwise generate relevant tags */}
            {(item.tags?.length
              ? item.tags
              : getRelevantTags(item.slug, item.title, topic)
            )
              .slice(0, 4)
              .map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTagClick) {
                      onTagClick(tag);
                    }
                  }}
                  className={cn(
                    "liquid-glass-filter cursor-pointer px-2 py-1 text-xs font-medium",
                    "text-slate-700 dark:text-slate-300",
                    "transition-all duration-200 hover:scale-105",
                    "hover:text-primary-700 dark:hover:text-primary-300",
                    "hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  )}
                  title={`Filter by ${tag}`}
                >
                  {tag}
                </button>
              ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default AlgoCard;
