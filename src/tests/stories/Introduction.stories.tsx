import type { Meta } from "@storybook/react-vite";

import { ThemeProvider } from "../../providers/ThemeProvider";

const meta: Meta = {
  title: "Introduction",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Welcome to the AlgoLens Component Library! This is a collection of reusable UI components built with React, TypeScript, and Tailwind CSS.",
      },
    },
  },
};

export default meta;

export const Welcome = {
  render: () => (
    <ThemeProvider>
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-6 text-4xl font-bold text-slate-900 dark:text-slate-100">
          Welcome to AlgoLens Storybook
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="mb-6 text-lg">
            This is the component library for AlgoLens, an interactive algorithm
            visualization platform. Here you can explore, test, and document all
            the UI components used throughout the application.
          </p>

          <h2>🚀 Getting Started</h2>
          <p>
            Browse through the components in the sidebar to see examples,
            interact with controls, and view documentation. Each component
            includes multiple stories showing different states and use cases.
          </p>

          <h2>🛠 Technology Stack</h2>
          <ul>
            <li>
              <strong>React 18</strong> - Component framework
            </li>
            <li>
              <strong>TypeScript</strong> - Type safety
            </li>
            <li>
              <strong>Tailwind CSS</strong> - Styling framework
            </li>
            <li>
              <strong>Vite</strong> - Build tool
            </li>
            <li>
              <strong>Storybook</strong> - Component development environment
            </li>
          </ul>

          <h2>🎨 Features</h2>
          <ul>
            <li>Dark/Light theme support</li>
            <li>Responsive design</li>
            <li>Accessibility features</li>
            <li>TypeScript types</li>
            <li>Comprehensive documentation</li>
          </ul>

          <h2>📁 Component Categories</h2>
          <ul>
            <li>
              <strong>UI Components</strong> - Basic interface elements like
              buttons, modals, icons
            </li>
            <li>
              <strong>Canvas Components</strong> - Drawing and visualization
              components
            </li>
            <li>
              <strong>Control Components</strong> - Interactive controls for
              algorithms
            </li>
            <li>
              <strong>Panel Components</strong> - Layout and organizational
              components
            </li>
          </ul>

          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
              💡 Tip
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              Use the controls panel at the bottom to interact with component
              props, and try switching between light and dark themes using the
              theme toggle in the toolbar to see how components adapt.
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  ),
};
