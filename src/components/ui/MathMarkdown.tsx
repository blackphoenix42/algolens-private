import "katex/dist/katex.min.css";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex"; // render math
import remarkGfm from "remark-gfm"; // tables, lists, strikethrough
import remarkMath from "remark-math"; // $...$ and $$...$$

export default function MathMarkdown({ children }: { children: string }) {
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
          h4: (p) => <h5 className="mt-3 mb-2 text-sm font-semibold" {...p} />,
          h5: (p) => <h6 className="mt-3 mb-2 text-sm font-semibold" {...p} />,
          h6: (p) => <h6 className="mt-3 mb-2 text-sm font-semibold" {...p} />,
          p: (p) => <p className="mt-2 mb-2" {...p} />,
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            return isInline ? (
              <code
                className="rounded bg-slate-200 px-1 py-0.5 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="overflow-x-auto rounded-lg bg-slate-100 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <code className="font-mono text-sm" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: (p) => (
            <blockquote
              className="my-4 border-l-4 border-slate-300 pl-4 italic dark:border-slate-600"
              {...p}
            />
          ),
          ul: (p) => <ul className="my-4 list-inside list-disc" {...p} />,
          ol: (p) => <ol className="my-4 list-inside list-decimal" {...p} />,
          li: (p) => <li className="my-1" {...p} />,
          a: (p) => (
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              {...p}
            />
          ),
          table: (p) => (
            <div className="my-4 overflow-x-auto">
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
              className="border-r border-slate-200 px-4 py-2 text-left font-semibold last:border-r-0 dark:border-slate-700"
              {...p}
            />
          ),
          td: (p) => (
            <td
              className="border-r border-slate-200 px-4 py-2 last:border-r-0 dark:border-slate-700"
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
