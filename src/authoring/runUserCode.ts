/**
 * Compile + run authored algorithm source code.
 *
 * SECURITY NOTE: This uses `new Function`, which evaluates code in the
 * global scope. It is only safe for code the *current user* authored
 * locally in their own browser. Never call this with code received
 * from another user, a URL parameter, or a backend without an explicit
 * sandbox (iframe + sandbox attribute, or a Web Worker).
 *
 * The TS-flavoured source is run as plain JS — we strip the most
 * common type annotations heuristically so beginners can paste TS
 * snippets. A future iteration will swap this for a proper transpile
 * step (esbuild-wasm or sucrase) and a Worker-based sandbox.
 */

import type { AuthoredAlgorithm } from "@/authoring/emit";
import { runAuthored } from "@/authoring/emit";
import type { Frame } from "@/types";

export interface CompileResult {
  algorithm: AuthoredAlgorithm | null;
  error: Error | null;
}

export interface RunResult {
  frames: Frame[];
  error: Error | null;
  durationMs: number;
}

/**
 * Strip a deliberately tiny subset of TypeScript so simple authored
 * snippets compile under `new Function`. This is a *heuristic*, not a
 * real transpiler:
 *
 *  - removes `: type` annotations after identifiers in param lists
 *    and variable declarations
 *  - removes a trailing `: ReturnType` on function declarations
 *  - removes leading `export ` keywords
 *
 * Anything more exotic (generics, interfaces, `as` casts, enums) will
 * fail to parse and produce a clear SyntaxError.
 */
export function stripBasicTypes(source: string): string {
  let out = source;
  // `export function`, `export const`, `export default` → drop `export`
  out = out.replace(/\bexport\s+(default\s+)?/g, "$1");
  // Remove type annotations on params and variables: `: SomeType` until
  // we hit a comma, closing paren, `=`, or end of line. Keep it small
  // and predictable.
  out = out.replace(/:\s*[A-Za-z_$][\w$.<>[\]\s|&,'"]*(?=[,)=\n{])/g, "");
  // Remove `as Type` casts.
  out = out.replace(/\bas\s+[A-Za-z_$][\w$.<>[\]]*\b/g, "");
  return out;
}

/**
 * Compile authored source into an executable algorithm. Returns either
 * a callable algorithm or a parse/runtime error.
 */
export function compileAuthored(source: string): CompileResult {
  try {
    const transpiled = stripBasicTypes(source);
    // The user code is expected to assign to a local `run` function:
    //   function run(input, emit) { ... }
    // We wrap it in a factory so the returned closure exposes `run`.
    const factory = new Function(
      "input",
      "emitter",
      `${transpiled}\n;return typeof run === "function" ? run(input, emitter) : undefined;`
    );
    const algorithm: AuthoredAlgorithm = (input, emitter) => {
      factory(input, emitter);
    };
    return { algorithm, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { algorithm: null, error };
  }
}

/** Compile + run in one shot, with timing. */
export function compileAndRun(source: string, input: unknown): RunResult {
  const t0 =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const { algorithm, error } = compileAuthored(source);
  if (error || !algorithm) {
    return {
      frames: [],
      error,
      durationMs:
        (typeof performance !== "undefined" ? performance.now() : Date.now()) -
        t0,
    };
  }
  const result = runAuthored(algorithm, input);
  const t1 =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  return { frames: result.frames, error: result.error, durationMs: t1 - t0 };
}
