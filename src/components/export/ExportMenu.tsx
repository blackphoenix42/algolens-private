/**
 * Export Menu Component
 * Provides UI for exporting visualizations in various formats
 */

import { Code, Download, FileText, Film, Image, Settings } from "lucide-react";
import React, { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useExport } from "@/services/export";

interface ExportMenuProps {
  targetElement?: HTMLElement | null;
  algorithm?: string;
  className?: string;
}

export function ExportMenu({
  targetElement,
  algorithm,
  className,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    "png" | "svg" | "pdf" | "gif" | "mp4" | "code"
  >("png");
  const [exportOptions, setExportOptions] = useState({
    quality: 2,
    includeUI: false,
    watermark: true,
    width: undefined as number | undefined,
    height: undefined as number | undefined,
  });

  const menuRef = useRef<HTMLDivElement | null>(null);
  const {
    exportImage,
    exportSVG,
    exportPDF,
    exportGIF,
    startVideoRecording,
    exportAlgorithmCode,
  } = useExport();

  const handleExport = async () => {
    if (!targetElement && exportFormat !== "code") {
      alert("No target element specified for export");
      return;
    }

    setIsExporting(true);

    try {
      let result;

      switch (exportFormat) {
        case "png":
          result = await exportImage(targetElement!, {
            format: "png",
            quality: exportOptions.quality,
            width: exportOptions.width,
            height: exportOptions.height,
            watermark: exportOptions.watermark,
          });
          break;

        case "svg":
          result = await exportSVG(targetElement!, {
            format: "svg",
            watermark: exportOptions.watermark,
          });
          break;

        case "pdf":
          result = await exportPDF(targetElement!, {
            format: "pdf",
            watermark: exportOptions.watermark,
          });
          break;

        case "gif":
          result = await exportGIF(targetElement!, {
            format: "gif",
            fps: 10,
            duration: 5,
          });
          break;

        case "mp4":
          if (targetElement) {
            const recorder = await startVideoRecording(targetElement, {
              format: "mp4",
              fps: 30,
            });

            // Start recording for 10 seconds
            setTimeout(async () => {
              result = await recorder.stopRecording();
              setIsExporting(false);

              if (result.success) {
                alert("Video exported successfully!");
              } else {
                alert(`Export failed: ${result.error}`);
              }
            }, 10000);

            alert("Recording started! Recording for 10 seconds...");
            return;
          }
          break;

        case "code":
          if (algorithm) {
            result = await exportAlgorithmCode(algorithm, "javascript");
          } else {
            alert("No algorithm specified for code export");
            return;
          }
          break;

        default:
          alert("Unsupported export format");
          return;
      }

      if (result) {
        if (result.success) {
          alert(`Export successful! File: ${result.filename}`);
        } else {
          alert(`Export failed: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export"}
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 z-50 mt-2 w-80 bg-white p-4 shadow-lg dark:bg-gray-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Export Options
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setExportFormat("png")}
                  className={`rounded border p-2 text-center text-xs ${
                    exportFormat === "png"
                      ? "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Image className="mx-auto mb-1 h-4 w-4" />
                  PNG
                </button>
                <button
                  onClick={() => setExportFormat("svg")}
                  className={`rounded border p-2 text-center text-xs ${
                    exportFormat === "svg"
                      ? "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  <FileText className="mx-auto mb-1 h-4 w-4" />
                  SVG
                </button>
                <button
                  onClick={() => setExportFormat("pdf")}
                  className={`rounded border p-2 text-center text-xs ${
                    exportFormat === "pdf"
                      ? "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  <FileText className="mx-auto mb-1 h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={() => setExportFormat("gif")}
                  className={`rounded border p-2 text-center text-xs ${
                    exportFormat === "gif"
                      ? "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Film className="mx-auto mb-1 h-4 w-4" />
                  GIF
                </button>
                <button
                  onClick={() => setExportFormat("mp4")}
                  className={`rounded border p-2 text-center text-xs ${
                    exportFormat === "mp4"
                      ? "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Film className="mx-auto mb-1 h-4 w-4" />
                  MP4
                </button>
                <button
                  onClick={() => setExportFormat("code")}
                  className={`rounded border p-2 text-center text-xs ${
                    exportFormat === "code"
                      ? "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Code className="mx-auto mb-1 h-4 w-4" />
                  Code
                </button>
              </div>
            </div>

            {/* Export Options */}
            {exportFormat !== "code" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Options
                  </span>
                </div>

                {(exportFormat === "png" || exportFormat === "pdf") && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Quality (Scale Factor)
                    </label>
                    <select
                      value={exportOptions.quality}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          quality: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                      title="Select export quality"
                      aria-label="Export quality scale factor"
                    >
                      <option value={1}>1x (Standard)</option>
                      <option value={2}>2x (High)</option>
                      <option value={3}>3x (Ultra)</option>
                      <option value={4}>4x (Maximum)</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="watermark"
                    checked={exportOptions.watermark}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        watermark: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <label
                    htmlFor="watermark"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Include watermark
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeUI"
                    checked={exportOptions.includeUI}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeUI: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <label
                    htmlFor="includeUI"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Include UI elements
                  </label>
                </div>
              </div>
            )}

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={
                isExporting || (!targetElement && exportFormat !== "code")
              }
              className="w-full"
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Exporting...
                </div>
              ) : (
                `Export as ${exportFormat.toUpperCase()}`
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// Export button for quick access
export function QuickExportButton({
  targetElement,
  algorithm,
  format = "png",
  className,
}: {
  targetElement?: HTMLElement | null;
  algorithm?: string;
  format?: "png" | "svg" | "pdf" | "gif" | "mp4" | "code";
  className?: string;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const {
    exportImage,
    exportSVG,
    exportPDF,
    exportGIF,
    startVideoRecording,
    exportAlgorithmCode,
  } = useExport();

  const handleQuickExport = async () => {
    if (!targetElement && format !== "code") return;

    setIsExporting(true);

    try {
      let result;

      switch (format) {
        case "png":
          result = await exportImage(targetElement!, {
            format: "png",
            quality: 2,
          });
          break;
        case "svg":
          result = await exportSVG(targetElement!, { format: "svg" });
          break;
        case "pdf":
          result = await exportPDF(targetElement!, { format: "pdf" });
          break;
        case "gif":
          result = await exportGIF(targetElement!, {
            format: "gif",
            fps: 10,
            duration: 5,
          });
          break;
        case "mp4":
          if (targetElement) {
            const recorder = await startVideoRecording(targetElement, {
              format: "mp4",
              fps: 30,
            });
            setTimeout(async () => {
              await recorder.stopRecording();
              setIsExporting(false);
            }, 10000);
            return;
          }
          break;
        case "code":
          if (algorithm) {
            result = await exportAlgorithmCode(algorithm, "javascript");
          }
          break;
      }

      if (result?.success) {
        // Show success notification
        console.log("Export successful:", result.filename);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleQuickExport}
      disabled={isExporting}
      className={className}
      title={`Export as ${format.toUpperCase()}`}
    >
      {isExporting ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
