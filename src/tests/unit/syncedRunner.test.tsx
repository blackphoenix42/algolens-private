// src/tests/unit/syncedRunner.test.tsx
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSyncedRunners } from "@/engine/syncedRunner";

const tick = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe("useSyncedRunners - basic", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts paused with all indices at 0", () => {
    const { result } = renderHook(() => useSyncedRunners([3, 5], 4));
    expect(result.current.indices).toEqual([0, 0]);
    expect(result.current.playing).toBe(false);
    expect(result.current.isAtStart).toBe(true);
    expect(result.current.isAtEnd).toBe(false);
  });

  it("clamps each timeline at its own boundary", async () => {
    // a has 3 frames, b has 5; after 4 ticks idx_a should clamp to 2
    // while idx_b continues to 4.
    const { result } = renderHook(() => useSyncedRunners([3, 5], 10));
    act(() => result.current.playForward());
    await tick(100);
    expect(result.current.indices).toEqual([1, 1]);
    await tick(100);
    expect(result.current.indices).toEqual([2, 2]);
    await tick(100);
    // a clamps at 2, b advances to 3
    expect(result.current.indices).toEqual([2, 3]);
    await tick(100);
    expect(result.current.indices).toEqual([2, 4]);
    // Now b has hit its end → pause.
    await tick(100);
    expect(result.current.indices).toEqual([2, 4]);
    expect(result.current.playing).toBe(false);
    expect(result.current.isAtEnd).toBe(true);
  });

  it("stepForward and stepBackward advance the master clock", () => {
    const { result } = renderHook(() => useSyncedRunners([4, 4], 4));
    act(() => result.current.stepForward());
    expect(result.current.indices).toEqual([1, 1]);
    act(() => result.current.stepForward());
    act(() => result.current.stepBackward());
    expect(result.current.indices).toEqual([1, 1]);
  });

  it("setMasterIndex jumps both timelines", () => {
    const { result } = renderHook(() => useSyncedRunners([3, 6], 4));
    act(() => result.current.setMasterIndex(4));
    // master goes to min(4, max-1) = 4; a clamped to 2, b at 4
    expect(result.current.indices).toEqual([2, 4]);
  });

  it("goToEnd lands on the longest timeline's last frame", () => {
    const { result } = renderHook(() => useSyncedRunners([3, 7], 4));
    act(() => result.current.goToEnd());
    expect(result.current.indices).toEqual([2, 6]);
    expect(result.current.isAtEnd).toBe(true);
  });

  it("reset clears all state", () => {
    const { result } = renderHook(() => useSyncedRunners([3, 4], 4));
    act(() => result.current.setMasterIndex(2));
    act(() => result.current.reset());
    expect(result.current.indices).toEqual([0, 0]);
    expect(result.current.playing).toBe(false);
    expect(result.current.direction).toBe(1);
  });
});

describe("useSyncedRunners - breakpoints", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("pauses when shouldBreak fires for any timeline", async () => {
    const shouldBreak = (frames: readonly number[]) => frames[1] === 2;
    const { result } = renderHook(() =>
      useSyncedRunners([5, 5], 10, { shouldBreak })
    );
    act(() => result.current.playForward());
    await tick(100);
    expect(result.current.indices).toEqual([1, 1]);
    expect(result.current.playing).toBe(true);
    await tick(100);
    expect(result.current.indices).toEqual([2, 2]);
    expect(result.current.playing).toBe(false);
  });

  it("does not re-trigger the same breakpoint on resume", async () => {
    const shouldBreak = (frames: readonly number[]) => frames[0] === 2;
    const { result } = renderHook(() =>
      useSyncedRunners([5, 5], 10, { shouldBreak })
    );
    act(() => result.current.playForward());
    await tick(200);
    expect(result.current.indices).toEqual([2, 2]);
    expect(result.current.playing).toBe(false);
    act(() => result.current.playForward());
    await tick(100);
    expect(result.current.indices).toEqual([3, 3]);
    expect(result.current.playing).toBe(true);
  });
});
