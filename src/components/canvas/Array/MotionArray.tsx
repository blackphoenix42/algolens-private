import { AnimatePresence, motion, Variants } from "framer-motion";
import React from "react";

interface MotionBarProps {
  value: number;
  index: number;
  isHighlighted?: boolean;
  isCompared?: boolean;
  isSwapped?: boolean;
  isPivot?: boolean;
  color?: string;
  height: number;
  width: number;
  x: number;
  y: number;
  showLabels?: boolean;
  onClick?: () => void;
}

export const MotionBar: React.FC<MotionBarProps> = ({
  value,
  index,
  isHighlighted = false,
  isCompared = false,
  isSwapped = false,
  isPivot = false,
  color = "#3b82f6",
  height,
  width,
  x,
  y,
  showLabels = true,
  onClick,
}) => {
  // Animation variants for different states
  const barVariants: Variants = {
    initial: {
      scaleY: 0,
      opacity: 0,
      y: y + height,
    },
    animate: {
      scaleY: 1,
      opacity: 1,
      y: y,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6,
      },
    },
    highlighted: {
      scale: 1.1,
      backgroundColor: "#fbbf24",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    compared: {
      backgroundColor: "#ef4444",
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    swapped: {
      backgroundColor: "#10b981",
      scale: 1.2,
      rotate: [0, 5, -5, 0],
      transition: {
        backgroundColor: { duration: 0.3 },
        scale: { duration: 0.5 },
        rotate: { duration: 0.6 },
      },
    },
    pivot: {
      backgroundColor: "#8b5cf6",
      scale: 1.15,
      boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  const labelVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.3 },
    },
  };

  // Determine current animation state
  const getCurrentVariant = () => {
    if (isPivot) return "pivot";
    if (isSwapped) return "swapped";
    if (isCompared) return "compared";
    if (isHighlighted) return "highlighted";
    return "animate";
  };

  return (
    <motion.g
      initial="initial"
      animate={getCurrentVariant()}
      whileHover="hover"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {/* Bar */}
      <motion.rect
        variants={barVariants}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={2}
        fill={color}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1}
        style={{ transformOrigin: "bottom center" }}
      />

      {/* Value label */}
      <AnimatePresence>
        {showLabels && (
          <motion.text
            variants={labelVariants}
            x={x + width / 2}
            y={y + height + 16}
            textAnchor="middle"
            fontSize="12"
            fill="#374151"
            fontWeight="500"
          >
            {value}
          </motion.text>
        )}
      </AnimatePresence>

      {/* Index label */}
      <motion.text
        variants={labelVariants}
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        fontSize="10"
        fill="#6b7280"
      >
        {index}
      </motion.text>
    </motion.g>
  );
};

interface MotionArrayProps {
  array: number[];
  highlights?: {
    compared?: [number, number];
    swapped?: [number, number];
    pivot?: number;
    indices?: number[];
  };
  onBarClick?: (index: number, value: number) => void;
  showLabels?: boolean;
  colorMode?: "plain" | "rainbow" | "value";
  className?: string;
}

export const MotionArray: React.FC<MotionArrayProps> = ({
  array,
  highlights = {},
  onBarClick,
  showLabels = true,
  colorMode = "plain",
  className = "",
}) => {
  const BAR_WIDTH = 24;
  const GAP = 8;
  const PADDING = 40;
  const MAX_HEIGHT = 200;

  const maxValue = Math.max(...array);
  const minValue = Math.min(...array);
  const valueRange = maxValue - minValue || 1;

  const totalWidth = array.length * (BAR_WIDTH + GAP) - GAP + PADDING * 2;
  const totalHeight = MAX_HEIGHT + PADDING * 2 + 40; // Extra space for labels

  const getBarColor = (value: number, index: number) => {
    switch (colorMode) {
      case "rainbow": {
        const hue = (index / array.length) * 360;
        return `hsl(${hue}, 70%, 60%)`;
      }
      case "value": {
        const intensity = (value - minValue) / valueRange;
        return `hsl(${240 - intensity * 120}, 80%, 60%)`;
      }
      default:
        return "#3b82f6";
    }
  };

  const getBarHeight = (value: number) => {
    return Math.max(4, ((value - minValue) / valueRange) * MAX_HEIGHT);
  };

  return (
    <div className={`h-full w-full overflow-auto ${className}`}>
      <motion.svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="grid"
            width={BAR_WIDTH + GAP}
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${BAR_WIDTH + GAP} 0 L 0 0 0 20`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" opacity={0.3} />

        {/* X-axis */}
        <motion.line
          x1={PADDING}
          y1={PADDING + MAX_HEIGHT}
          x2={totalWidth - PADDING}
          y2={PADDING + MAX_HEIGHT}
          stroke="#6b7280"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Array bars with staggered animation */}
        <AnimatePresence mode="wait">
          {array.map((value, index) => {
            const barHeight = getBarHeight(value);
            const x = PADDING + index * (BAR_WIDTH + GAP);
            const y = PADDING + MAX_HEIGHT - barHeight;

            const isCompared = highlights.compared?.includes(index) || false;
            const isSwapped = highlights.swapped?.includes(index) || false;
            const isPivot = highlights.pivot === index;
            const isHighlighted = highlights.indices?.includes(index) || false;

            return (
              <MotionBar
                key={`bar-${index}-${value}`}
                value={value}
                index={index}
                isHighlighted={isHighlighted}
                isCompared={isCompared}
                isSwapped={isSwapped}
                isPivot={isPivot}
                color={getBarColor(value, index)}
                height={barHeight}
                width={BAR_WIDTH}
                x={x}
                y={y}
                showLabels={showLabels}
                onClick={() => onBarClick?.(index, value)}
              />
            );
          })}
        </AnimatePresence>

        {/* Sorting indicators */}
        <AnimatePresence>
          {highlights.compared && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {highlights.compared.map((index, i) => (
                <motion.circle
                  key={`compare-${i}`}
                  cx={PADDING + index * (BAR_WIDTH + GAP) + BAR_WIDTH / 2}
                  cy={PADDING - 20}
                  r={8}
                  fill="#ef4444"
                  opacity={0.8}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </motion.svg>
    </div>
  );
};
