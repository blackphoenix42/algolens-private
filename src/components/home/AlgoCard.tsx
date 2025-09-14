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
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold",
        "shadow-soft backdrop-blur-sm",
        "border border-white/20 dark:border-white/10",
        "bg-white/10 dark:bg-black/20",
        "hover:shadow-medium transition-all duration-300 hover:scale-105",
        "hover:bg-white/20 dark:hover:bg-black/30",
        styles
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

/** Enhanced tiny bars for the thumbnail with animations */
function TinyBars({
  seed = 1,
  accent,
  isHovered,
}: {
  seed?: number;
  accent: string;
  isHovered?: boolean;
}) {
  // deterministic pseudo-random heights (0.3..1) based on seed
  const rand = (i: number) => {
    const x = Math.sin(seed * 997 + i * 131) * 43758.5453;
    return 0.3 + (x - Math.floor(x)) * 0.7;
  };
  const hs = [0, 1, 2, 3, 4, 5].map((i) => rand(i));

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-1.5 p-8 transition-all duration-500">
      {hs.map((t, i) => (
        <div
          key={i}
          className={cn(
            "shadow-soft relative transform rounded-t-md transition-all duration-500 hover:scale-110",
            "bg-white/90 dark:bg-white/20"
          )}
          style={{
            width: 12,
            height: `${t * 80}%`,
            background: `linear-gradient(to top, ${accent || "#3b82f6"}dd, ${accent || "#60a5fa"}bb, ${accent || "#93c5fd"}99)`,
            animationDelay: `${i * 100}ms`,
            transform: isHovered
              ? `scaleY(${1 + i * 0.1}) translateZ(0)`
              : "scaleY(1) translateZ(0)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: `${i * 50}ms`,
          }}
        >
          {/* Subtle glow effect - enhanced for dark mode */}
          <div
            className="absolute inset-0 rounded-t-md opacity-60 blur-sm dark:opacity-80"
            style={{
              background: `linear-gradient(to top, ${accent || "#3b82f6"}66, transparent)`,
            }}
          />

          {/* Animated highlight on hover - better for dark mode */}
          <div
            className={cn(
              "absolute inset-0 rounded-t-md transition-all duration-300",
              "bg-white/20 dark:bg-white/30",
              "origin-bottom scale-y-0 transform",
              isHovered && "scale-y-100"
            )}
            style={{
              transitionDelay: `${i * 100}ms`,
            }}
          />
        </div>
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
  index = 0,
}: {
  topic: string;
  item: AlgoItem;
  titleMap: Record<string, { title: string; topic: string }>;
  accent?: string;
  showTags?: boolean;
  onTagClick?: (tag: string) => void;
  "data-tour"?: string;
  index?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const seed = [...item.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  const headerBg = `bg-${accent}-500`; // e.g., bg-emerald-500

  // Entrance animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const handleCardClick = () => {
    navigate(`/viz/${topic}/${item.slug}`);
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  return (
    <Card
      variant="default"
      hover="lift"
      interactive={true}
      data-tour={dataTour}
      className={cn(
        "group liquid-glass-card liquid-glass-glow transform cursor-pointer overflow-hidden",
        "transition-all duration-500 hover:duration-300 active:duration-150",
        "hover:shadow-xl-soft hover:-translate-y-1 hover:scale-[1.02]",
        "active:shadow-medium active:scale-[0.98]",
        "shadow-soft touch-target h-full min-h-[44px]",
        "border border-slate-200/50 dark:border-slate-700/50",
        // Enhanced dark mode states
        "bg-white/80 backdrop-blur-sm dark:bg-slate-900/80",
        // Entrance animation
        "translate-y-4 scale-95 opacity-0",
        isVisible && "translate-y-0 scale-100 opacity-100",
        // Enhanced hover states for dark mode
        isHovered &&
          cn(
            "shadow-glow-lg ring-primary-500/20 ring-1",
            "dark:shadow-primary-500/20 dark:ring-primary-400/30",
            "dark:bg-slate-900/90"
          ),
        isPressed && "shadow-medium scale-[0.98] dark:shadow-slate-900/50"
      )}
      style={{
        transitionDelay: isVisible ? "0ms" : `${index * 50}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleCardClick}
    >
      {/* Enhanced thumbnail with animations */}
      <div
        className={cn(
          "relative h-40 overflow-hidden transition-all duration-700",
          headerBg,
          "bg-gradient-to-br from-current via-current/90 to-current/70",
          "before:absolute before:inset-0 before:bg-gradient-to-t",
          "before:from-black/10 before:to-transparent",
          "dark:before:from-black/30 dark:before:to-transparent"
        )}
      >
        <TinyBars
          seed={seed}
          accent={accent || "#3b82f6"}
          isHovered={isHovered}
        />

        {/* Animated shimmer overlay - enhanced for dark mode */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent to-transparent",
            "via-white/20 dark:via-white/10",
            "-translate-x-full -skew-x-12 transform transition-transform duration-1200",
            "h-full w-full",
            isHovered && "translate-x-full"
          )}
        />

        {/* Floating particles effect - better visibility in dark mode */}
        <div className="pointer-events-none absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute h-1 w-1 rounded-full",
                "bg-white/30 dark:bg-white/50",
                "animate-float opacity-0 transition-opacity duration-500",
                isHovered && "opacity-100"
              )}
              style={{
                left: `${20 + i * 25}%`,
                top: `${30 + i * 15}%`,
                animationDelay: `${i * 800}ms`,
                animationDuration: "3s",
              }}
            />
          ))}
        </div>

        {/* Badge row (right) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {item.badge ? (
            <span
              className={cn(
                "liquid-glass-filter rounded-full px-3 py-1.5 text-xs font-bold",
                "border border-white/30 bg-white/20 dark:border-white/20 dark:bg-white/10",
                "shadow-soft text-white backdrop-blur-sm",
                "transform transition-all duration-300",
                isHovered && "scale-110 bg-white/30 dark:bg-white/20"
              )}
            >
              {item.badge}
            </span>
          ) : null}
        </div>

        {/* Algorithm type indicator */}
        <div className="absolute bottom-4 left-4 z-10">
          <span
            className={cn(
              "liquid-glass-filter rounded-md px-3 py-1.5 text-xs font-bold",
              "border border-white/20 bg-black/20 dark:border-white/10 dark:bg-black/40",
              "shadow-soft tracking-wider text-white backdrop-blur-sm",
              "transition-all duration-300"
            )}
          >
            {topic.replace("-", " ").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Enhanced content */}
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <h3
            className={cn(
              "text-lg leading-tight font-bold text-slate-900 dark:text-slate-100",
              "group-hover:text-primary-600 transition-colors duration-300",
              "dark:group-hover:text-primary-400 line-clamp-2"
            )}
          >
            {item.title}
          </h3>
          <div className="flex-shrink-0">
            <DifficultyPill v={item.difficulty} />
          </div>
        </div>

        <p
          className={cn(
            "line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300",
            "transition-colors duration-300 group-hover:text-slate-700 dark:group-hover:text-slate-200"
          )}
        >
          {item.summary}
        </p>

        {/* Enhanced tags */}
        {showTags && (
          <div className="flex flex-wrap gap-2 pt-2">
            {/* Use existing tags if available, otherwise generate relevant tags */}
            {(item.tags?.length
              ? item.tags
              : getRelevantTags(item.slug, item.title, topic)
            )
              .slice(0, 4)
              .map((tag, index) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTagClick) {
                      onTagClick(tag);
                    }
                  }}
                  className={cn(
                    "liquid-glass-filter cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium",
                    "border bg-slate-100/80 dark:bg-slate-800/60",
                    "border-slate-200/60 backdrop-blur-sm dark:border-slate-700/50",
                    "shadow-soft text-slate-700 dark:text-slate-300",
                    "hover:shadow-medium transition-all duration-300 hover:scale-105",
                    "hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200",
                    "dark:hover:bg-primary-900/30 dark:hover:text-primary-300 dark:hover:border-primary-700/50",
                    // Enhanced dark mode hover states
                    "dark:hover:bg-primary-900/40 dark:hover:shadow-primary-500/10"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
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
