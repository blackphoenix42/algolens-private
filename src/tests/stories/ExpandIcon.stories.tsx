import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";

import { ExpandIcon } from "../../components/ui/Icons";
import { ThemeProvider } from "../../providers/ThemeProvider";

const meta: Meta<typeof ExpandIcon> = {
  title: "UI/ExpandIcon",
  component: ExpandIcon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "An icon representing expand/fullscreen functionality.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story: StoryFn, context) => (
      <ThemeProvider>
        <div className="p-4">{Story(context.args, context)}</div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const DifferentSizes: Story = {
  render: () => (
    <ThemeProvider>
      <div className="flex items-center space-x-4">
        <ExpandIcon className="h-3 w-3" />
        <ExpandIcon className="h-4 w-4" />
        <ExpandIcon className="h-6 w-6" />
        <ExpandIcon className="h-8 w-8" />
        <ExpandIcon className="h-12 w-12" />
      </div>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "The ExpandIcon component in different sizes.",
      },
    },
  },
};

export const WithButton: Story = {
  render: () => (
    <ThemeProvider>
      <button
        className="inline-flex items-center gap-2 rounded-lg border bg-white/80 px-3 py-2 shadow-sm transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
        title="Expand to fullscreen"
      >
        <ExpandIcon />
        <span className="text-sm">Expand</span>
      </button>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "Example usage of ExpandIcon within a button.",
      },
    },
  },
};

export const InDarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story: StoryFn, context) => (
      <div className="dark">
        <ThemeProvider>
          <div className="flex min-h-[100px] items-center justify-center bg-slate-900 p-4">
            {Story(context.args, context)}
          </div>
        </ThemeProvider>
      </div>
    ),
  ],
};
