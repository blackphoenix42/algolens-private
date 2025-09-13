import { useSpring, animated, useSprings, config } from "@react-spring/web";
import React, { useState, useCallback, useEffect } from "react";

interface SpringBarProps {
  value: number;
  index: number;
  isHighlighted?: boolean;
  isCompared?: boolean;
  isSwapped?: boolean;
  maxValue: number;
  width: number;
  height: number;
  x: number;
  color?: string;
  onClick?: () => void;
}

const SpringBar: React.FC<SpringBarProps> = ({
  value,
  index,
  isHighlighted = false,
  isCompared = false,
  isSwapped = false,
  maxValue,
  width,
  height: maxHeight,
  x,
  color = "#3b82f6",
  onClick,
}) => {
  const barHeight = Math.max(4, (value / maxValue) * maxHeight);

  // Spring animation for the bar
  const barSpring = useSpring({
    height: barHeight,
    transform: `translateX(${x}px)`,
    backgroundColor: isSwapped
      ? "#10b981"
      : isCompared
        ? "#ef4444"
        : isHighlighted
          ? "#fbbf24"
          : color,
    scale: isHighlighted || isCompared || isSwapped ? 1.1 : 1,
    config: isSwapped
      ? config.wobbly
      : isCompared
        ? config.stiff
        : config.gentle,
  });

  // Bounce effect for value changes
  const valueSpring = useSpring({
    from: { scale: 1, rotation: 0 },
    to: async (next) => {
      if (isSwapped) {
        await next({ scale: 1.3, rotation: 10 });
        await next({ scale: 0.9, rotation: -5 });
        await next({ scale: 1.1, rotation: 0 });
        await next({ scale: 1, rotation: 0 });
      }
    },
    config: config.wobbly,
  });

  return (
    <div className="relative">
      <animated.div
        style={{
          ...barSpring,
          width,
          transformOrigin: "bottom center",
          position: "absolute",
          bottom: 30,
          cursor: onClick ? "pointer" : "default",
          borderRadius: "4px",
          display: "flex",
          alignItems: "end",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "12px",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
        onClick={onClick}
      >
        <animated.div
          style={{
            ...valueSpring,
            padding: "2px",
          }}
        >
          {value}
        </animated.div>
      </animated.div>

      {/* Index label */}
      <div
        className="absolute bottom-0 w-full text-center text-xs text-gray-600"
        style={{ left: x }}
      >
        {index}
      </div>
    </div>
  );
};

interface SpringArrayProps {
  array: number[];
  highlights?: {
    compared?: [number, number];
    swapped?: [number, number];
    pivot?: number;
    indices?: number[];
  };
  onBarClick?: (index: number, value: number) => void;
  className?: string;
}

export const SpringArray: React.FC<SpringArrayProps> = ({
  array,
  highlights = {},
  onBarClick,
  className = "",
}) => {
  const maxValue = Math.max(...array);
  const barWidth = 40;
  const barSpacing = 50;
  const containerHeight = 300;
  const barHeight = 200;

  // Springs for array entrance animation
  const [springs, api] = useSprings(
    array.length,
    (i) => ({
      from: { opacity: 0, transform: "translateY(100px) scale(0)" },
      to: { opacity: 1, transform: "translateY(0px) scale(1)" },
      delay: i * 100,
      config: config.wobbly,
    }),
    [array.length]
  );

  // Trigger animation when array changes
  useEffect(() => {
    api.start((i) => ({
      from: { opacity: 0, transform: "translateY(50px) rotateX(90deg)" },
      to: { opacity: 1, transform: "translateY(0px) rotateX(0deg)" },
      delay: i * 50,
      config: config.wobbly,
    }));
  }, [array, api]);

  return (
    <div
      className={`relative overflow-x-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        className="relative"
        style={{
          width: array.length * barSpacing,
          height: containerHeight,
        }}
      >
        {springs.map((spring, index) => {
          const value = array[index];
          const isCompared = highlights.compared?.includes(index) || false;
          const isSwapped = highlights.swapped?.includes(index) || false;
          const isHighlighted =
            highlights.indices?.includes(index) || highlights.pivot === index;

          return (
            <animated.div
              key={`spring-${index}`}
              style={{
                ...spring,
                position: "absolute",
                left: 0,
                top: 0,
              }}
            >
              <SpringBar
                value={value}
                index={index}
                isHighlighted={isHighlighted}
                isCompared={isCompared}
                isSwapped={isSwapped}
                maxValue={maxValue}
                width={barWidth}
                height={barHeight}
                x={index * barSpacing}
                onClick={() => onBarClick?.(index, value)}
              />
            </animated.div>
          );
        })}
      </div>
    </div>
  );
};

// Physics-based sorting animation component
export const SpringSortingDemo: React.FC = () => {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [highlights, setHighlights] = useState<SpringArrayProps["highlights"]>(
    {}
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // Container spring for overall animations
  const containerSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.8)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: config.gentle,
  });

  // Generate new random array
  const generateArray = useCallback(() => {
    if (isAnimating) return;
    const newArray = Array.from(
      { length: 8 },
      () => Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
    setHighlights({});
  }, [isAnimating]);

  // Bubble sort with spring animations
  const animatedBubbleSort = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        // Highlight comparison
        setHighlights({ compared: [j, j + 1] });
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (arr[j] > arr[j + 1]) {
          // Highlight swap
          setHighlights({ swapped: [j, j + 1] });
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          swapped = true;
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }

        setHighlights({});
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (!swapped) break;
    }

    setIsAnimating(false);
  }, [array, isAnimating]);

  // Shuffle array with spring effect
  const shuffleArray = useCallback(() => {
    if (isAnimating) return;
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    setArray(shuffled);
    setHighlights({});
  }, [array, isAnimating]);

  return (
    <animated.div
      style={containerSpring}
      className="w-full p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">
          Spring Physics Array Visualization
        </h3>

        <div className="flex gap-3 mb-4">
          <button
            onClick={generateArray}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Generate Array
          </button>

          <button
            onClick={shuffleArray}
            disabled={isAnimating}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Shuffle
          </button>

          <button
            onClick={animatedBubbleSort}
            disabled={isAnimating}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isAnimating ? "Sorting..." : "Bubble Sort"}
          </button>
        </div>
      </div>

      <SpringArray
        array={array}
        highlights={highlights}
        className="bg-gray-50 rounded-lg p-4"
      />

      <div className="mt-4 text-sm text-gray-600">
        {isAnimating &&
          "Watch the physics-based animations as elements bounce and settle!"}
        {!isAnimating &&
          "Click buttons to see spring-physics animations in action"}
      </div>
    </animated.div>
  );
};
