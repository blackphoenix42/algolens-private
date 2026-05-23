// src/tests/unit/runner.test.tsx
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRunner } from "@/engine/runner";

// Helper: advance fake timers inside an async act so React 19 flushes
// the resulting microtask-scheduled re-renders before we assert.
const tick = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe("useRunner - basic playback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts paused at index 0", () => {
    const { result } = renderHook(() => useRunner(5, 4));
    expect(result.current.idx).toBe(0);
    expect(result.current.playing).toBe(false);
  });

  it("steps forward and clamps at the end", () => {
    const { result } = renderHook(() => useRunner(3, 4));
    act(() => result.current.stepForward());
    expect(result.current.idx).toBe(1);
    act(() => result.current.stepForward());
    act(() => result.current.stepForward());
    expect(result.current.idx).toBe(2);
  });

  it("auto-advances while playing and stops at the end", async () => {
    const { result } = renderHook(() => useRunner(3, 10)); // 100ms per step
    act(() => result.current.playForward());
    expect(result.current.playing).toBe(true);

    await tick(100);
    expect(result.current.idx).toBe(1);

    await tick(100);
    expect(result.current.idx).toBe(2);

    // Should auto-pause at the last frame.
    await tick(100);
    expect(result.current.idx).toBe(2);
    expect(result.current.playing).toBe(false);
  });
});

describe("useRunner - breakpoints", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("pauses when shouldBreak fires on a frame", async () => {
    const shouldBreak = (idx: number) => idx === 2;
    const { result } = renderHook(() => useRunner(5, 10, { shouldBreak }));

    act(() => result.current.playForward());

    // Advance to idx 1 - no break expected.
    await tick(100);
    expect(result.current.idx).toBe(1);
    expect(result.current.playing).toBe(true);

    // Next tick should land on idx 2 and pause.
    await tick(100);
    expect(result.current.idx).toBe(2);
    expect(result.current.playing).toBe(false);
  });

  it("does not re-trigger the same breakpoint on resume", async () => {
    const shouldBreak = (idx: number) => idx === 2;
    const { result } = renderHook(() => useRunner(5, 10, { shouldBreak }));

    act(() => result.current.playForward());
    await tick(200); // reach idx 2, pause
    expect(result.current.idx).toBe(2);
    expect(result.current.playing).toBe(false);

    // Resume - should NOT immediately pause on idx 2 again; should move on.
    act(() => result.current.playForward());
    await tick(100);
    expect(result.current.idx).toBe(3);
    expect(result.current.playing).toBe(true);
  });

  it("manual step clears the 'just-broken' memo so the same line can break again", async () => {
    const shouldBreak = (idx: number) => idx === 2;
    const { result } = renderHook(() => useRunner(5, 10, { shouldBreak }));

    act(() => result.current.playForward());
    await tick(200);
    expect(result.current.idx).toBe(2);
    expect(result.current.playing).toBe(false);

    // Step away and back, then resume - the breakpoint should fire again.
    act(() => result.current.stepBackward());
    expect(result.current.idx).toBe(1);

    act(() => result.current.playForward());
    await tick(100);
    expect(result.current.idx).toBe(2);
    expect(result.current.playing).toBe(false);
  });

  it("picks up an updated shouldBreak without restarting playback", async () => {
    let target = -1;
    const { result, rerender } = renderHook(
      ({ t }: { t: number }) =>
        useRunner(6, 10, { shouldBreak: (idx) => idx === t }),
      { initialProps: { t: target } }
    );

    act(() => result.current.playForward());

    await tick(100);
    expect(result.current.idx).toBe(1);

    // Update the breakpoint target mid-playback.
    target = 3;
    rerender({ t: target });

    await tick(200);
    expect(result.current.idx).toBe(3);
    expect(result.current.playing).toBe(false);
  });
});
