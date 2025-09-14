import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export type ComplexityData = {
  time: { best: string; average: string; worst: string };
  space: string;
  stable?: boolean;
  inPlace?: boolean;
};

type ComplexityExplorerProps = {
  complexity: ComplexityData;
  algorithmName: string;
  className?: string;
};

// Convert Big O notation to mathematical functions for visualization
const complexityToFunction = (notation: string) => {
  const n = (x: number) => x;
  const logN = (x: number) => Math.log2(Math.max(x, 1));

  switch (notation.toLowerCase()) {
    case "o(1)":
      return () => 1;
    case "o(log n)":
      return logN;
    case "o(n)":
      return n;
    case "o(n log n)":
      return (x: number) => x * logN(x);
    case "o(n²)":
    case "o(n^2)":
      return (x: number) => x * x;
    case "o(n³)":
    case "o(n^3)":
      return (x: number) => x * x * x;
    case "o(2^n)":
      return (x: number) => Math.pow(2, Math.min(x, 20)); // Cap exponential for visualization
    case "o(n!)":
      return (x: number) => {
        if (x <= 1) return 1;
        if (x > 10) return Infinity; // Cap factorial for visualization
        let result = 1;
        for (let i = 2; i <= x; i++) result *= i;
        return result;
      };
    default:
      return n; // Default to linear
  }
};

const getComplexityColor = (notation: string) => {
  switch (notation.toLowerCase()) {
    case "o(1)":
      return "#10b981"; // green
    case "o(log n)":
      return "#06b6d4"; // cyan
    case "o(n)":
      return "#3b82f6"; // blue
    case "o(n log n)":
      return "#8b5cf6"; // purple
    case "o(n²)":
      return "#f59e0b"; // amber
    case "o(n^2)":
      return "#f59e0b"; // amber
    case "o(n³)":
      return "#ef4444"; // red
    case "o(n^3)":
      return "#ef4444"; // red
    case "o(2^n)":
      return "#dc2626"; // dark red
    case "o(n!)":
      return "#7f1d1d"; // very dark red
    default:
      return "#6b7280"; // gray
  }
};

const getComplexityDescription = (notation: string) => {
  switch (notation.toLowerCase()) {
    case "o(1)":
      return "Constant - Excellent performance regardless of input size";
    case "o(log n)":
      return "Logarithmic - Very good performance, scales well";
    case "o(n)":
      return "Linear - Good performance, proportional to input size";
    case "o(n log n)":
      return "Linearithmic - Acceptable for most applications";
    case "o(n²)":
    case "o(n^2)":
      return "Quadratic - Poor performance for large inputs";
    case "o(n³)":
    case "o(n^3)":
      return "Cubic - Very poor performance, avoid for large inputs";
    case "o(2^n)":
      return "Exponential - Extremely poor performance";
    case "o(n!)":
      return "Factorial - Worst possible performance";
    default:
      return "Performance varies with implementation";
  }
};

// Mini sparkline component using SVG
const MiniChart: React.FC<{
  data: number[];
  color: string;
  width?: number;
  height?: number;
}> = ({ data, color, width = 100, height = 30 }) => {
  const max = Math.max(...data.filter(isFinite));
  const min = Math.min(...data.filter(isFinite));
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${isFinite(y) ? y : height}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
};

export default function ComplexityExplorer({
  complexity,
  algorithmName,
  className = "",
}: ComplexityExplorerProps) {
  const [scale, setScale] = useState<"small" | "medium" | "large">("medium");
  const [showComparison, setShowComparison] = useState(false);

  const maxN = useMemo(() => {
    switch (scale) {
      case "small":
        return 100;
      case "medium":
        return 1000;
      case "large":
        return 10000;
      default:
        return 1000;
    }
  }, [scale]);

  const sampleData = useMemo(() => {
    const points = [];
    const step = Math.max(1, Math.floor(maxN / 20)); // Generate 20 data points

    for (let i = 1; i <= maxN; i += step) {
      points.push(i);
    }

    return points;
  }, [maxN]);

  const complexityData = useMemo(() => {
    const bestFn = complexityToFunction(complexity.time.best);
    const avgFn = complexityToFunction(complexity.time.average);
    const worstFn = complexityToFunction(complexity.time.worst);

    // Chart data for recharts
    const chartData = sampleData
      .map((n) => {
        const best = bestFn(n);
        const average = avgFn(n);
        const worst = worstFn(n);

        return {
          n,
          best: isFinite(best) ? best : null,
          average: isFinite(average) ? average : null,
          worst: isFinite(worst) ? worst : null,
        };
      })
      .filter(
        (point) =>
          point.best !== null || point.average !== null || point.worst !== null
      );

    return {
      best: sampleData.map(bestFn),
      average: sampleData.map(avgFn),
      worst: sampleData.map(worstFn),
      chartData,
    };
  }, [complexity, sampleData]);

  const commonComplexities = useMemo(() => {
    const functions = {
      "O(1)": (_x: number) => 1,
      "O(log n)": (x: number) => Math.log2(Math.max(x, 1)),
      "O(n)": (x: number) => x,
      "O(n log n)": (x: number) => x * Math.log2(Math.max(x, 1)),
      "O(n²)": (x: number) => x * x,
    };

    // For simple mini charts
    const simple = Object.fromEntries(
      Object.entries(functions).map(([name, fn]) => [name, sampleData.map(fn)])
    );

    // For recharts - ensure all values are finite and positive for log scale
    const chartData = sampleData.map((n) => {
      const values = {
        n,
        O1: functions["O(1)"](n),
        Ologn: functions["O(log n)"](n),
        On: functions["O(n)"](n),
        Onlogn: functions["O(n log n)"](n),
        On2: functions["O(n²)"](n),
      };

      // Ensure all values are finite and positive for log scale
      return Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          key === "n" ? value : Math.max(0.1, isFinite(value) ? value : 0.1),
        ])
      );
    });

    return { simple, chartData };
  }, [sampleData]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Complexity Analysis
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {algorithmName} performance characteristics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showComparison ? "primary" : "secondary"}
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs"
          >
            {showComparison ? "Hide" : "Show"} Comparison
          </Button>
        </div>
      </div>

      {/* Scale Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Input Scale (n):
          </label>
          <div className="flex items-center gap-2">
            {[
              { key: "small", label: "Small (≤100)", value: "small" },
              { key: "medium", label: "Medium (≤1K)", value: "medium" },
              { key: "large", label: "Large (≤10K)", value: "large" },
            ].map(({ key, label, value }) => (
              <Button
                key={key}
                size="sm"
                variant={scale === value ? "primary" : "secondary"}
                onClick={() => setScale(value as typeof scale)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Algorithm Complexity Visualization */}
      <Card className="p-6">
        <div className="mb-6">
          <h4 className="mb-2 font-medium text-slate-900 dark:text-slate-100">
            Time Complexity: {algorithmName}
          </h4>
        </div>

        {/* Interactive Chart */}
        <div className="mb-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={complexityData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="n"
                label={{
                  value: "Input Size (n)",
                  position: "insideBottom",
                  offset: -5,
                }}
                stroke="#64748b"
              />
              <YAxis
                label={{
                  value: "Operations",
                  angle: -90,
                  position: "insideLeft",
                }}
                scale="log"
                domain={["dataMin", "dataMax"]}
                stroke="#64748b"
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value?.toExponential(2) || "N/A",
                  name,
                ]}
                labelStyle={{ color: "#1e293b" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />

              {complexity.time.best !== complexity.time.average && (
                <Line
                  type="monotone"
                  dataKey="best"
                  stroke={getComplexityColor(complexity.time.best)}
                  strokeWidth={2}
                  dot={false}
                  name={`Best: ${complexity.time.best}`}
                />
              )}

              <Line
                type="monotone"
                dataKey="average"
                stroke={getComplexityColor(complexity.time.average)}
                strokeWidth={3}
                dot={false}
                name={`Average: ${complexity.time.average}`}
              />

              {complexity.time.worst !== complexity.time.average && (
                <Line
                  type="monotone"
                  dataKey="worst"
                  stroke={getComplexityColor(complexity.time.worst)}
                  strokeWidth={2}
                  dot={false}
                  name={`Worst: ${complexity.time.worst}`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {/* Best Case */}
          {complexity.time.best !== complexity.time.average && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: getComplexityColor(complexity.time.best),
                  }}
                />
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Best Case: {complexity.time.best}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {getComplexityDescription(complexity.time.best)}
                  </div>
                </div>
              </div>
              <MiniChart
                data={complexityData.best}
                color={getComplexityColor(complexity.time.best)}
              />
            </div>
          )}

          {/* Average Case */}
          <div className="border-primary-200 dark:border-primary-700 flex items-center justify-between rounded-lg border-2 bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor: getComplexityColor(complexity.time.average),
                }}
              />
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  Average Case: {complexity.time.average}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {getComplexityDescription(complexity.time.average)}
                </div>
              </div>
            </div>
            <MiniChart
              data={complexityData.average}
              color={getComplexityColor(complexity.time.average)}
            />
          </div>

          {/* Worst Case */}
          {complexity.time.worst !== complexity.time.average && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: getComplexityColor(complexity.time.worst),
                  }}
                />
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Worst Case: {complexity.time.worst}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {getComplexityDescription(complexity.time.worst)}
                  </div>
                </div>
              </div>
              <MiniChart
                data={complexityData.worst}
                color={getComplexityColor(complexity.time.worst)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Comparison Chart */}
      {showComparison && (
        <Card className="p-6">
          <div className="mb-4">
            <h4 className="mb-2 font-medium text-slate-900 dark:text-slate-100">
              Common Complexity Comparison
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              See how different complexities scale with input size (n = 1 to{" "}
              {maxN.toLocaleString()})
            </p>
          </div>

          <div className="mb-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={commonComplexities.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="n"
                  label={{
                    value: "Input Size (n)",
                    position: "insideBottom",
                    offset: -5,
                  }}
                  stroke="#64748b"
                />
                <YAxis
                  label={{
                    value: "Operations",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  scale="log"
                  domain={[0.1, "dataMax"]}
                  stroke="#64748b"
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value?.toExponential(2) || "N/A",
                    name,
                  ]}
                  labelStyle={{ color: "#1e293b" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="O1"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="O(1)"
                />
                <Line
                  type="monotone"
                  dataKey="Ologn"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="O(log n)"
                />
                <Line
                  type="monotone"
                  dataKey="On"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="O(n)"
                />
                <Line
                  type="monotone"
                  dataKey="Onlogn"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="O(n log n)"
                />
                <Line
                  type="monotone"
                  dataKey="On2"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="O(n²)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {Object.entries(commonComplexities.simple).map(([name, data]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: getComplexityColor(name) }}
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {getComplexityDescription(name)}
                    </div>
                  </div>
                </div>
                <MiniChart
                  data={data}
                  color={getComplexityColor(name)}
                  width={120}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Additional Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <h4 className="mb-3 font-medium text-slate-900 dark:text-slate-100">
            Space Complexity
          </h4>
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: getComplexityColor(complexity.space) }}
            />
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {complexity.space}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {getComplexityDescription(complexity.space)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="mb-3 font-medium text-slate-900 dark:text-slate-100">
            Algorithm Properties
          </h4>
          <div className="space-y-2 text-sm">
            {complexity.stable !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Stable:
                </span>
                <span
                  className={`font-medium ${complexity.stable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {complexity.stable ? "Yes" : "No"}
                </span>
              </div>
            )}
            {complexity.inPlace !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  In-place:
                </span>
                <span
                  className={`font-medium ${complexity.inPlace ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {complexity.inPlace ? "Yes" : "No"}
                </span>
              </div>
            )}
            {complexity.stable === undefined &&
              complexity.inPlace === undefined && (
                <div className="text-slate-500 italic dark:text-slate-400">
                  No additional properties defined
                </div>
              )}
          </div>
        </Card>
      </div>
    </div>
  );
}
