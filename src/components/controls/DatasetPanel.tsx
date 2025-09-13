import { useEffect, useMemo, useState } from "react";

import { useI18n } from "@/i18n";
import {
  makeDuplicatesArray,
  makeFewUniqueArray,
  makeGaussianArray,
  makeNearlySortedArrayDir,
  makeRandomArray,
  makeReversedArray,
  makeSawtoothArray,
  makeSortedArray,
  parseCustomInput,
} from "@/utils";

/** Small icon button that shows a toast near the icon */
function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void | string | Promise<void | string>;
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<string | null>(null);
  async function handle() {
    const res = await onClick();
    setToast(typeof res === "string" ? res : "Done");
    setTimeout(() => setToast(null), 1200);
  }
  return (
    <span className="relative inline-flex">
      <button title={title} onClick={handle} className="icon-btn">
        {children}
      </button>
      {toast && (
        <span
          aria-live="polite"
          className="absolute -top-6 right-0 rounded bg-black/80 px-2 py-[2px] text-[11px] text-white shadow"
        >
          {toast}
        </span>
      )}
    </span>
  );
}

const CopySvg = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
    <path
      d="M9 9a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V9Z"
      fill="currentColor"
      opacity=".2"
    />
    <path
      d="M15 5H7a2 2 0 0 0-2 2v10"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <rect
      x="9"
      y="9"
      width="10"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const PasteSvg = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
    <path d="M8 4h8v3H8z" fill="currentColor" opacity=".2" />
    <rect
      x="6"
      y="4"
      width="12"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path d="M9 12h6m-6 4h6m-6-8h6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M6 9l6 6 6-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type Props = { value: number[]; onChange: (next: number[]) => void };
type Dist =
  | "random"
  | "gaussian"
  | "sortedInc"
  | "sortedDec"
  | "nearlyInc"
  | "nearlyDec"
  | "reversed"
  | "few"
  | "duplicates"
  | "sawtooth"
  | "custom";

type SeedMode = "fixed" | "random";

export default function DatasetPanel({ value, onChange }: Props) {
  const { t } = useI18n();
  const [n, setN] = useState<number>(value.length || 16);
  const [min, setMin] = useState(5);
  const [max, setMax] = useState(99);
  const [seed, setSeed] = useState<number>(42);

  // DEFAULT: new random on every Generate
  const [seedMode, setSeedMode] = useState<SeedMode>("random");

  const [dist, setDist] = useState<Dist>("random");
  const [uniques, setUniques] = useState(5);
  const [period, setPeriod] = useState(5);
  const [customText, setCustomText] = useState("");

  // Collapse / expand
  const [open, setOpen] = useState(true);

  useEffect(() => setN(value.length || 16), [value.length]);

  const previewText = useMemo(() => value.join(", "), [value]);

  function nextRandomSeed() {
    return Math.floor(Math.random() * 1_000_000_000);
  }

  function gen() {
    const effSeed = seedMode === "fixed" ? seed : nextRandomSeed();

    let arr: number[] = [];
    switch (dist) {
      case "random":
        arr = makeRandomArray(n, min, max, effSeed);
        break;
      case "gaussian":
        arr = makeGaussianArray(n, min, max, effSeed);
        break;
      case "sortedInc":
        arr = makeSortedArray(n, min, max, effSeed, "inc");
        break;
      case "sortedDec":
        arr = makeSortedArray(n, min, max, effSeed, "dec");
        break;
      case "nearlyInc":
        arr = makeNearlySortedArrayDir(n, min, max, effSeed, "inc");
        break;
      case "nearlyDec":
        arr = makeNearlySortedArrayDir(n, min, max, effSeed, "dec");
        break;
      case "reversed":
        arr = makeReversedArray(n, min, max, effSeed);
        break;
      case "few":
        arr = makeFewUniqueArray(n, min, max, effSeed, Math.max(2, uniques));
        break;
      case "duplicates":
        arr = makeDuplicatesArray(n, min, max, effSeed, 2);
        break;
      case "sawtooth":
        arr = makeSawtoothArray(n, min, max, Math.max(2, period)); // period-driven
        break;
      case "custom":
        arr = parseCustomInput(customText);
        setN(arr.length);
        break;
    }

    if (seedMode === "random") setSeed(effSeed);
    onChange(arr);
  }

  async function copyNumbers() {
    try {
      await navigator.clipboard.writeText(previewText);
      return "Copied!";
    } catch {
      return "Copy blocked";
    }
  }

  async function pasteToCustom() {
    try {
      const t = await navigator.clipboard.readText();
      const sanitized = (t ?? "").replace(/[^\d,\s-]+/g, "");
      setCustomText(sanitized);
      setDist("custom");
      return "Pasted!";
    } catch {
      return "Paste blocked";
    }
  }

  function onCustomChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const s = e.target.value.replace(/[^\d,\s-]+/g, "");
    setCustomText(s);
  }

  return (
    <div className="card min-w-0 text-sm">
      {/* Header with collapse/expand */}
      <div className="flex items-center justify-between">
        <div className="panel-title font-medium">
          {t("controls.dataset", { defaultValue: "Dataset" })}
        </div>
        <button
          className="inline-flex items-center justify-center rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="dataset-body"
          title={
            open
              ? t("common.collapse", { defaultValue: "Collapse" })
              : t("common.expand", { defaultValue: "Expand" })
          }
        >
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
          <span className="sr-only">
            {open
              ? t("common.collapse", { defaultValue: "Collapse" })
              : t("common.expand", { defaultValue: "Expand" })}
          </span>
        </button>
      </div>

      {!open ? null : (
        <div id="dataset-body" className="mt-2 grid min-w-0 gap-2">
          {/* Size */}
          <div className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2">
            <span className="panel-muted w-24 shrink-0">
              {t("controls.size", { defaultValue: "Size" })}
            </span>
            <input
              type="range"
              min={4}
              max={256}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min={1}
              max={1024}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="ui-input w-16 shrink-0"
            />
          </div>

          {/* Range */}
          <label className="flex min-w-0 items-center gap-2">
            <span className="panel-muted w-24 shrink-0">
              {t("controls.range", { defaultValue: "Range" })}
            </span>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className="ui-input w-16 shrink-0"
            />
            <span className="panel-muted shrink-0">to</span>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="ui-input w-16 shrink-0"
            />
          </label>

          {/* Seed */}
          <label className="flex min-w-0 items-center gap-2">
            <span className="panel-muted w-24 shrink-0">
              {t("controls.seed", { defaultValue: "Seed" })}
            </span>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="ui-input w-28 shrink-0"
            />
          </label>

          <div className="flex min-w-0 flex-wrap items-center gap-2 pl-24">
            <span className="panel-muted text-xs font-semibold">
              {t("controls.mode", { defaultValue: "Mode" })}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={`seg-btn ${seedMode === "fixed" ? "on" : ""}`}
                onClick={() => setSeedMode("fixed")}
                title={t("controls.fixedSeedTooltip", {
                  defaultValue: "Use the same seed every time you Generate",
                })}
                aria-pressed={seedMode === "fixed"}
              >
                {t("controls.fixed", { defaultValue: "Fixed" })}
              </button>
              <button
                className={`seg-btn ${seedMode === "random" ? "on" : ""}`}
                onClick={() => setSeedMode("random")}
                title={t("controls.randomSeedTooltip", {
                  defaultValue: "Use a new random seed on every Generate",
                })}
                aria-pressed={seedMode === "random"}
              >
                {t("controls.random", { defaultValue: "Random" })}
              </button>
            </div>
          </div>

          {/* Type */}
          <div className="grid min-w-0 gap-2">
            <div className="panel-muted text-xs font-semibold">Type</div>
            <select
              value={dist}
              onChange={(e) => setDist(e.target.value as Dist)}
              className="ui-select w-full"
            >
              <optgroup
                label={t("controls.distributions.basic", {
                  defaultValue: "Basic",
                })}
              >
                <option value="random">
                  {t("controls.distributions.random", {
                    defaultValue: "Random",
                  })}
                </option>
                <option value="gaussian">
                  {t("controls.distributions.gaussian", {
                    defaultValue: "Gaussian",
                  })}
                </option>
                <option value="reversed">
                  {t("controls.distributions.reversed", {
                    defaultValue: "Reversed",
                  })}
                </option>
              </optgroup>
              <optgroup
                label={t("controls.distributions.sorted", {
                  defaultValue: "Sorted",
                })}
              >
                <option value="sortedInc">
                  {t("controls.distributions.sortedInc", {
                    defaultValue: "Sorted (inc)",
                  })}
                </option>
                <option value="sortedDec">
                  {t("controls.distributions.sortedDec", {
                    defaultValue: "Sorted (dec)",
                  })}
                </option>
                <option value="nearlyInc">
                  {t("controls.distributions.nearlyInc", {
                    defaultValue: "Nearly sorted (inc)",
                  })}
                </option>
                <option value="nearlyDec">
                  {t("controls.distributions.nearlyDec", {
                    defaultValue: "Nearly sorted (dec)",
                  })}
                </option>
              </optgroup>
              <optgroup
                label={t("controls.distributions.duplicates", {
                  defaultValue: "Duplicates",
                })}
              >
                <option value="few">
                  {t("controls.distributions.few", {
                    defaultValue: "Few-unique",
                  })}
                </option>
                <option value="duplicates">
                  {t("controls.distributions.duplicatesValue", {
                    defaultValue: "Duplicates (2 values)",
                  })}
                </option>
              </optgroup>
              <optgroup
                label={t("controls.distributions.patterns", {
                  defaultValue: "Patterns",
                })}
              >
                <option value="sawtooth">
                  {t("controls.distributions.sawtooth", {
                    defaultValue: "Sawtooth",
                  })}
                </option>
              </optgroup>
              <optgroup
                label={t("controls.distributions.custom", {
                  defaultValue: "Custom",
                })}
              >
                <option value="custom">
                  {t("controls.distributions.customOption", {
                    defaultValue: "Custom",
                  })}
                </option>
              </optgroup>
            </select>
          </div>

          {dist === "few" && (
            <label className="flex min-w-0 items-center gap-2">
              <span className="panel-muted w-24 shrink-0">
                {t("controls.uniques", { defaultValue: "Uniques" })}
              </span>
              <input
                type="number"
                min={2}
                max={20}
                value={uniques}
                onChange={(e) => setUniques(Number(e.target.value))}
                className="ui-input w-16 shrink-0"
              />
            </label>
          )}
          {dist === "sawtooth" && (
            <label className="flex min-w-0 items-center gap-2">
              <span className="panel-muted w-24 shrink-0">
                {t("controls.period", { defaultValue: "Period" })}
              </span>
              <input
                type="number"
                min={2}
                max={64}
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="ui-input w-16 shrink-0"
              />
            </label>
          )}

          {dist === "custom" && (
            <div className="grid min-w-0 gap-1">
              <div className="flex items-center justify-between">
                <span className="panel-title">
                  {t("controls.customNumbers", {
                    defaultValue: "Custom numbers",
                  })}
                </span>
                <IconButton
                  title={t("controls.pasteFromClipboard", {
                    defaultValue: "Paste from clipboard",
                  })}
                  onClick={pasteToCustom}
                >
                  <PasteSvg />
                </IconButton>
              </div>
              <textarea
                className="ui-textarea"
                placeholder={t("controls.customPlaceholder", {
                  defaultValue:
                    "e.g. 5, 12, 9, 3  (numbers, commas, spaces, minus)",
                })}
                value={customText}
                onChange={onCustomChange}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white shadow-sm hover:bg-indigo-500"
              onClick={gen}
              title={
                seedMode === "fixed"
                  ? t("controls.generateWithSeed", {
                      defaultValue: "Generate (seed {{seed}})",
                      seed,
                    })
                  : t("controls.generateRandomSeed", {
                      defaultValue: "Generate (random seed each time)",
                    })
              }
            >
              {t("controls.generate", { defaultValue: "Generate" })}
            </button>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-between">
            <div className="panel-muted text-xs font-semibold">
              {t("controls.numbers", { defaultValue: "Numbers" })}
            </div>
            <IconButton
              title={t("controls.copyNumbers", {
                defaultValue: "Copy numbers",
              })}
              onClick={copyNumbers}
            >
              <CopySvg />
            </IconButton>
          </div>
          <div className="box-border max-h-28 w-full overflow-auto rounded border bg-slate-50 p-2 font-mono text-xs break-words whitespace-pre-wrap text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {previewText || "—"}
          </div>
        </div>
      )}
    </div>
  );
}
