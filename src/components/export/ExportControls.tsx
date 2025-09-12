import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { log } from "@/services/monitoring";

type ExportFormat = "png" | "svg" | "gif" | "mp4";

interface ExportAnimationFrame {
  canvas?: HTMLCanvasElement;
  timestamp?: number;
  data?: unknown;
}

interface ExportControlsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | SVGSVGElement>;
  animationFrames?: ExportAnimationFrame[]; // For GIF/MP4 export
  algorithmName: string;
  className?: string;
}

export default function ExportControls({
  canvasRef,
  animationFrames = [],
  algorithmName,
  className = "",
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportAsPNG = useCallback(async () => {
    if (!canvasRef.current) {
      toast.error("No visualization to export");
      return;
    }

    try {
      setIsExporting(true);
      log.user.action("Export PNG", { algorithm: algorithmName });

      let canvas: HTMLCanvasElement;

      if (canvasRef.current instanceof HTMLCanvasElement) {
        canvas = canvasRef.current;
      } else if (canvasRef.current instanceof SVGSVGElement) {
        // Convert SVG to Canvas
        const svg = canvasRef.current;
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width || 800;
            canvas.height = img.height || 600;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve(void 0);
          };
          img.onerror = reject;
          img.src = url;
        });

        URL.revokeObjectURL(url);
      } else {
        throw new Error("Unsupported element type for PNG export");
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const filename = `${algorithmName}-visualization-${new Date().toISOString().slice(0, 10)}.png`;
          downloadFile(blob, filename);
          toast.success("PNG exported successfully!");
        } else {
          toast.error("Failed to export PNG");
        }
        setIsExporting(false);
      }, "image/png");
    } catch (error) {
      console.error("PNG export failed:", error);
      toast.error("Failed to export PNG");
      setIsExporting(false);
    }
  }, [canvasRef, algorithmName, downloadFile]);

  const exportAsSVG = useCallback(async () => {
    if (!canvasRef.current) {
      toast.error("No visualization to export");
      return;
    }

    try {
      setIsExporting(true);
      log.user.action("Export SVG", { algorithm: algorithmName });

      let svgElement: SVGSVGElement;

      if (canvasRef.current instanceof SVGSVGElement) {
        svgElement = canvasRef.current;
      } else if (canvasRef.current instanceof HTMLCanvasElement) {
        // Create SVG from canvas (basic implementation)
        const canvas = canvasRef.current;
        svgElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svgElement.setAttribute("width", canvas.width.toString());
        svgElement.setAttribute("height", canvas.height.toString());
        svgElement.setAttribute(
          "viewBox",
          `0 0 ${canvas.width} ${canvas.height}`
        );

        // Convert canvas to image and embed in SVG
        const image = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
        );
        image.setAttribute("width", canvas.width.toString());
        image.setAttribute("height", canvas.height.toString());
        image.setAttribute("href", canvas.toDataURL());
        svgElement.appendChild(image);
      } else {
        throw new Error("Unsupported element type for SVG export");
      }

      // Clone and clean up the SVG
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Ensure proper namespace
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });

      const filename = `${algorithmName}-visualization-${new Date().toISOString().slice(0, 10)}.svg`;
      downloadFile(blob, filename);
      toast.success("SVG exported successfully!");
    } catch (error) {
      console.error("SVG export failed:", error);
      toast.error("Failed to export SVG");
    }

    setIsExporting(false);
  }, [canvasRef, algorithmName, downloadFile]);

  const exportAsGIF = useCallback(async () => {
    if (!animationFrames.length) {
      toast.error("No animation frames available for GIF export");
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      log.user.action("Export GIF", {
        algorithm: algorithmName,
        frameCount: animationFrames.length,
      });

      // For now, show a placeholder implementation
      // Real GIF creation would require a library like gif.js
      toast.info(
        "GIF export is not yet implemented. This would create an animated GIF from the algorithm frames."
      );

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      toast.warning("GIF export feature coming soon!");
    } catch (error) {
      console.error("GIF export failed:", error);
      toast.error("Failed to export GIF");
    }

    setIsExporting(false);
    setExportProgress(0);
  }, [animationFrames, algorithmName]);

  const exportAsMP4 = useCallback(async () => {
    if (!animationFrames.length) {
      toast.error("No animation frames available for MP4 export");
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      log.user.action("Export MP4", {
        algorithm: algorithmName,
        frameCount: animationFrames.length,
      });

      // For now, show a placeholder implementation
      // Real MP4 creation would require MediaRecorder API or a library
      toast.info(
        "MP4 export is not yet implemented. This would create a video from the algorithm animation."
      );

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      toast.warning("MP4 export feature coming soon!");
    } catch (error) {
      console.error("MP4 export failed:", error);
      toast.error("Failed to export MP4");
    }

    setIsExporting(false);
    setExportProgress(0);
  }, [animationFrames, algorithmName]);

  const exportHandlers = {
    png: exportAsPNG,
    svg: exportAsSVG,
    gif: exportAsGIF,
    mp4: exportAsMP4,
  };

  const formatInfo = {
    png: {
      name: "PNG Image",
      description: "High-quality raster image",
      icon: "🖼️",
      available: true,
    },
    svg: {
      name: "SVG Vector",
      description: "Scalable vector graphics",
      icon: "📐",
      available: true,
    },
    gif: {
      name: "Animated GIF",
      description: "Animated sequence",
      icon: "🎬",
      available: false, // Will be true when implemented
    },
    mp4: {
      name: "MP4 Video",
      description: "High-quality video",
      icon: "🎥",
      available: false, // Will be true when implemented
    },
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Export Visualization
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Save the current visualization in various formats
          </p>
        </div>

        {isExporting && exportProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exporting...</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`bg-primary-600 h-2 rounded-full transition-all duration-300`}
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(formatInfo).map(([format, info]) => (
            <Button
              key={format}
              variant={info.available ? "secondary" : "ghost"}
              onClick={
                info.available
                  ? exportHandlers[format as ExportFormat]
                  : undefined
              }
              disabled={isExporting || !info.available}
              className="flex flex-col items-center gap-2 p-4 h-auto"
            >
              <span className="text-2xl">{info.icon}</span>
              <div className="text-center">
                <div className="font-medium text-sm">{info.name}</div>
                <div className="text-xs opacity-75">{info.description}</div>
                {!info.available && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Coming Soon
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>• PNG: Static image of current visualization state</p>
          <p>• SVG: Vector format that scales to any size</p>
          <p>• GIF: Animated sequence of the algorithm steps</p>
          <p>• MP4: High-quality video with customizable settings</p>
        </div>
      </div>
    </Card>
  );
}
