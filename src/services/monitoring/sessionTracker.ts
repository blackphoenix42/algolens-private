// src/services/monitoring/sessionTracker.ts
import { generateId } from "@/utils";

import { EventLogger } from "./eventLogger";
import { LogCategory, logger } from "./logger";

interface SessionData {
  sessionId: string;
  startTime: string;
  lastActivity: string;
  pageViews: number;
  userAgent: string;
  viewport: { width: number; height: number };
  timezone: string;
}

/**
 * Comprehensive session tracking for user analytics
 */
export class SessionTracker {
  private static instance: SessionTracker;
  private sessionData: SessionData;
  private activityTimer: NodeJS.Timeout | null = null;
  private readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    this.sessionData = this.initializeSession();
    this.startTracking();
  }

  public static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    return SessionTracker.instance;
  }

  private initializeSession(): SessionData {
    const sessionId = generateId(); // Use crypto-secure ID generation
    const now = new Date().toISOString();

    const session: SessionData = {
      sessionId,
      startTime: now,
      lastActivity: now,
      pageViews: 0,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    logger.info(LogCategory.GENERAL, "Session started", session);
    EventLogger.logSessionEvent("start", { ...session });

    return session;
  }

  private startTracking() {
    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.updateActivity("tab_visible");
      } else {
        this.updateActivity("tab_hidden");
      }
    });

    // Track mouse and keyboard activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const throttledActivity = this.throttle(() => {
      this.updateActivity("user_activity");
    }, 10000); // Log activity at most every 10 seconds

    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledActivity, true);
    });

    // Track window resize
    window.addEventListener("resize", () => {
      this.sessionData.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      logger.debug(LogCategory.GENERAL, "Viewport resized", {
        viewport: this.sessionData.viewport,
        timestamp: new Date().toISOString(),
      });
    });

    // Track beforeunload
    window.addEventListener("beforeunload", () => {
      this.endSession();
    });

    // Set up activity timeout
    this.resetActivityTimer();
  }

  private updateActivity(source: string) {
    this.sessionData.lastActivity = new Date().toISOString();

    logger.debug(LogCategory.USER_INTERACTION, "User activity detected", {
      source,
      sessionId: this.sessionData.sessionId,
      timestamp: this.sessionData.lastActivity,
    });

    this.resetActivityTimer();
  }

  private resetActivityTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    this.activityTimer = setTimeout(() => {
      logger.info(LogCategory.GENERAL, "Session timeout due to inactivity", {
        sessionId: this.sessionData.sessionId,
        duration: Date.now() - new Date(this.sessionData.startTime).getTime(),
        timestamp: new Date().toISOString(),
      });

      EventLogger.logSessionEvent("end", {
        reason: "timeout",
        sessionData: this.sessionData,
      });
    }, this.ACTIVITY_TIMEOUT);
  }

  public logPageView(path: string) {
    this.sessionData.pageViews++;

    logger.info(LogCategory.ROUTER, "Page view logged", {
      path,
      sessionId: this.sessionData.sessionId,
      pageViews: this.sessionData.pageViews,
      timestamp: new Date().toISOString(),
    });
  }

  public logFeatureUsage(feature: string, data?: Record<string, unknown>) {
    logger.info(LogCategory.USER_INTERACTION, `Feature used: ${feature}`, {
      feature,
      sessionId: this.sessionData.sessionId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  public getSessionInfo(): SessionData {
    return { ...this.sessionData };
  }

  private endSession() {
    const duration =
      Date.now() - new Date(this.sessionData.startTime).getTime();

    logger.info(LogCategory.GENERAL, "Session ended", {
      sessionId: this.sessionData.sessionId,
      duration,
      pageViews: this.sessionData.pageViews,
      timestamp: new Date().toISOString(),
    });

    EventLogger.logSessionEvent("end", {
      sessionData: this.sessionData,
      duration,
    });
  }

  private throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: unknown, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// Initialize session tracking
export const sessionTracker = SessionTracker.getInstance();
