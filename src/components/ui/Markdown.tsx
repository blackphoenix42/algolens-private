import "katex/dist/katex.min.css";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex"; // render math
import remarkGfm from "remark-gfm"; // tables, lists, strikethrough
import remarkMath from "remark-math"; // $...$ and $$...$$

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown text-slate-900 dark:text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Shift markdown headings down one level so pages retain a single
          // top-level <h1> and maintain proper heading order for a11y.
          h1: (p) => <h2 className="mt-2 mb-2 text-xl font-bold" {...p} />,
          h2: (p) => <h3 className="mt-3 mb-2 text-lg font-semibold" {...p} />,
          h3: (p) => (
            <h4 className="mt-3 mb-2 text-base font-semibold" {...p} />
          ),
          h4: (p) => (
            <h5 className="mt-3 mb-2 text-base font-semibold" {...p} />
          ),
          h5: (p) => <h6 className="mt-3 mb-2 text-sm font-semibold" {...p} />,
          h6: (p) => <h6 className="mt-3 mb-2 text-sm font-semibold" {...p} />,
          p: (p) => <p className="mb-2 leading-7" {...p} />,
          ul: (p) => <ul className="mb-2 list-disc space-y-1 pl-5" {...p} />,
          ol: (p) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...p} />,
          code: ({
            inline,
            ...p
          }: { inline?: boolean } & React.HTMLAttributes<HTMLElement>) =>
            inline ? (
              <code
                className="rounded bg-slate-100 px-1 dark:bg-slate-800"
                {...p}
              />
            ) : (
              <code
                className="block overflow-x-auto rounded bg-slate-100 p-2 dark:bg-slate-800"
                {...p}
              />
            ),
          table: (p) => (
            <table className="my-2 w-full border-collapse" {...p} />
          ),
          th: (p) => (
            <th
              className="border border-slate-200 bg-slate-50 px-2 py-1 text-left dark:border-slate-700 dark:bg-slate-800"
              {...p}
            />
          ),
          td: (p) => (
            <td
              className="border border-slate-200 px-2 py-1 align-top dark:border-slate-700"
              {...p}
            />
          ),
          blockquote: (p) => (
            <blockquote
              className="border-l-4 border-slate-300 pl-3 text-slate-600 italic dark:border-slate-700 dark:text-slate-300"
              {...p}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
