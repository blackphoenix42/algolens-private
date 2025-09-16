// src/services/monitoring/eventLogger.ts
import { generateId } from "@/utils";

import { LogCategory, logger } from "./logger";

/**
 * Event logging interfaces and utilities for user analytics
 */
export interface UserEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  data?: Record<string, unknown>;
}

export interface NavigationEvent {
  from: string;
  to: string;
  method: "click" | "keyboard" | "url" | "programmatic";
  timestamp: string;
}

export interface PerformanceEvent {
  metric: string;
  value: number;
  context?: string;
  timestamp: string;
}

export interface ErrorEvent {
  type: "javascript" | "react" | "network" | "validation";
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
}

/**
 * Enhanced event logging utilities for comprehensive tracking
 */
export class EventLogger {
  /**
   * Log user interactions (clicks, form submissions, etc.)
   */
  static logUserInteraction(
    action: string,
    data: Record<string, unknown> = {}
  ) {
    logger.info(LogCategory.USER_INTERACTION, action, {
      ...data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  /**
   * Log navigation events
   */
  static logNavigation(event: NavigationEvent) {
    logger.info(LogCategory.ROUTER, "Navigation occurred", {
      ...event,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  }

  /**
   * Log performance metrics
   */
  static logPerformance(event: PerformanceEvent) {
    logger.info(LogCategory.PERFORMANCE, `Performance: ${event.metric}`, {
      ...event,
      userAgent: navigator.userAgent,
    });
  }

  /**
   * Log errors with enhanced context
   */
  static logError(event: ErrorEvent) {
    logger.error(LogCategory.GENERAL, event.message, {
      ...event,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  /**
   * Log algorithm-specific events
   */
  static logAlgorithmEvent(
    action: string,
    algorithmData: {
      name: string;
      topic: string;
      slug: string;
      [key: string]: unknown;
    }
  ) {
    logger.info(LogCategory.ALGORITHM, action, {
      ...algorithmData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  /**
   * Log canvas/visualization events
   */
  static logCanvasEvent(action: string, data: Record<string, unknown> = {}) {
    logger.info(LogCategory.CANVAS, action, {
      ...data,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  /**
   * Log state changes
   */
  static logStateChange(
    component: string,
    change: string,
    data: Record<string, unknown> = {}
  ) {
    logger.debug(LogCategory.STATE, `${component}: ${change}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log feature usage
   */
  static logFeatureUsage(feature: string, data: Record<string, unknown> = {}) {
    logger.info(LogCategory.USER_INTERACTION, `Feature used: ${feature}`, {
      ...data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  /**
   * Log timing information
   */
  static logTiming(name: string, duration: number, context?: string) {
    logger.info(LogCategory.PERFORMANCE, `Timing: ${name}`, {
      duration,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log session events
   */
  static logSessionEvent(
    event: "start" | "end" | "extend",
    data: Record<string, unknown> = {}
  ) {
    logger.info(LogCategory.GENERAL, `Session ${event}`, {
      ...data,
      timestamp: new Date().toISOString(),
      sessionId: generateId(), // Use crypto-secure ID generation
    });
  }
}

// Convenience exports
export const {
  logUserInteraction,
  logNavigation,
  logPerformance,
  logError,
  logAlgorithmEvent,
  logCanvasEvent,
  logStateChange,
  logFeatureUsage,
  logTiming,
  logSessionEvent,
} = EventLogger;
