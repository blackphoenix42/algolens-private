import React, { lazy, Suspense } from "react";

// Lazy load the markdown component with KaTeX
const LazyMarkdownWithMath = lazy(async () => {
  // Dynamically import KaTeX CSS and components
  await import("katex/dist/katex.min.css");
  const [ReactMarkdown, rehypeKatex, remarkGfm, remarkMath] = await Promise.all(
    [
      import("react-markdown").then((m) => m.default),
      import("rehype-katex").then((m) => m.default),
      import("remark-gfm").then((m) => m.default),
      import("remark-math").then((m) => m.default),
    ]
  );

  return {
    default: ({ children }: { children: string }) => (
      <div className="markdown text-slate-900 dark:text-slate-100">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            // Shift markdown headings down one level so pages retain a single
            // top-level <h1> and maintain proper heading order for a11y.
            h1: (p) => <h2 className="mt-2 mb-2 text-xl font-bold" {...p} />,
            h2: (p) => (
              <h3 className="mt-3 mb-2 text-lg font-semibold" {...p} />
            ),
            h3: (p) => (
              <h4 className="mt-3 mb-2 text-base font-semibold" {...p} />
            ),
            h4: (p) => (
              <h5 className="mt-3 mb-2 text-base font-semibold" {...p} />
            ),
            h5: (p) => (
              <h6 className="mt-3 mb-2 text-sm font-semibold" {...p} />
            ),
            h6: (p) => (
              <h6 className="mt-3 mb-2 text-sm font-semibold" {...p} />
            ),
            p: (p) => <p className="mb-2 leading-7" {...p} />,
            ul: (p) => <ul className="mb-2 list-disc space-y-1 pl-5" {...p} />,
            ol: (p) => (
              <ol className="mb-2 list-decimal space-y-1 pl-5" {...p} />
            ),
            li: (p) => <li className="leading-7" {...p} />,
            a: (p) => (
              <a
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                {...p}
              />
            ),
            blockquote: (p) => (
              <blockquote className="my-4 border-l-4 border-slate-300 bg-slate-50 py-2 pl-4 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {p.children}
              </blockquote>
            ),
            code: (props) => {
              const { className, children, node, ..._restProps } = props;
              const inline =
                node &&
                node.tagName === "code" &&
                node.properties &&
                node.properties.inline;
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <pre className="my-4 overflow-x-auto rounded bg-slate-900 p-4 text-slate-100">
                  <code className={className} {..._restProps}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code
                  className="rounded bg-slate-200 px-1 py-0.5 text-sm dark:bg-slate-700"
                  {..._restProps}
                >
                  {children}
                </code>
              );
            },
            table: (p) => (
              <div className="my-4 overflow-x-auto">
                <table className="w-full border-collapse" {...p} />
              </div>
            ),
            thead: (p) => (
              <thead className="bg-slate-100 dark:bg-slate-800" {...p} />
            ),
            th: (p) => (
              <th
                className="border border-slate-300 px-4 py-2 text-left font-semibold dark:border-slate-600"
                {...p}
              />
            ),
            td: (p) => (
              <td
                className="border border-slate-300 px-4 py-2 dark:border-slate-600"
                {...p}
              />
            ),
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    ),
  };
});

export default function Markdown({ children }: { children: string }) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="mb-2 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="mb-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="mb-2 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
      }
    >
      <LazyMarkdownWithMath>{children}</LazyMarkdownWithMath>
    </Suspense>
  );
}
