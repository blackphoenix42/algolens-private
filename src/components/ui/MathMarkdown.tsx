import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex"; // render math
import remarkGfm from "remark-gfm"; // tables, lists, strikethrough
import remarkMath from "remark-math"; // $...$ and $$...$$

import "katex/dist/katex.min.css";

export default function MathMarkdown({ children }: { children: string }) {
  return (
    <div className="markdown text-slate-900 dark:text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Shift markdown headings down one level so pages retain a single
          // top-level <h1> and maintain proper heading order for a11y.
          h1: (p) => <h2 className="text-xl font-bold mt-2 mb-2" {...p} />,
          h2: (p) => <h3 className="text-lg font-semibold mt-3 mb-2" {...p} />,
          h3: (p) => (
            <h4 className="text-base font-semibold mt-3 mb-2" {...p} />
          ),
          h4: (p) => <h5 className="text-sm font-semibold mt-3 mb-2" {...p} />,
          h5: (p) => <h6 className="text-sm font-semibold mt-3 mb-2" {...p} />,
          h6: (p) => <h6 className="text-sm font-semibold mt-3 mb-2" {...p} />,
          p: (p) => <p className="mt-2 mb-2" {...p} />,
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            return isInline ? (
              <code
                className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-1 py-0.5 text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm font-mono" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: (p) => (
            <blockquote
              className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-4"
              {...p}
            />
          ),
          ul: (p) => <ul className="list-disc list-inside my-4" {...p} />,
          ol: (p) => <ol className="list-decimal list-inside my-4" {...p} />,
          li: (p) => <li className="my-1" {...p} />,
          a: (p) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline"
              {...p}
            />
          ),
          table: (p) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full border border-slate-300 dark:border-slate-600"
                {...p}
              />
            </div>
          ),
          thead: (p) => (
            <thead className="bg-slate-100 dark:bg-slate-800" {...p} />
          ),
          tbody: (p) => <tbody {...p} />,
          tr: (p) => (
            <tr
              className="border-b border-slate-200 dark:border-slate-700"
              {...p}
            />
          ),
          th: (p) => (
            <th
              className="px-4 py-2 text-left font-semibold border-r border-slate-200 dark:border-slate-700 last:border-r-0"
              {...p}
            />
          ),
          td: (p) => (
            <td
              className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 last:border-r-0"
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
