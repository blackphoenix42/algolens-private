// src/components/panels/AboutPanel.tsx
import { useState } from "react";

import { ExpandIcon } from "@/components/ui/Icons";
import LazyMarkdown from "@/components/ui/LazyMarkdown";
import Modal from "@/components/ui/Modal";
import type { AlgoMeta } from "@/types/algorithms";

import { useI18n } from "../../i18n/hooks";

/** Simple chevron that rotates when collapsed/expanded */
function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-200 ${
        open ? "rotate-180" : "rotate-0"
      }`}
      aria-hidden
    >
      <path
        d="M8 10l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AboutPanel({
  meta,
  isMobile = false,
}: {
  meta: AlgoMeta;
  isMobile?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(isMobile);
  const { t } = useI18n();
  const { complexity: c } = meta;

  return (
    <div className="card relative min-w-0 text-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="panel-title font-medium text-slate-900 dark:text-slate-100">
            {meta.title}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && (
            <button
              className="rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
              onClick={() => setModalOpen(true)}
              title="Open in modal"
            >
              <ExpandIcon />
            </button>
          )}
          <button
            className="inline-flex items-center justify-center rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-controls="about-body"
            title={
              collapsed
                ? t("controls.expand", { defaultValue: "Expand" })
                : t("controls.collapse", { defaultValue: "Collapse" })
            }
          >
            <ChevronDownIcon open={!collapsed} />
            <span className="sr-only">
              {collapsed
                ? t("controls.expand", { defaultValue: "Expand" })
                : t("controls.collapse", { defaultValue: "Collapse" })}
            </span>
          </button>
        </div>
      </div>

      {/* Body (collapsible) */}
      {!collapsed && (
        <div id="about-body" className="space-y-3">
          {/* About content (markdown) or summary fallback */}
          {meta.about ? (
            <LazyMarkdown>{meta.about}</LazyMarkdown>
          ) : (
            <p className="text-slate-800 dark:text-slate-100">{meta.summary}</p>
          )}

          {/* Compact stats table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="pr-4 text-slate-700 dark:text-slate-300">
                    {t("complexity.bestTime", { defaultValue: "Best time" })}
                  </td>
                  <td className="text-slate-900 dark:text-slate-100">
                    {c.time.best}
                  </td>
                </tr>
                <tr>
                  <td className="pr-4 text-slate-700 dark:text-slate-300">
                    {t("complexity.averageTime", {
                      defaultValue: "Average time",
                    })}
                  </td>
                  <td className="text-slate-900 dark:text-slate-100">
                    {c.time.average}
                  </td>
                </tr>
                <tr>
                  <td className="pr-4 text-slate-700 dark:text-slate-300">
                    {t("complexity.worstTime", { defaultValue: "Worst time" })}
                  </td>
                  <td className="text-slate-900 dark:text-slate-100">
                    {c.time.worst}
                  </td>
                </tr>
                <tr>
                  <td className="pr-4 text-slate-700 dark:text-slate-300">
                    {t("complexity.space", { defaultValue: "Space" })}
                  </td>
                  <td className="text-slate-900 dark:text-slate-100">
                    {c.space}
                  </td>
                </tr>
                {typeof c.stable === "boolean" && (
                  <tr>
                    <td className="pr-4 text-slate-700 dark:text-slate-300">
                      {t("complexity.stable", { defaultValue: "Stable" })}
                    </td>
                    <td className="text-slate-900 dark:text-slate-100">
                      {c.stable
                        ? t("common.yes", { defaultValue: "Yes" })
                        : t("common.no", { defaultValue: "No" })}
                    </td>
                  </tr>
                )}
                {typeof c.inPlace === "boolean" && (
                  <tr>
                    <td className="pr-4 text-slate-700 dark:text-slate-300">
                      {t("complexity.inPlace", { defaultValue: "In-place" })}
                    </td>
                    <td className="text-slate-900 dark:text-slate-100">
                      {c.inPlace
                        ? t("common.yes", { defaultValue: "Yes" })
                        : t("common.no", { defaultValue: "No" })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {meta.pros?.length ? (
            <div>
              <div className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t("panels.advantages", { defaultValue: "Advantages" })}
              </div>
              <ul className="list-inside list-disc space-y-1 text-slate-800 dark:text-slate-100">
                {meta.pros.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {meta.cons?.length ? (
            <div>
              <div className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t("panels.disadvantages", { defaultValue: "Disadvantages" })}
              </div>
              <ul className="list-inside list-disc space-y-1 text-slate-800 dark:text-slate-100">
                {meta.cons.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Modal (unchanged) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`About ${meta.title}`}
      >
        <AboutPanelContent meta={meta} />
      </Modal>
    </div>
  );
}

function AboutPanelContent({ meta }: { meta: AlgoMeta }) {
  const c = meta.complexity;
  return (
    <div className="modal-body grid gap-4 text-sm">
      {meta.about ? (
        <LazyMarkdown>{meta.about}</LazyMarkdown>
      ) : (
        <p className="text-slate-800 dark:text-slate-100">{meta.summary}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <td className="pr-4 text-slate-700 dark:text-slate-300">
                Best time
              </td>
              <td className="text-slate-900 dark:text-slate-100">
                {c.time.best}
              </td>
            </tr>
            <tr>
              <td className="pr-4 text-slate-700 dark:text-slate-300">
                Average time
              </td>
              <td className="text-slate-900 dark:text-slate-100">
                {c.time.average}
              </td>
            </tr>
            <tr>
              <td className="pr-4 text-slate-700 dark:text-slate-300">
                Worst time
              </td>
              <td className="text-slate-900 dark:text-slate-100">
                {c.time.worst}
              </td>
            </tr>
            <tr>
              <td className="pr-4 text-slate-700 dark:text-slate-300">Space</td>
              <td className="text-slate-900 dark:text-slate-100">{c.space}</td>
            </tr>
            {typeof c.stable === "boolean" && (
              <tr>
                <td className="pr-4 text-slate-700 dark:text-slate-300">
                  Stable
                </td>
                <td className="text-slate-900 dark:text-slate-100">
                  {c.stable ? "Yes" : "No"}
                </td>
              </tr>
            )}
            {typeof c.inPlace === "boolean" && (
              <tr>
                <td className="pr-4 text-slate-700 dark:text-slate-300">
                  In-place
                </td>
                <td className="text-slate-900 dark:text-slate-100">
                  {c.inPlace ? "Yes" : "No"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta.pros?.length ? (
        <div>
          <div className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Advantages
          </div>
          <ul className="list-inside list-disc space-y-1 text-slate-800 dark:text-slate-100">
            {meta.pros.map((p: string, i: number) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {meta.cons?.length ? (
        <div>
          <div className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Disadvantages
          </div>
          <ul className="list-inside list-disc space-y-1 text-slate-800 dark:text-slate-100">
            {meta.cons.map((p: string, i: number) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
