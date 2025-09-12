import type { Meta, StoryObj, StoryFn } from "@storybook/react-vite";

import HomeButton, { HomeIcon } from "../../components/ui/HomeButton";
import { ThemeProvider } from "../../theme/ThemeProvider";

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
    (Story: StoryFn) => (
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

// Story for the HomeIcon component separately
export const IconOnly: Story = {
  render: () => (
    <ThemeProvider>
      <div className="flex items-center space-x-4">
        <HomeIcon />
        <HomeIcon className="w-6 h-6" />
        <HomeIcon className="w-8 h-8" />
        <HomeIcon className="w-12 h-12" />
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
