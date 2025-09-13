// src/components/debug/DebugPanel.tsx
import { useState, useEffect, useRef } from "react";

import { logger, LogLevel, LogCategory } from "@/services/monitoring";

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  const [logs, setLogs] = useState(() => logger.getLogs());
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<
    LogCategory | undefined
  >();
  const [autoScroll, setAutoScroll] = useState(true);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setLogs(logger.getLogs(selectedLevel, selectedCategory));
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, selectedLevel, selectedCategory]);

  // Sort logs in descending order (newest first) and take last 100
  const filteredLogs = logs.slice().reverse().slice(0, 100);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return "text-red-500";
      case LogLevel.WARN:
        return "text-yellow-500";
      case LogLevel.INFO:
        return "text-blue-500";
      case LogLevel.DEBUG:
        return "text-green-500";
      case LogLevel.TRACE:
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const getCategoryColor = (category: LogCategory) => {
    const colors = {
      [LogCategory.GENERAL]:
        "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      [LogCategory.ALGORITHM]:
        "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      [LogCategory.RUNNER]:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      [LogCategory.CANVAS]:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      [LogCategory.ANIMATION]:
        "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      [LogCategory.PERFORMANCE]:
        "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      [LogCategory.USER_INTERACTION]:
        "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200",
      [LogCategory.ROUTER]:
        "bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200",
      [LogCategory.API]:
        "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      [LogCategory.WORKER]:
        "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200",
      [LogCategory.STATE]:
        "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
    };
    return (
      colors[category] ||
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        ref={panelRef}
        className="bg-white dark:bg-gray-900 rounded-lg w-11/12 h-5/6 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Debug Logs</h2>
          <div className="flex items-center gap-4">
            {/* Filters */}
            <select
              value={selectedLevel ?? ""}
              onChange={(e) =>
                setSelectedLevel(
                  e.target.value
                    ? (Number(e.target.value) as LogLevel)
                    : undefined
                )
              }
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              aria-label="Filter by log level"
            >
              <option value="">All Levels</option>
              <option value={LogLevel.ERROR}>Error</option>
              <option value={LogLevel.WARN}>Warn</option>
              <option value={LogLevel.INFO}>Info</option>
              <option value={LogLevel.DEBUG}>Debug</option>
              <option value={LogLevel.TRACE}>Trace</option>
            </select>

            <select
              value={selectedCategory ?? ""}
              onChange={(e) =>
                setSelectedCategory(
                  (e.target.value as LogCategory) || undefined
                )
              }
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              aria-label="Filter by log category"
            >
              <option value="">All Categories</option>
              {Object.values(LogCategory).map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto-scroll
            </label>

            <button
              onClick={() => {
                logger.clearLogs();
                setLogs([]);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Clear
            </button>

            <button
              onClick={() => {
                const logs = logger.exportLogs();
                const blob = new Blob([logs], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `algolens-logs-${new Date().toISOString()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Export
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-auto p-4 font-mono text-sm">
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No logs available
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 py-1 border-b border-gray-100 dark:border-gray-800"
                >
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`text-xs font-bold ${getLevelColor(log.level)}`}
                  >
                    {LogLevel[log.level]}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(log.category)}`}
                  >
                    {log.category.toUpperCase()}
                  </span>
                  <span className="flex-1 text-sm break-words">
                    {log.message}
                    {log.component && (
                      <span className="text-xs text-gray-500 ml-2">
                        [{log.component}]
                      </span>
                    )}
                  </span>
                  {log.data ? (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-500">
                        Data
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-w-md">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Total logs: {logs.length}</span>
            <span>Showing: {filteredLogs.length}</span>
            <span>
              Errors: {logs.filter((l) => l.level === LogLevel.ERROR).length} |
              Warnings: {logs.filter((l) => l.level === LogLevel.WARN).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
