// src/components/debug/DebugPanel.tsx
import { useEffect, useMemo, useRef, useState } from "react";

import { LogCategory, logger, LogLevel } from "@/services/monitoring";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

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

  // Update logs periodically
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setLogs(logger.getLogs());
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Level filter
    if (selectedLevel !== undefined) {
      filtered = filtered.filter((log) => log.level <= selectedLevel);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((log) => log.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.category.toLowerCase().includes(query) ||
          (log.component && log.component.toLowerCase().includes(query)) ||
          (log.data && JSON.stringify(log.data).toLowerCase().includes(query))
      );
    }

    // Sort logs
    const sorted = [...filtered].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return sorted;
  }, [logs, selectedLevel, selectedCategory, searchQuery, sortOrder]);

  // Paginate logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

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

  // Helper functions for styling
  function formatLogData(data: unknown): string {
    try {
      return typeof data === "string" ? data : JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div
        ref={panelRef}
        className="flex h-full max-h-[90vh] w-full max-w-7xl flex-col rounded-lg bg-white shadow-2xl dark:bg-gray-900"
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐛</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Debug Logs
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span>Live</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logger.clearLogs();
                setLogs([]);
                setCurrentPage(1);
              }}
              className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-600"
            >
              🗑️ Clear
            </button>

            <button
              onClick={() => {
                const logs = logger.exportLogs();
                const blob = new Blob([logs], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `algolens-logs-${new Date().toISOString().split("T")[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-600"
            >
              💾 Export
            </button>

            <button
              onClick={onClose}
              className="rounded-md bg-gray-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-600"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevel ?? ""}
              onChange={(e) => {
                setSelectedLevel(
                  e.target.value
                    ? (Number(e.target.value) as LogLevel)
                    : undefined
                );
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All Levels</option>
              <option value={LogLevel.ERROR}>❌ Error</option>
              <option value={LogLevel.WARN}>⚠️ Warn</option>
              <option value={LogLevel.INFO}>ℹ️ Info</option>
              <option value={LogLevel.DEBUG}>🔍 Debug</option>
              <option value={LogLevel.TRACE}>🔬 Trace</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => {
                setSelectedCategory(
                  (e.target.value as LogCategory) || undefined
                );
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All Categories</option>
              {Object.values(LogCategory).map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Page Size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={200}>200 per page</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded"
                />
                Auto-scroll
              </label>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Sort:{" "}
                {sortOrder === "desc" ? "🔽 Newest first" : "🔼 Oldest first"}
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {paginatedLogs.length} of {filteredLogs.length} logs
            </div>
          </div>
        </div>

        {/* Enhanced Logs Display */}
        <div
          ref={logsContainerRef}
          className="flex-1 overflow-auto bg-white font-mono text-sm dark:bg-gray-900"
        >
          {paginatedLogs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-gray-500">
              <div>
                <div className="mb-4 text-4xl">📝</div>
                <div className="mb-2 text-lg font-medium">No logs found</div>
                <div className="text-sm">
                  {filteredLogs.length === 0
                    ? "Try adjusting your filters or search terms"
                    : "Try navigating to a different page"}
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedLogs.map((log, index) => (
                <div
                  key={`${log.timestamp}-${index}`}
                  className="flex items-start gap-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span className="mt-0.5 text-xs font-medium whitespace-nowrap text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      fractionalSecondDigits: 3,
                    })}
                  </span>

                  <span
                    className={`mt-0.5 text-xs font-bold whitespace-nowrap ${getLevelColor(log.level)}`}
                  >
                    {getLevelEmoji(log.level)} {LogLevel[log.level]}
                  </span>

                  <span
                    className={`rounded-full px-2 py-1 text-xs whitespace-nowrap ${getCategoryColor(log.category)}`}
                  >
                    {log.category.toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm break-words text-gray-900 dark:text-gray-100">
                      {log.message}
                      {log.component && (
                        <span className="ml-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {log.component}
                        </span>
                      )}
                    </div>

                    {log.data !== undefined && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-blue-600 select-none hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                          📋 Show data
                        </summary>
                        <div className="mt-2 overflow-auto rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                          <pre className="text-xs whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                            {formatLogData(log.data)}
                          </pre>
                        </div>
                      </details>
                    )}

                    {log.stack && log.level === LogLevel.ERROR && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-red-600 select-none hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
                          🔍 Stack trace
                        </summary>
                        <div className="mt-2 overflow-auto rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                          <pre className="text-xs whitespace-pre-wrap text-red-800 dark:text-red-200">
                            {log.stack}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  ⏮️ First
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  ⬅️ Prev
                </button>

                <span className="px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Next ➡️
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Last ⏭️
                </button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredLogs.length} total logs
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Footer */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {logs.length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Total Logs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600 dark:text-red-400">
                {logs.filter((l) => l.level === LogLevel.ERROR).length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Errors</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                {logs.filter((l) => l.level === LogLevel.WARN).length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Warnings</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                {logs.filter((l) => l.level === LogLevel.INFO).length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Info</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      app: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      ui: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      performance:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      navigation:
        "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
      user: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      system: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      error: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    return (
      colors[category.toLowerCase()] ||
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    );
  }

  function getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return "❌";
      case LogLevel.WARN:
        return "⚠️";
      case LogLevel.INFO:
        return "ℹ️";
      case LogLevel.DEBUG:
        return "🔍";
      case LogLevel.TRACE:
        return "🔬";
      default:
        return "📝";
    }
  }
}
