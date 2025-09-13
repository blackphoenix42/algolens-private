/**
 * Task scheduler to break up long-running operations and prevent main thread blocking
 */

// Type declarations for modern browser APIs
declare global {
  interface Window {
    scheduler?: {
      postTask: (callback: () => void, options?: { priority?: string }) => void;
    };
  }
}

/**
 * Yields control to the browser's event loop
 */
export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if (window.scheduler?.postTask) {
      // Use modern scheduler API if available
      window.scheduler.postTask(resolve, { priority: "user-blocking" });
    } else {
      // Fallback to setTimeout
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Processes an array in chunks to avoid blocking the main thread
 */
export async function processInChunks<T, R>(
  array: T[],
  processor: (item: T, index: number) => R | Promise<R>,
  chunkSize = 5,
  onProgress?: (progress: number) => void
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);

    // Process the current chunk
    const chunkResults = await Promise.all(
      chunk.map((item, idx) => processor(item, i + idx))
    );

    results.push(...chunkResults);

    // Report progress
    if (onProgress) {
      onProgress((i + chunk.length) / array.length);
    }

    // Yield to main thread if there are more chunks
    if (i + chunkSize < array.length) {
      await yieldToMain();
    }
  }

  return results;
}

/**
 * Runs a task with a time budget, yielding control if it takes too long
 */
export async function runWithTimeSlicing<T>(
  task: () => T | Promise<T>,
  timeSlice = 5 // 5ms budget
): Promise<T> {
  const start = performance.now();
  const result = await task();
  const elapsed = performance.now() - start;

  // If we exceeded the time slice, yield to main thread
  if (elapsed > timeSlice) {
    await yieldToMain();
  }

  return result;
}

/**
 * Idle callback wrapper for scheduling work when browser is idle
 */
export function runWhenIdle(
  task: () => void | Promise<void>,
  timeout = 1000
): void {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(
      async (deadline) => {
        if (deadline.timeRemaining() > 0) {
          await task();
        } else {
          // Fallback to timeout if no idle time
          setTimeout(task, 0);
        }
      },
      { timeout }
    );
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(task, 0);
  }
}
