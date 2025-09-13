import Konva from "konva";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";

interface KonvaArrayProps {
  array: number[];
  highlights?: {
    compared?: [number, number];
    swapped?: [number, number];
    pivot?: number;
    indices?: number[];
  };
  onBarClick?: (index: number, value: number) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface BarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  value: number;
  index: number;
}

export const KonvaArray: React.FC<KonvaArrayProps> = ({
  array,
  highlights = {},
  onBarClick,
  width = 800,
  height = 400,
  className = "",
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [barConfigs, setBarConfigs] = useState<BarConfig[]>([]);

  const BAR_WIDTH = Math.min(40, (width - 100) / array.length);
  const BAR_SPACING = BAR_WIDTH + 10;
  const MAX_BAR_HEIGHT = height - 100;
  const START_X = 50;
  const START_Y = height - 50;

  const maxValue = Math.max(...array, 1);

  // Calculate bar configurations
  useEffect(() => {
    const configs: BarConfig[] = array.map((value, index) => {
      const barHeight = Math.max(10, (value / maxValue) * MAX_BAR_HEIGHT);

      let fillColor = "#3b82f6"; // Default blue

      if (highlights.pivot === index) {
        fillColor = "#8b5cf6"; // Purple for pivot
      } else if (highlights.swapped?.includes(index)) {
        fillColor = "#10b981"; // Green for swapped
      } else if (highlights.compared?.includes(index)) {
        fillColor = "#ef4444"; // Red for compared
      } else if (highlights.indices?.includes(index)) {
        fillColor = "#fbbf24"; // Yellow for highlighted
      }

      return {
        x: START_X + index * BAR_SPACING,
        y: START_Y - barHeight,
        width: BAR_WIDTH,
        height: barHeight,
        fill: fillColor,
        value,
        index,
      };
    });

    setBarConfigs(configs);
  }, [
    array,
    highlights,
    maxValue,
    BAR_WIDTH,
    BAR_SPACING,
    MAX_BAR_HEIGHT,
    START_X,
    START_Y,
  ]);

  // Animate bars when they change
  useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current;
      const layer = stage.findOne("Layer") as Konva.Layer;

      if (layer) {
        // Animate all bars
        barConfigs.forEach((config, index) => {
          const bar = layer.findOne(`#bar-${index}`) as Konva.Rect;
          const text = layer.findOne(`#text-${index}`) as Konva.Text;

          if (bar && text) {
            // Cancel any existing animations - Konva handles this automatically

            // Animate bar position and size
            const tween = new Konva.Tween({
              node: bar,
              duration: 0.5,
              easing: Konva.Easings.EaseOut,
              x: config.x,
              y: config.y,
              width: config.width,
              height: config.height,
              fill: config.fill,
            });

            // Animate text position
            const textTween = new Konva.Tween({
              node: text,
              duration: 0.5,
              easing: Konva.Easings.EaseOut,
              x: config.x + config.width / 2,
              y: config.y + config.height / 2,
            });

            tween.play();
            textTween.play();
          }
        });

        layer.batchDraw();
      }
    }
  }, [barConfigs]);

  const handleBarClick = useCallback(
    (index: number) => {
      const config = barConfigs[index];
      if (config && onBarClick) {
        onBarClick(config.index, config.value);

        // Add click animation
        if (stageRef.current) {
          const stage = stageRef.current;
          const layer = stage.findOne("Layer") as Konva.Layer;
          const bar = layer?.findOne(`#bar-${index}`) as Konva.Rect;

          if (bar) {
            const clickTween = new Konva.Tween({
              node: bar,
              duration: 0.2,
              scaleX: 1.1,
              scaleY: 1.1,
              yoyo: true,
              easing: Konva.Easings.ElasticEaseOut,
            });

            clickTween.play();
          }
        }
      }
    },
    [barConfigs, onBarClick]
  );

  return (
    <div className={className}>
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {/* Background grid */}
          {Array.from({ length: Math.ceil(width / 50) }, (_, i) => (
            <Line
              key={`grid-v-${i}`}
              points={[i * 50, 0, i * 50, height]}
              stroke="#e5e7eb"
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}

          {Array.from({ length: Math.ceil(height / 50) }, (_, i) => (
            <Line
              key={`grid-h-${i}`}
              points={[0, i * 50, width, i * 50]}
              stroke="#e5e7eb"
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}

          {/* X-axis */}
          <Line
            points={[
              START_X,
              START_Y,
              START_X + array.length * BAR_SPACING,
              START_Y,
            ]}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* Y-axis */}
          <Line
            points={[START_X, START_Y, START_X, START_Y - MAX_BAR_HEIGHT]}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* Bars and labels */}
          {barConfigs.map((config, index) => (
            <Group key={`bar-group-${index}`}>
              <Rect
                id={`bar-${index}`}
                x={config.x}
                y={config.y}
                width={config.width}
                height={config.height}
                fill={config.fill}
                stroke="#1f2937"
                strokeWidth={1}
                cornerRadius={2}
                shadowColor="black"
                shadowBlur={highlights.swapped?.includes(index) ? 10 : 2}
                shadowOpacity={highlights.swapped?.includes(index) ? 0.3 : 0.1}
                shadowOffset={{
                  x: highlights.swapped?.includes(index) ? 3 : 1,
                  y: highlights.swapped?.includes(index) ? 3 : 1,
                }}
                onClick={() => handleBarClick(index)}
                onTap={() => handleBarClick(index)}
                onMouseEnter={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) {
                    container.style.cursor = "pointer";
                  }
                }}
                onMouseLeave={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) {
                    container.style.cursor = "default";
                  }
                }}
              />

              {/* Value text */}
              <Text
                id={`text-${index}`}
                x={config.x + config.width / 2}
                y={config.y + config.height / 2}
                text={config.value.toString()}
                fontSize={Math.min(14, config.width / 3)}
                fill="white"
                align="center"
                verticalAlign="middle"
                offsetX={config.value.toString().length * 3}
                fontStyle="bold"
                shadowColor="black"
                shadowOffset={{ x: 1, y: 1 }}
                shadowOpacity={0.5}
              />

              {/* Index text */}
              <Text
                x={config.x + config.width / 2}
                y={START_Y + 10}
                text={index.toString()}
                fontSize={12}
                fill="#6b7280"
                align="center"
                offsetX={index.toString().length * 3}
              />
            </Group>
          ))}

          {/* Status indicators for comparisons */}
          {highlights.compared &&
            highlights.compared.map((index, i) => (
              <Rect
                key={`indicator-${i}`}
                x={START_X + index * BAR_SPACING + BAR_WIDTH / 2 - 5}
                y={START_Y - MAX_BAR_HEIGHT - 20}
                width={10}
                height={10}
                fill="#ef4444"
                cornerRadius={5}
              />
            ))}

          {/* Pivot indicator */}
          {highlights.pivot !== undefined && (
            <Rect
              x={START_X + highlights.pivot * BAR_SPACING + BAR_WIDTH / 2 - 8}
              y={START_Y - MAX_BAR_HEIGHT - 30}
              width={16}
              height={16}
              fill="#8b5cf6"
              cornerRadius={8}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

// High-performance pathfinding grid using Konva
export const KonvaPathfindingGrid: React.FC<{
  grid: number[][];
  width?: number;
  height?: number;
  onCellClick?: (row: number, col: number) => void;
  className?: string;
}> = ({ grid, width = 800, height = 600, onCellClick, className = "" }) => {
  const cellSize = Math.min(
    Math.floor(width / grid[0]?.length || 1),
    Math.floor(height / grid.length)
  );

  const getCellColor = (value: number) => {
    switch (value) {
      case 0:
        return "#ffffff"; // Empty
      case 1:
        return "#1f2937"; // Wall
      case 2:
        return "#10b981"; // Start
      case 3:
        return "#ef4444"; // End
      case 4:
        return "#fbbf24"; // Path
      case 5:
        return "#6366f1"; // Visited
      default:
        return "#e5e7eb";
    }
  };

  return (
    <div className={className}>
      <Stage width={width} height={height}>
        <Layer>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Rect
                key={`cell-${rowIndex}-${colIndex}`}
                x={colIndex * cellSize}
                y={rowIndex * cellSize}
                width={cellSize}
                height={cellSize}
                fill={getCellColor(cell)}
                stroke="#d1d5db"
                strokeWidth={0.5}
                onClick={() => onCellClick?.(rowIndex, colIndex)}
                onTap={() => onCellClick?.(rowIndex, colIndex)}
              />
            ))
          )}
        </Layer>
      </Stage>
    </div>
  );
};
