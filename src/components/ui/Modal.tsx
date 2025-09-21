import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-[1px] dark:bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="z-[70] max-h-[85vh] w-[90vw] max-w-3xl overflow-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div
            id={titleId}
            className="font-semibold text-slate-900 dark:text-slate-50"
          >
            {title}
          </div>
          <button
            className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-900 hover:bg-slate-100 focus:ring-2 focus:ring-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:focus:ring-slate-600"
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Higher contrast body in dark mode */}
        <div className="p-4 text-[15px] leading-7 text-slate-800 dark:text-slate-100">
          <div className="modal-body space-y-3">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
