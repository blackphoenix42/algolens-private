import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";

import HomeButton from "../../components/ui/HomeButton";
import { HomeIcon } from "../../components/ui/Icons";
import { ThemeProvider } from "../../providers/ThemeProvider";

const meta: Meta<typeof HomeButton> = {
  title: "UI/HomeButton",
  component: HomeButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A navigation button that takes users back to the home page.",
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
          <div className="flex min-h-[100px] items-center justify-center bg-slate-900 p-4">
            {Story(context.args, context)}
          </div>
        </ThemeProvider>
      </div>
    ),
  ],
};

// Story for the HomeIcon component separately
export const IconOnly: Story = {
  render: () => (
    <ThemeProvider>
      <div className="flex items-center space-x-4">
        <HomeIcon />
        <HomeIcon className="h-6 w-6" />
        <HomeIcon className="h-8 w-8" />
        <HomeIcon className="h-12 w-12" />
      </div>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "The HomeIcon component in different sizes.",
      },
    },
  },
};
