import type { Meta, StoryObj, StoryFn } from "@storybook/react-vite";

import ThemeToggle from "../../components/ui/ThemeToggle";
import { ThemeProvider } from "../../providers/ThemeProvider";

const meta: Meta<typeof ThemeToggle> = {
  title: "UI/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A toggle button that switches between light and dark themes.",
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

export const InDarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story: StoryFn, context) => (
      <div className="dark">
        <ThemeProvider>
          <div className="p-4 bg-slate-900 min-h-[100px] flex items-center justify-center">
            {Story(context.args, context)}
          </div>
        </ThemeProvider>
      </div>
    ),
  ],
};

export const InLightMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story: StoryFn, context) => (
      <div className="light">
        <ThemeProvider>
          <div className="p-4 bg-white min-h-[100px] flex items-center justify-center">
            {Story(context.args, context)}
          </div>
        </ThemeProvider>
      </div>
    ),
  ],
};
