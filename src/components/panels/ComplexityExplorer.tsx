import {
  BarChart3,
  TrendingUp,
  Clock,
  MemoryStick,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

interface ComplexityExplorerProps {
  algorithmName: string;
  theoreticalTimeComplexity: string; // e.g., "O(n log n)"
  theoreticalSpaceComplexity: string; // e.g., "O(n)"
  onArraySizeChange: (size: number) => void;
  currentArraySize: number;
  isRunning?: boolean;
}

const complexityFunctions = {
  "O(1)": () => 1,
  "O(log n)": (n: number) => Math.log2(n),
  "O(n)": (n: number) => n,
  "O(n log n)": (n: number) => n * Math.log2(n),
  "O(n²)": (n: number) => n * n,
  "O(n³)": (n: number) => n * n * n,
  "O(2^n)": (n: number) => Math.pow(2, Math.min(n, 20)), // Cap for visualization
  "O(n!)": (n: number) => {
    if (n > 10) return Math.pow(10, 6); // Cap factorial for visualization
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  },
};

export function ComplexityExplorer({
  algorithmName,
  theoreticalTimeComplexity,
  theoreticalSpaceComplexity,
  onArraySizeChange,
  currentArraySize,
  isRunning = false,
}: ComplexityExplorerProps) {
  const [selectedSizes, setSelectedSizes] = useState([10, 50, 100, 500, 1000]);
  const [viewMode, setViewMode] = useState<"linear" | "log">("linear");
  const [showEmpirical, setShowEmpirical] = useState(true);
  const [showSpace, setShowSpace] = useState(false);

  // Generate complexity data
  const complexityData = useMemo(() => {
    const timeFunc =
      complexityFunctions[
        theoreticalTimeComplexity as keyof typeof complexityFunctions
      ] || complexityFunctions["O(n)"];
    const spaceFunc =
      complexityFunctions[
        theoreticalSpaceComplexity as keyof typeof complexityFunctions
      ] || complexityFunctions["O(1)"];

    return selectedSizes.map((n) => {
      // Add some noise to empirical data to simulate real-world performance
      const timeNoise = 1 + (Math.random() - 0.5) * 0.3;
      const spaceNoise = 1 + (Math.random() - 0.5) * 0.2;

      return {
        n,
        timeComplexity: timeFunc(n),
        spaceComplexity: spaceFunc(n),
        empiricalTime: timeFunc(n) * timeNoise,
        empiricalSpace: spaceFunc(n) * spaceNoise,
      };
    });
  }, [selectedSizes, theoreticalTimeComplexity, theoreticalSpaceComplexity]);

  const maxValue = useMemo(() => {
    const values = complexityData.flatMap((d) => [
      showSpace ? d.spaceComplexity : d.timeComplexity,
      showEmpirical ? (showSpace ? d.empiricalSpace : d.empiricalTime) : 0,
    ]);
    return Math.max(...values);
  }, [complexityData, showSpace, showEmpirical]);

  const getYValue = useCallback(
    (value: number) => {
      if (viewMode === "log") {
        return Math.log10(Math.max(value, 1));
      }
      return value;
    },
    [viewMode]
  );

  const getDisplayValue = useCallback((value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
  }, []);

  const addCustomSize = useCallback(() => {
    const size = prompt("Enter array size (1-10000):");
    if (size && !isNaN(Number(size))) {
      const newSize = Math.max(1, Math.min(10000, Number(size)));
      setSelectedSizes((prev) => [...prev, newSize].sort((a, b) => a - b));
    }
  }, []);

  const removeSize = useCallback((size: number) => {
    setSelectedSizes((prev) => prev.filter((s) => s !== size));
  }, []);

  return (
    <Card className="w-full bg-white dark:bg-slate-900 shadow-lg">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Complexity Explorer
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setViewMode(viewMode === "linear" ? "log" : "linear")
              }
              className="flex items-center gap-2"
            >
              {viewMode === "linear" ? <ToggleLeft /> : <ToggleRight />}
              {viewMode === "linear" ? "Linear" : "Log"} Scale
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Algorithm Info */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {algorithmName} Complexity
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600 dark:text-slate-400">Time:</span>
              <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded border text-slate-900 dark:text-slate-100">
                {theoreticalTimeComplexity}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <MemoryStick className="w-4 h-4 text-green-600" />
              <span className="text-slate-600 dark:text-slate-400">Space:</span>
              <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded border text-slate-900 dark:text-slate-100">
                {theoreticalSpaceComplexity}
              </code>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={showSpace ? "outline" : "primary"}
              size="sm"
              onClick={() => setShowSpace(false)}
            >
              <Clock className="w-4 h-4 mr-2" />
              Time Complexity
            </Button>
            <Button
              variant={showSpace ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowSpace(true)}
            >
              <MemoryStick className="w-4 h-4 mr-2" />
              Space Complexity
            </Button>
            <Button
              variant={showEmpirical ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowEmpirical(!showEmpirical)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Show Empirical
            </Button>
          </div>

          {/* Array Sizes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Array Sizes to Compare
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedSizes.map((size) => (
                <div
                  key={size}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-lg border",
                    size === currentArraySize
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  <button
                    onClick={() => onArraySizeChange(size)}
                    className="text-sm font-medium hover:text-primary-600"
                    disabled={isRunning}
                  >
                    n={size}
                  </button>
                  {selectedSizes.length > 2 && (
                    <button
                      onClick={() => removeSize(size)}
                      className="text-red-500 hover:text-red-700 ml-1"
                      disabled={isRunning}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomSize}
                disabled={isRunning || selectedSizes.length >= 10}
              >
                + Add Size
              </Button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <line
                    x1="50"
                    y1={40 + i * 30}
                    x2="380"
                    y2={40 + i * 30}
                    stroke="rgb(226, 232, 240)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <line
                    x1={50 + i * 82.5}
                    y1="40"
                    x2={50 + i * 82.5}
                    y2="160"
                    stroke="rgb(226, 232, 240)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                </g>
              ))}

              {/* Data points and lines */}
              {complexityData.length > 1 && (
                <>
                  {/* Theoretical line */}
                  <polyline
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                    points={complexityData
                      .map((d, i) => {
                        const x = 50 + (i / (complexityData.length - 1)) * 330;
                        const value = showSpace
                          ? d.spaceComplexity
                          : d.timeComplexity;
                        const normalizedValue =
                          getYValue(value) / getYValue(maxValue);
                        const y = 160 - normalizedValue * 120;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {/* Empirical line */}
                  {showEmpirical && (
                    <polyline
                      fill="none"
                      stroke="rgb(239, 68, 68)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      points={complexityData
                        .map((d, i) => {
                          const x =
                            50 + (i / (complexityData.length - 1)) * 330;
                          const value = showSpace
                            ? d.empiricalSpace
                            : d.empiricalTime;
                          const normalizedValue =
                            getYValue(value) / getYValue(maxValue);
                          const y = 160 - normalizedValue * 120;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  )}
                </>
              )}

              {/* Data points */}
              {complexityData.map((d, i) => {
                const x =
                  50 + (i / Math.max(complexityData.length - 1, 1)) * 330;
                const theoreticalValue = showSpace
                  ? d.spaceComplexity
                  : d.timeComplexity;
                const empiricalValue = showSpace
                  ? d.empiricalSpace
                  : d.empiricalTime;

                const theoreticalY =
                  160 -
                  (getYValue(theoreticalValue) / getYValue(maxValue)) * 120;
                const empiricalY =
                  160 - (getYValue(empiricalValue) / getYValue(maxValue)) * 120;

                return (
                  <g key={i}>
                    {/* Theoretical point */}
                    <circle
                      cx={x}
                      cy={theoreticalY}
                      r="4"
                      fill="rgb(59, 130, 246)"
                      className={cn(
                        "transition-all cursor-pointer",
                        d.n === currentArraySize && "r-6 stroke-2 stroke-white"
                      )}
                      onClick={() => onArraySizeChange(d.n)}
                    />

                    {/* Empirical point */}
                    {showEmpirical && (
                      <circle
                        cx={x}
                        cy={empiricalY}
                        r="4"
                        fill="rgb(239, 68, 68)"
                        className="transition-all cursor-pointer"
                        onClick={() => onArraySizeChange(d.n)}
                      />
                    )}

                    {/* X-axis labels */}
                    <text
                      x={x}
                      y="180"
                      textAnchor="middle"
                      className="text-xs fill-slate-600 dark:fill-slate-400"
                    >
                      {d.n}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = 160 - ratio * 120;
                const value = getYValue(maxValue) * ratio;
                return (
                  <text
                    key={i}
                    x="40"
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-slate-600 dark:fill-slate-400"
                  >
                    {viewMode === "log"
                      ? `10^${value.toFixed(1)}`
                      : getDisplayValue(value)}
                  </text>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-800 rounded border p-2 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Theoretical</span>
              </div>
              {showEmpirical && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-red-500 border-dashed border-t"></div>
                  <span>Empirical</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Performance Insights
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Click any point to set that array size</li>
                <li>
                  • Toggle between linear and logarithmic scale for better
                  visibility
                </li>
                <li>• Compare theoretical vs empirical performance</li>
                <li>• Add custom array sizes to test edge cases</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ComplexityExplorer;
