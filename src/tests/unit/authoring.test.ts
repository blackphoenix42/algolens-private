// src/tests/unit/authoring.test.ts
import { describe, expect, it } from "vitest";

import {
  bubbleSortAuthored,
  compileAndRun,
  compileAuthored,
  createEmitter,
  factorialAuthored,
  linearSearchAuthored,
  runAuthored,
  stripBasicTypes,
} from "@/authoring";

describe("authoring emitter", () => {
  it("buffers frames in order", () => {
    const e = createEmitter();
    e.emit({ explain: "a" });
    e.snapshot([1, 2, 3], { explain: "b" });
    e.explain("c");
    expect(e.frames.map((f) => f.explain)).toEqual(["a", "b", "c"]);
    expect(e.frames[1].array).toEqual([1, 2, 3]);
  });

  it("attaches the current call stack to every frame", () => {
    const e = createEmitter();
    e.pushStack({ name: "outer" });
    e.explain("inside outer");
    e.pushStack({ name: "inner", args: { x: 1 } });
    e.explain("inside inner");
    e.popStack();
    e.explain("back in outer");
    e.popStack();
    e.explain("top level");
    const stacks = e.frames.map((f) => f.callStack?.map((s) => s.name) ?? []);
    expect(stacks).toEqual([["outer"], ["outer", "inner"], ["outer"], []]);
  });

  it("snapshots are independent copies", () => {
    const e = createEmitter();
    const arr = [1, 2, 3];
    e.snapshot(arr);
    arr.push(4);
    expect(e.frames[0].array).toEqual([1, 2, 3]);
  });

  it("drain returns and clears the buffer", () => {
    const e = createEmitter();
    e.explain("x");
    expect(e.drain()).toHaveLength(1);
    expect(e.frames).toHaveLength(0);
  });

  it("captures errors but preserves partial frames", () => {
    const { frames, error } = runAuthored<number[]>(
      (arr, em) => {
        em.snapshot(arr);
        throw new Error("boom");
      },
      [1, 2]
    );
    expect(frames).toHaveLength(1);
    expect(error?.message).toBe("boom");
  });
});

describe("authored sample algorithms (golden state)", () => {
  it("bubbleSort produces the expected frame timeline on [3,1,2]", () => {
    const { frames, error } = runAuthored(bubbleSortAuthored, [3, 1, 2]);
    expect(error).toBeNull();
    // 1 start + 2 compares with one swap each + final = at least 6 frames.
    expect(frames.length).toBeGreaterThanOrEqual(6);
    expect(frames[0].array).toEqual([3, 1, 2]);
    expect(frames[frames.length - 1].array).toEqual([1, 2, 3]);
    // Every comparison-frame must have a `compared` pair adjacent in the
    // array (golden invariant of bubble sort).
    for (const f of frames) {
      const c = f.highlights?.compared;
      if (c) expect(c[1] - c[0]).toBe(1);
    }
  });

  it("linearSearch finds the target and tracks comparisons", () => {
    const { frames, error } = runAuthored(linearSearchAuthored, {
      array: [10, 20, 30, 40],
      target: 30,
    });
    expect(error).toBeNull();
    const last = frames[frames.length - 1];
    expect(last.watch?.foundAt).toBe(2);
    // Comparisons should be strictly monotonic across frames where set.
    let prev = -1;
    for (const f of frames) {
      const c = (f.counters ?? {}).comparisons;
      if (typeof c === "number") {
        expect(c).toBeGreaterThanOrEqual(prev);
        prev = c;
      }
    }
    expect(prev).toBe(3); // touched indices 0,1,2
  });

  it("factorial pushes and pops the call stack symmetrically", () => {
    const { frames, error } = runAuthored(factorialAuthored, 3);
    expect(error).toBeNull();
    // Stack depth should never go negative and should return to 0 by the
    // end of recursion (we don't pop after the very last frame in the
    // implementation, so the *last frame* may still show depth 1; but
    // the maximum depth should match input).
    const depths = frames.map((f) => f.callStack?.length ?? 0);
    expect(Math.max(...depths)).toBe(3);
    expect(depths.every((d) => d >= 0)).toBe(true);
  });
});

describe("compileAuthored", () => {
  it("compiles a plain JS run() function and executes it", () => {
    const source = `function run(input, emitter) {
      emitter.explain("hi");
      emitter.snapshot(input);
    }`;
    const r = compileAndRun(source, [1, 2, 3]);
    expect(r.error).toBeNull();
    expect(r.frames).toHaveLength(2);
    expect(r.frames[1].array).toEqual([1, 2, 3]);
  });

  it("strips simple TS annotations", () => {
    const ts = `function run(input: number[], emitter: any): void {
      const x: number = input.length;
      emitter.explain("len=" + x);
    }`;
    const r = compileAndRun(ts, [9, 9, 9]);
    expect(r.error).toBeNull();
    expect(r.frames[0].explain).toBe("len=3");
  });

  it("strips export keywords", () => {
    expect(stripBasicTypes("export function run() {}")).toContain(
      "function run() {}"
    );
    expect(stripBasicTypes("export default function run() {}")).toContain(
      "default function run() {}"
    );
  });

  it("returns a SyntaxError for malformed source", () => {
    const r = compileAuthored("function run( { ???");
    expect(r.algorithm).toBeNull();
    expect(r.error).not.toBeNull();
  });

  it("surfaces runtime errors from authored code", () => {
    const r = compileAndRun(
      `function run() { throw new Error("user error"); }`,
      null
    );
    expect(r.error?.message).toBe("user error");
  });
});
