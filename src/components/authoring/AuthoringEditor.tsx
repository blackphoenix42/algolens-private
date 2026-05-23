// src/components/authoring/AuthoringEditor.tsx
import { useCallback, useId, useMemo, useState } from "react";

import type { RunResult } from "@/authoring";
import { compileAndRun } from "@/authoring";
import { useI18n } from "@/i18n";

const DEFAULT_SOURCE = `// Authored algorithm. \`run(input, emitter)\` is the entry point.
// Use emitter.emit({...}) / emitter.explain(...) / emitter.snapshot(arr).
function run(input, emitter) {
  const arr = [...input];
  emitter.snapshot(arr, { explain: "Start" });
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      emitter.emit({
        array: [...arr],
        highlights: { compared: [j, j + 1] },
        explain: \`Compare \${arr[j]} and \${arr[j + 1]}\`,
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        emitter.emit({
          array: [...arr],
          highlights: { swapped: [j, j + 1] },
          explain: "Swap",
        });
      }
    }
  }
  emitter.snapshot(arr, { explain: "Done" });
}
`;

const DEFAULT_INPUT_JSON = "[5, 2, 4, 1, 3]";

export interface AuthoringEditorProps {
  /** Initial source code shown in the editor. */
  initialSource?: string;
  /** Initial input JSON shown in the input box. */
  initialInputJson?: string;
  /** Called whenever the user successfully runs the code. */
  onRun?: (result: RunResult) => void;
}

/**
 * Minimal in-app authoring editor.
 *
 * - Plain `<textarea>` for source code (no Monaco dependency).
 * - JSON-encoded input box.
 * - "Run" button compiles + executes the source against the input and
 *   reports the number of frames emitted plus any error.
 *
 * SECURITY: code runs in the *current* browser context via `new Function`.
 * Only use with code the user authored themselves.
 */
export default function AuthoringEditor({
  initialSource = DEFAULT_SOURCE,
  initialInputJson = DEFAULT_INPUT_JSON,
  onRun,
}: AuthoringEditorProps) {
  const { t } = useI18n();
  const [source, setSource] = useState(initialSource);
  const [inputJson, setInputJson] = useState(initialInputJson);
  const [result, setResult] = useState<RunResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const sourceId = useId();
  const inputId = useId();
  const statusId = useId();

  const handleRun = useCallback(() => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(inputJson);
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Failed to parse input JSON"
      );
      setResult(null);
      return;
    }
    setParseError(null);
    const r = compileAndRun(source, parsed);
    setResult(r);
    onRun?.(r);
  }, [source, inputJson, onRun]);

  const statusMessage = useMemo(() => {
    if (parseError)
      return t("authoring.parseError", {
        message: parseError,
        defaultValue: `Input error: ${parseError}`,
      });
    if (!result) return t("authoring.ready", { defaultValue: "Ready." });
    if (result.error)
      return t("authoring.runtimeError", {
        message: result.error.message,
        defaultValue: `Error: ${result.error.message}`,
      });
    const ms = result.durationMs.toFixed(1);
    return result.frames.length === 1
      ? t("authoring.frameEmitted", {
          ms,
          defaultValue: `1 frame in ${ms}ms`,
        })
      : t("authoring.framesEmitted", {
          count: result.frames.length,
          ms,
          defaultValue: `${result.frames.length} frames in ${ms}ms`,
        });
  }, [parseError, result, t]);

  return (
    <section
      aria-label={t("authoring.title", { defaultValue: "Authoring editor" })}
      className="flex h-full flex-col gap-3 p-3"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={sourceId} className="text-xs font-semibold uppercase">
          {t("authoring.sourceCode", { defaultValue: "Source code" })}
        </label>
        <textarea
          id={sourceId}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          className="h-64 w-full resize-y rounded border border-slate-300 bg-slate-50 p-2 font-mono text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-xs font-semibold uppercase">
          {t("authoring.input", { defaultValue: "Input (JSON)" })}
        </label>
        <textarea
          id={inputId}
          value={inputJson}
          onChange={(e) => setInputJson(e.target.value)}
          spellCheck={false}
          className="h-16 w-full resize-y rounded border border-slate-300 bg-slate-50 p-2 font-mono text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleRun}
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t("authoring.run", { defaultValue: "Run" })}
        </button>
        <p
          id={statusId}
          role="status"
          aria-live="polite"
          className="text-xs text-slate-700 dark:text-slate-300"
        >
          {statusMessage}
        </p>
      </div>
    </section>
  );
}
