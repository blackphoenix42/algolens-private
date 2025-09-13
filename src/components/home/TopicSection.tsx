import { useMemo } from "react";

import type { AlgoMeta } from "@/types/algorithms";

import AlgoTile from "./AlgoCard";
import TopicIcon from "./TopicIcon";

type Props = { topic: string; items: AlgoMeta[] };

export default function TopicSection({ topic, items }: Props) {
  const titleMap = useMemo(() => {
    const m: Record<string, { title: string; topic: string }> = {};
    items.forEach((it) => (m[it.slug] = { title: it.title, topic }));
    return m;
  }, [items, topic]);

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <TopicIcon
          topic={topic as React.ComponentProps<typeof TopicIcon>["topic"]}
          className="h-6 w-6 text-gray-700"
        />
        <h2 className="text-xl font-semibold capitalize">{topic}</h2>
      </div>
      {items.length === 0 ? (
        <div className="pl-8 text-sm text-gray-500">Coming soon…</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {items.map((a) => (
            <AlgoTile key={a.slug} topic={topic} item={a} titleMap={titleMap} />
          ))}
        </div>
      )}
    </section>
  );
}
