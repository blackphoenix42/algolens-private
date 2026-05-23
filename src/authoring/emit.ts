/**
 * Authoring foundation for AlgoLens.
 *
 * Lets contributors write algorithms with an imperative `emit()` API
 * instead of having to author a generator function by hand. Internally
 * the emitter buffers frames and exposes them as a `Frame[]`, which can
 * be replayed through the same {@link useRunner} hook the built-in
 * algorithms use.
 *
 * No WASM yet — this is the JS-first foundation that future sandboxed
 * runtimes will plug into via the same {@link Emitter} contract.
 */

import type { Frame, StackFrame } from "@/types";

/**
 * Typed emitter passed to authored algorithms. Each `emit()` call
 * appends one frame to the timeline. Helpers exist for the most common
 * payloads so authors don't have to remember the Frame shape.
 */
export interface Emitter {
  /** Append a raw frame. */
  emit: (frame: Frame) => void;
  /** Convenience: emit a frame with just an explanation message. */
  explain: (message: string, extra?: Partial<Frame>) => void;
  /** Convenience: emit a frame snapshotting the current array. */
  snapshot: (
    array: readonly number[],
    extra?: Omit<Partial<Frame>, "array">
  ) => void;
  /** Push a stack frame; subsequent `emit` calls auto-attach it. */
  pushStack: (frame: StackFrame) => void;
  /** Pop the top stack frame. */
  popStack: () => StackFrame | undefined;
  /** Read-only view of the currently buffered call stack. */
  readonly callStack: readonly StackFrame[];
  /** Read-only view of frames emitted so far. */
  readonly frames: readonly Frame[];
}

export interface EmitterController extends Emitter {
  /** Drain the buffered frames and reset the emitter for re-use. */
  drain: () => Frame[];
}

/**
 * Create a fresh {@link EmitterController}. The returned object is
 * stateful — one per algorithm run.
 */
export function createEmitter(): EmitterController {
  const frames: Frame[] = [];
  const stack: StackFrame[] = [];

  const attachStack = (frame: Frame): Frame =>
    stack.length > 0 ? { ...frame, callStack: [...stack] } : frame;

  const emit = (frame: Frame) => {
    frames.push(attachStack(frame));
  };

  const controller: EmitterController = {
    emit,
    explain(message, extra) {
      emit({ ...(extra ?? {}), explain: message });
    },
    snapshot(array, extra) {
      emit({ ...(extra ?? {}), array: [...array] });
    },
    pushStack(frame) {
      stack.push(frame);
    },
    popStack() {
      return stack.pop();
    },
    get callStack() {
      return stack;
    },
    get frames() {
      return frames;
    },
    drain() {
      const out = frames.slice();
      frames.length = 0;
      stack.length = 0;
      return out;
    },
  };

  return controller;
}

/**
 * Signature authored algorithms must implement. Receives the input and
 * a fresh {@link Emitter}; returns nothing. All output happens via
 * `emit()`.
 */
export type AuthoredAlgorithm<TInput = unknown> = (
  input: TInput,
  emitter: Emitter
) => void;

/**
 * Run an {@link AuthoredAlgorithm} synchronously and collect the
 * emitted frames. Errors are surfaced to the caller; the partial frame
 * buffer up to the error is also returned for debugging.
 */
export function runAuthored<TInput>(
  algorithm: AuthoredAlgorithm<TInput>,
  input: TInput
): { frames: Frame[]; error: Error | null } {
  const emitter = createEmitter();
  try {
    algorithm(input, emitter);
    return { frames: emitter.drain(), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { frames: emitter.drain(), error };
  }
}
