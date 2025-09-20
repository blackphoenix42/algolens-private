/**
 * Search Analytics and Performance Monitoring
 *
 * This module provides comprehensive analytics and monitoring for the search system,
 * helping to identify performance bottlenecks, user behavior patterns, and areas for improvement.
 */

import type { SearchableItem, SearchResult } from "@/utils/searchUtils";

interface SearchMetrics {
  timestamp: number;
  query: string;
  queryLength: number;
  resultCount: number;
  searchTime: number;
  selectedResult?: string;
  userAction: "search" | "select" | "abandon";
  searchType:
    | "exact"
    | "fuzzy"
    | "semantic"
    | "suggested"
    | "partial"
    | "phonetic"
    | "contextual";
  cacheHit: boolean;
}

interface PerformanceMetrics {
  avgSearchTime: number;
  medianSearchTime: number;
  slowQueries: Array<{ query: string; time: number }>;
  cacheHitRate: number;
  popularQueries: Array<{ query: string; count: number }>;
  failedQueries: Array<{ query: string; count: number }>;
}

class SearchMonitor {
  private static metrics: SearchMetrics[] = [];
  private static maxMetrics = 1000;

  /**
   * Record search performance metrics
   */
  static recordSearch(
    query: string,
    results: SearchResult<SearchableItem>[],
    searchTimeMs: number,
    cacheHit = false
  ): void {
    const metric: SearchMetrics = {
      timestamp: Date.now(),
      query: query.toLowerCase().trim(),
      queryLength: query.length,
      resultCount: results.length,
      searchTime: searchTimeMs,
      userAction: "search",
      searchType: results.length > 0 ? results[0].type : "exact",
      cacheHit,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Record user selection
   */
  static recordSelection(query: string, selectedResult: SearchableItem): void {
    const latestSearch = this.metrics
      .slice()
      .reverse()
      .find(
        (m) =>
          m.query === query.toLowerCase().trim() && m.userAction === "search"
      );

    if (latestSearch) {
      latestSearch.userAction = "select";
      latestSearch.selectedResult = selectedResult.id;
    }
  }

  /**
   * Get comprehensive performance analytics
   */
  static getAnalytics(hoursBack = 24): PerformanceMetrics {
    const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    const searchTimes = recentMetrics
      .filter((m) => m.userAction === "search")
      .map((m) => m.searchTime);

    const avgSearchTime =
      searchTimes.length > 0
        ? searchTimes.reduce((sum, time) => sum + time, 0) / searchTimes.length
        : 0;

    const sortedTimes = [...searchTimes].sort((a, b) => a - b);
    const medianSearchTime =
      sortedTimes.length > 0
        ? sortedTimes[Math.floor(sortedTimes.length / 2)]
        : 0;

    // Find slow queries (above 95th percentile)
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const slowThreshold = sortedTimes[p95Index] || 100;
    const slowQueries = recentMetrics
      .filter((m) => m.searchTime > slowThreshold)
      .map((m) => ({ query: m.query, time: m.searchTime }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    // Cache hit rate
    const totalSearches = recentMetrics.filter(
      (m) => m.userAction === "search"
    ).length;
    const cacheHits = recentMetrics.filter((m) => m.cacheHit).length;
    const cacheHitRate =
      totalSearches > 0 ? (cacheHits / totalSearches) * 100 : 0;

    // Popular queries
    const queryCount = new Map<string, number>();
    recentMetrics
      .filter((m) => m.userAction === "search")
      .forEach((m) => {
        const count = queryCount.get(m.query) || 0;
        queryCount.set(m.query, count + 1);
      });

    const popularQueries = Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Failed queries (no results)
    const failedQueryCount = new Map<string, number>();
    recentMetrics
      .filter((m) => m.resultCount === 0)
      .forEach((m) => {
        const count = failedQueryCount.get(m.query) || 0;
        failedQueryCount.set(m.query, count + 1);
      });

    const failedQueries = Array.from(failedQueryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      avgSearchTime: Math.round(avgSearchTime * 100) / 100,
      medianSearchTime: Math.round(medianSearchTime * 100) / 100,
      slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      popularQueries,
      failedQueries,
    };
  }

  /**
   * Get search success metrics
   */
  static getSuccessMetrics(): {
    totalSearches: number;
    successfulSearches: number;
    successRate: number;
    avgResultsPerSearch: number;
    selectionRate: number;
  } {
    const searchMetrics = this.metrics.filter((m) => m.userAction === "search");
    const selectionMetrics = this.metrics.filter(
      (m) => m.userAction === "select"
    );

    const totalSearches = searchMetrics.length;
    const successfulSearches = searchMetrics.filter(
      (m) => m.resultCount > 0
    ).length;
    const successRate =
      totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0;

    const avgResultsPerSearch =
      totalSearches > 0
        ? searchMetrics.reduce((sum, m) => sum + m.resultCount, 0) /
          totalSearches
        : 0;

    const selectionRate =
      totalSearches > 0 ? (selectionMetrics.length / totalSearches) * 100 : 0;

    return {
      totalSearches,
      successfulSearches,
      successRate: Math.round(successRate * 100) / 100,
      avgResultsPerSearch: Math.round(avgResultsPerSearch * 100) / 100,
      selectionRate: Math.round(selectionRate * 100) / 100,
    };
  }

  /**
   * Export metrics for analysis
   */
  static exportMetrics(): SearchMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get real-time search suggestions based on analytics
   */
  static getSmartSuggestions(currentQuery = ""): string[] {
    const analytics = this.getAnalytics(72); // Last 3 days
    const suggestions = new Set<string>();

    // Add popular successful queries
    analytics.popularQueries
      .filter(
        (p) =>
          p.query.includes(currentQuery.toLowerCase()) &&
          p.query !== currentQuery.toLowerCase()
      )
      .forEach((p) => suggestions.add(p.query));

    // Add variations of current query that were successful
    const similarQueries = this.metrics
      .filter(
        (m) =>
          m.query.includes(currentQuery.toLowerCase()) &&
          m.resultCount > 0 &&
          m.query !== currentQuery.toLowerCase()
      )
      .map((m) => m.query)
      .slice(0, 3);

    similarQueries.forEach((q) => suggestions.add(q));

    return Array.from(suggestions).slice(0, 6);
  }
}

/**
 * Performance timer utility for measuring search operations
 */
export class SearchTimer {
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  stop(): number {
    return performance.now() - this.startTime;
  }

  static time<T>(operation: () => T): { result: T; time: number } {
    const timer = new SearchTimer();
    const result = operation();
    const time = timer.stop();
    return { result, time };
  }
}

// Export the monitor for use in search components
export default SearchMonitor;

// Helper functions for easy integration
export const recordSearchMetrics =
  SearchMonitor.recordSearch.bind(SearchMonitor);
export const recordSearchSelection =
  SearchMonitor.recordSelection.bind(SearchMonitor);
export const getSearchAnalytics =
  SearchMonitor.getAnalytics.bind(SearchMonitor);
export const getSearchSuccessMetrics =
  SearchMonitor.getSuccessMetrics.bind(SearchMonitor);
export const getSmartSearchSuggestions =
  SearchMonitor.getSmartSuggestions.bind(SearchMonitor);
