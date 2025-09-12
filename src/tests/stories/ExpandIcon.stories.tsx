import type { Meta, StoryObj, StoryFn } from "@storybook/react-vite";

import ExpandIcon from "../../components/ui/ExpandIcon";
import { ThemeProvider } from "../../theme/ThemeProvider";

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
    (Story) => (
      <ThemeProvider>
        <div className="p-4">
          <Story />
        </div>
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
        <ExpandIcon className="w-3 h-3" />
        <ExpandIcon className="w-4 h-4" />
        <ExpandIcon className="w-6 h-6" />
        <ExpandIcon className="w-8 h-8" />
        <ExpandIcon className="w-12 h-12" />
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
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
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
    (Story: StoryFn) => (
      <div className="dark">
        <ThemeProvider>
          <div className="p-4 bg-slate-900 min-h-[100px] flex items-center justify-center">
            <Story />
          </div>
        </ThemeProvider>
      </div>
    ),
  ],
};
