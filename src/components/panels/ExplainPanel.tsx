import { useState } from "react";

import { ExpandIcon } from "@/components/ui/Icons";
import Modal from "@/components/ui/Modal";
import type { AlgoMeta } from "@/types/algorithms";

export default function ExplainPanel({
  meta,
  explain,
}: {
  meta: AlgoMeta;
  explain?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card relative">
      <div className="flex items-center justify-between">
        <div className="mb-2 text-sm font-medium">Explanation</div>
        <button
          className="rounded border px-2 py-1"
          onClick={() => setOpen(true)}
          title="Expand"
        >
          <ExpandIcon />
        </button>
      </div>
      <p className="min-h-[3rem] text-sm text-gray-800">
        {explain ?? "Step through to see explanations for each action."}
      </p>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${meta.title} — Explanation`}
      >
        <p className="text-sm text-gray-800">
          {explain ?? "Step to see explanation."}
        </p>
      </Modal>
    </div>
  );
}
