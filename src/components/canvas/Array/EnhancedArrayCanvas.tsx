import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useCallback, useEffect } from "react";

import { MotionArray } from "./MotionArray";

interface EnhancedArrayCanvasProps {
  array: number[];
  highlights?: {
    compared?: [number, number];
    swapped?: [number, number];
    pivot?: number;
    indices?: number[];
  };
  onReorder?: (next: number[]) => void;
  height?: number | string;
  className?: string;
  animationSpeed?: "slow" | "medium" | "fast";
  colorMode?: "plain" | "rainbow" | "value";
  showLabels?: boolean;
  enableInteraction?: boolean;
}

const animationSpeeds = {
  slow: 1000,
  medium: 500,
  fast: 250,
};

export default function EnhancedArrayCanvas({
  array,
  highlights = {},
  onReorder,
  height = 400,
  className = "",
  animationSpeed = "medium",
  colorMode = "plain",
  showLabels = true,
  enableInteraction = false,
}: EnhancedArrayCanvasProps) {
  const [localArray, setLocalArray] = useState(array);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedBars, setSelectedBars] = useState<number[]>([]);

  // Update local array when prop changes
  useEffect(() => {
    setLocalArray(array);
  }, [array]);

  // Handle bar click for interaction
  const handleBarClick = useCallback(
    (index: number, _value: number) => {
      if (!enableInteraction || isAnimating) return;

      if (selectedBars.length === 0) {
        setSelectedBars([index]);
      } else if (selectedBars.length === 1 && selectedBars[0] !== index) {
        // Swap the two selected bars with animation
        const [firstIndex] = selectedBars;
        const newArray = [...localArray];
        [newArray[firstIndex], newArray[index]] = [
          newArray[index],
          newArray[firstIndex],
        ];

        setIsAnimating(true);
        setLocalArray(newArray);
        onReorder?.(newArray);

        // Reset selection after animation
        setTimeout(() => {
          setSelectedBars([]);
          setIsAnimating(false);
        }, animationSpeeds[animationSpeed]);
      } else {
        setSelectedBars([]);
      }
    },
    [
      enableInteraction,
      isAnimating,
      selectedBars,
      localArray,
      onReorder,
      animationSpeed,
    ]
  );

  // Generate random array
  const generateRandomArray = useCallback(() => {
    if (isAnimating) return;

    const length = Math.floor(Math.random() * 10) + 8; // 8-18 elements
    const newArray = Array.from(
      { length },
      () => Math.floor(Math.random() * 100) + 1
    );
    setLocalArray(newArray);
    onReorder?.(newArray);
    setSelectedBars([]);
  }, [isAnimating, onReorder]);

  // Shuffle array
  const shuffleArray = useCallback(() => {
    if (isAnimating) return;

    const newArray = [...localArray].sort(() => Math.random() - 0.5);
    setLocalArray(newArray);
    onReorder?.(newArray);
    setSelectedBars([]);
  }, [isAnimating, localArray, onReorder]);

  // Sort array (for demo purposes)
  const sortArray = useCallback(() => {
    if (isAnimating) return;

    const newArray = [...localArray].sort((a, b) => a - b);
    setLocalArray(newArray);
    onReorder?.(newArray);
    setSelectedBars([]);
  }, [isAnimating, localArray, onReorder]);

  // Enhanced highlights that include selected bars
  const enhancedHighlights = {
    ...highlights,
    indices: [...(highlights.indices || []), ...selectedBars],
  };

  return (
    <motion.div
      className={`w-full bg-white rounded-lg border shadow-sm ${className}`}
      style={{ height }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Control Panel */}
      <motion.div
        className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border-b rounded-t-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Array Size:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            {localArray.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Selected:</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
            {selectedBars.length > 0 ? selectedBars.join(", ") : "None"}
          </span>
        </div>

        <div className="flex gap-2 ml-auto">
          <motion.button
            onClick={generateRandomArray}
            disabled={isAnimating}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Random
          </motion.button>

          <motion.button
            onClick={shuffleArray}
            disabled={isAnimating}
            className="px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Shuffle
          </motion.button>

          <motion.button
            onClick={sortArray}
            disabled={isAnimating}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sort
          </motion.button>
        </div>
      </motion.div>

      {/* Array Visualization */}
      <div className="flex-1 p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <MotionArray
            key={localArray.join(",")}
            array={localArray}
            highlights={enhancedHighlights}
            onBarClick={enableInteraction ? handleBarClick : undefined}
            showLabels={showLabels}
            colorMode={colorMode}
            className="w-full h-full"
          />
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <motion.div
        className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t text-xs text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <span>Min: {Math.min(...localArray)}</span>
          <span>Max: {Math.max(...localArray)}</span>
          <span>
            Avg:{" "}
            {Math.round(
              localArray.reduce((a, b) => a + b, 0) / localArray.length
            )}
          </span>
        </div>

        {enableInteraction && (
          <div className="text-gray-500">
            {selectedBars.length === 0 && "Click bars to select"}
            {selectedBars.length === 1 && "Click another bar to swap"}
            {selectedBars.length === 2 && "Swapping..."}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
