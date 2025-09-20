// src/lib/logger.ts
/**
 * AlgoLens Debug Logger
 *
 * Provides centralized logging with different levels and categories.
 * Debug logging is enabled based on environment variables and development mode.
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export enum LogCategory {
  GENERAL = "general",
  ALGORITHM = "algorithm",
  RUNNER = "runner",
  CANVAS = "canvas",
  ANIMATION = "animation",
  PERFORMANCE = "performance",
  USER_INTERACTION = "user",
  ROUTER = "router",
  API = "api",
  WORKER = "worker",
  STATE = "state",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: unknown;
  component?: string;
  stack?: string;
}

class _Logger {
  private static instance: _Logger;
  private logLevel: LogLevel;
  private enabledCategories: Set<LogCategory>;
  private logs: LogEntry[] = [];
  private maxLogEntries = 5000; // Increased capacity
  private storageKey = "algolens_debug_logs";
  private isInitialized = false;

  private constructor() {
    // Determine log level from environment
    this.logLevel = this.getLogLevelFromEnv();
    this.enabledCategories = this.getCategoriesFromEnv();

    // Load persisted logs
    this.loadPersistedLogs();

    // Log initialization
    if (this.shouldLog(LogLevel.INFO, LogCategory.GENERAL)) {
      console.log("🔍 AlgoLens Debug Logger initialized", {
        level: LogLevel[this.logLevel],
        categories: Array.from(this.enabledCategories),
        persistedLogs: this.logs.length,
        isDev: import.meta.env.DEV,
      });
    }

    this.isInitialized = true;
  }

  public static getInstance(): _Logger {
    if (!_Logger.instance) {
      _Logger.instance = new _Logger();
    }
    return _Logger.instance;
  }

  private getLogLevelFromEnv(): LogLevel {
    // In development, default to DEBUG
    if (import.meta.env.DEV) {
      const envLevel = import.meta.env.VITE_LOG_LEVEL;
      if (envLevel && envLevel in LogLevel) {
        return LogLevel[envLevel as keyof typeof LogLevel];
      }
      return LogLevel.DEBUG;
    }

    // In production, default to WARN
    return LogLevel.WARN;
  }

  private getCategoriesFromEnv(): Set<LogCategory> {
    const envCategories = import.meta.env.VITE_LOG_CATEGORIES;

    if (envCategories) {
      const categories = envCategories
        .split(",")
        .map((cat: string) => cat.trim());
      return new Set(
        categories.filter((cat: string) =>
          Object.values(LogCategory).includes(cat as LogCategory)
        ) as LogCategory[]
      );
    }

    // Default: all categories in development, limited in production
    if (import.meta.env.DEV) {
      return new Set(Object.values(LogCategory));
    }

    return new Set([LogCategory.GENERAL, LogCategory.PERFORMANCE]);
  }

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    return level <= this.logLevel && this.enabledCategories.has(category);
  }

  private loadPersistedLogs(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedLogs = JSON.parse(stored) as LogEntry[];
        if (Array.isArray(parsedLogs)) {
          // Keep only recent logs to prevent memory issues
          this.logs = parsedLogs.slice(-this.maxLogEntries);
        }
      }
    } catch (error) {
      console.warn("Failed to load persisted debug logs:", error);
      this.logs = [];
    }
  }

  private persistLogs(): void {
    try {
      // Only persist if we have logs and are initialized
      if (this.logs.length > 0 && this.isInitialized) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
      }
    } catch (error) {
      console.warn("Failed to persist debug logs:", error);
    }
  }

  private savePersistentLog = (() => {
    let timeout: NodeJS.Timeout | null = null;
    return () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => this.persistLogs(), 1000); // Debounce saves
    };
  })();

  private formatMessage(
    level: LogLevel,
    category: LogCategory,
    message: string
  ): string {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, -1); // HH:MM:SS.mmm
    const levelEmoji = this.getLevelEmoji(level);

    return `${levelEmoji} ${timestamp} [${category.toUpperCase()}] ${message}`;
  }

  private getLevelEmoji(level: LogLevel): string {
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

  private getCategoryColor(category: LogCategory): string {
    const colors = {
      [LogCategory.GENERAL]: "#6b7280",
      [LogCategory.ALGORITHM]: "#3b82f6",
      [LogCategory.RUNNER]: "#10b981",
      [LogCategory.CANVAS]: "#f59e0b",
      [LogCategory.ANIMATION]: "#8b5cf6",
      [LogCategory.PERFORMANCE]: "#ef4444",
      [LogCategory.USER_INTERACTION]: "#06b6d4",
      [LogCategory.ROUTER]: "#84cc16",
      [LogCategory.API]: "#f97316",
      [LogCategory.WORKER]: "#ec4899",
      [LogCategory.STATE]: "#6366f1",
    };
    return colors[category] || "#6b7280";
  }

  private addLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: unknown,
    component?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      component,
      stack: level === LogLevel.ERROR ? new Error().stack : undefined,
    };

    this.logs.push(entry);

    // Keep only the most recent entries
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Persist logs to localStorage (debounced)
    this.savePersistentLog();
  }

  public error(
    category: LogCategory,
    message: string,
    data?: unknown,
    component?: string
  ): void {
    if (!this.shouldLog(LogLevel.ERROR, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.ERROR,
      category,
      message
    );
    console.error(formattedMessage, data);
    this.addLogEntry(LogLevel.ERROR, category, message, data, component);
  }

  public warn(
    category: LogCategory,
    message: string,
    data?: unknown,
    component?: string
  ): void {
    if (!this.shouldLog(LogLevel.WARN, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.WARN,
      category,
      message
    );
    console.warn(formattedMessage, data);
    this.addLogEntry(LogLevel.WARN, category, message, data, component);
  }

  public info(
    category: LogCategory,
    message: string,
    data?: unknown,
    component?: string
  ): void {
    if (!this.shouldLog(LogLevel.INFO, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.INFO,
      category,
      message
    );
    console.info(formattedMessage, data);
    this.addLogEntry(LogLevel.INFO, category, message, data, component);
  }

  public debug(
    category: LogCategory,
    message: string,
    data?: unknown,
    component?: string
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.DEBUG,
      category,
      message
    );
    console.debug(formattedMessage, data);
    this.addLogEntry(LogLevel.DEBUG, category, message, data, component);
  }

  public trace(
    category: LogCategory,
    message: string,
    data?: unknown,
    component?: string
  ): void {
    if (!this.shouldLog(LogLevel.TRACE, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.TRACE,
      category,
      message
    );
    console.trace(formattedMessage, data);
    this.addLogEntry(LogLevel.TRACE, category, message, data, component);
  }

  // Performance timing utilities
  public time(
    label: string,
    category: LogCategory = LogCategory.PERFORMANCE
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;
    console.time(label);
    this.debug(category, `Timer started: ${label}`);
  }

  public timeEnd(
    label: string,
    category: LogCategory = LogCategory.PERFORMANCE
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;
    console.timeEnd(label);
    this.debug(category, `Timer ended: ${label}`);
  }

  // Group logging for complex operations
  public group(label: string, category: LogCategory): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;
    console.group(this.formatMessage(LogLevel.DEBUG, category, label));
  }

  public groupEnd(): void {
    console.groupEnd();
  }

  // Get logs for debugging or export
  public getLogs(level?: LogLevel, category?: LogCategory): LogEntry[] {
    return this.logs.filter((log) => {
      if (level !== undefined && log.level > level) return false;
      if (category !== undefined && log.category !== category) return false;
      return true;
    });
  }

  public clearLogs(): void {
    this.logs = [];
    // Clear persisted logs as well
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn("Failed to clear persisted logs:", error);
    }
    this.info(LogCategory.GENERAL, "Log history cleared");
  }

  // Export logs as JSON
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Performance monitoring
  public measureFunction<T>(
    fn: () => T,
    label: string,
    category: LogCategory = LogCategory.PERFORMANCE
  ): T {
    this.time(label, category);
    try {
      const result = fn();
      this.timeEnd(label, category);
      return result;
    } catch (error) {
      this.timeEnd(label, category);
      this.error(category, `Function "${label}" threw error`, error);
      throw error;
    }
  }

  // Async function measurement
  public async measureAsyncFunction<T>(
    fn: () => Promise<T>,
    label: string,
    category: LogCategory = LogCategory.PERFORMANCE
  ): Promise<T> {
    this.time(label, category);
    try {
      const result = await fn();
      this.timeEnd(label, category);
      return result;
    } catch (error) {
      this.timeEnd(label, category);
      this.error(category, `Async function "${label}" threw error`, error);
      throw error;
    }
  }
}

// Export singleton instance
// export const logger = Logger.getInstance();

// Convenience functions for common logging patterns
// export const log = {
//   error: (message: string, data?: unknown, component?: string) =>
//     logger.error(LogCategory.GENERAL, message, data, component),
//   warn: (message: string, data?: unknown, component?: string) =>
//     logger.warn(LogCategory.GENERAL, message, data, component),
//   info: (message: string, data?: unknown, component?: string) =>
//     logger.info(LogCategory.GENERAL, message, data, component),
//   debug: (message: string, data?: unknown, component?: string) =>
//     logger.debug(LogCategory.GENERAL, message, data, component),
//   trace: (message: string, data?: unknown, component?: string) =>
//     logger.trace(LogCategory.GENERAL, message, data, component),

//   // Category-specific helpers
//   algorithm: {
//     start: (name: string, input: unknown) =>
//       logger.info(LogCategory.ALGORITHM, `Algorithm started: ${name}`, {
//         input,
//       }),
//     step: (step: number, operation: string, data?: unknown) =>
//       logger.debug(LogCategory.ALGORITHM, `Step ${step}: ${operation}`, data),
//     complete: (name: string, result: unknown, duration?: number) =>
//       logger.info(LogCategory.ALGORITHM, `Algorithm completed: ${name}`, {
//         result,
//         duration,
//       }),
//     error: (name: string, error: unknown) =>
//       logger.error(LogCategory.ALGORITHM, `Algorithm error: ${name}`, error),
//   },

//   performance: {
//     mark: (label: string) => logger.time(label, LogCategory.PERFORMANCE),
//     measure: (label: string) => logger.timeEnd(label, LogCategory.PERFORMANCE),
//     metric: (name: string, value: number, unit: string) =>
//       logger.info(LogCategory.PERFORMANCE, `${name}: ${value}${unit}`),
//   },

//   user: {
//     action: (action: string, details?: unknown) =>
//       logger.debug(
//         LogCategory.USER_INTERACTION,
//         `User action: ${action}`,
//         details
//       ),
//     click: (element: string, details?: unknown) =>
//       logger.debug(LogCategory.USER_INTERACTION, `Click: ${element}`, details),
//     input: (field: string, value: unknown) =>
//       logger.debug(LogCategory.USER_INTERACTION, `Input: ${field}`, { value }),
//   },

//   canvas: {
//     render: (component: string, frameCount?: number) =>
//       logger.trace(LogCategory.CANVAS, `Render: ${component}`, { frameCount }),
//     resize: (width: number, height: number) =>
//       logger.debug(LogCategory.CANVAS, "Canvas resized", { width, height }),
//     interaction: (type: string, coords?: { x: number; y: number }) =>
//       logger.debug(LogCategory.CANVAS, `Canvas interaction: ${type}`, coords),
//   },

//   animation: {
//     start: (name: string, duration?: number) =>
//       logger.debug(LogCategory.ANIMATION, `Animation started: ${name}`, {
//         duration,
//       }),
//     frame: (frame: number, data?: unknown) =>
//       logger.trace(LogCategory.ANIMATION, `Frame ${frame}`, data),
//     complete: (name: string) =>
//       logger.debug(LogCategory.ANIMATION, `Animation completed: ${name}`),
//     pause: (name: string, frame: number) =>
//       logger.debug(LogCategory.ANIMATION, `Animation paused: ${name}`, {
//         frame,
//       }),
//   },

//   state: {
//     change: (component: string, oldState: unknown, newState: unknown) =>
//       logger.debug(LogCategory.STATE, `State change: ${component}`, {
//         oldState,
//         newState,
//       }),
//     update: (key: string, value: unknown) =>
//       logger.trace(LogCategory.STATE, `State update: ${key}`, { value }),
//   },
// };

// // React hook for component lifecycle logging
// export function useComponentLogger(componentName: string) {
//   const componentLogger = {
//     mount: () =>
//       log.debug(`${componentName} mounted`, undefined, componentName),
//     unmount: () =>
//       log.debug(`${componentName} unmounted`, undefined, componentName),
//     render: () =>
//       log.trace(`${componentName} rendering`, undefined, componentName),
//     update: (reason?: string) =>
//       log.debug(`${componentName} updated`, { reason }, componentName),
//     error: (error: unknown) =>
//       log.error(`${componentName} error`, error, componentName),
//   };

//   return componentLogger;
// }

// Global error handler
// if (typeof window !== "undefined") {
//   window.addEventListener("error", (event) => {
//     logger.error(LogCategory.GENERAL, "Uncaught error", {
//       message: event.message,
//       filename: event.filename,
//       lineno: event.lineno,
//       colno: event.colno,
//       error: event.error,
//     });
//   });

//   window.addEventListener("unhandledrejection", (event) => {
//     logger.error(LogCategory.GENERAL, "Unhandled promise rejection", {
//       reason: event.reason,
//     });
//   });
// }
