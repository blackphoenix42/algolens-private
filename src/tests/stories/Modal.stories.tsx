import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import Modal from "../../components/ui/Modal";
import { ThemeProvider } from "../../providers/ThemeProvider";

const meta: Meta<typeof Modal> = {
  component: Modal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A modal dialog component with backdrop and keyboard controls.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle modal state
const ModalWrapper = ({
  title,
  children,
  ...args
}: { title: string; children: React.ReactNode } & Record<string, unknown>) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 p-8 dark:bg-gray-900">
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Open Modal
      </button>
      <Modal {...args} open={open} onClose={() => setOpen(false)} title={title}>
        {children}
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: (args: React.ComponentProps<typeof Modal>) => (
    <ModalWrapper {...args}>
      <p>This is the modal content. It can contain any React components.</p>
      <p>
        Press <kbd>Escape</kbd> or click the close button to close the modal.
      </p>
    </ModalWrapper>
  ),
  args: {
    title: "Example Modal",
  },
};

export const LongContent: Story = {
  render: (args: React.ComponentProps<typeof Modal>) => (
    <ModalWrapper {...args}>
      <h3 className="mb-4 text-lg font-semibold">Lorem Ipsum</h3>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <p>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat.
      </p>
      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur.
      </p>
      <p>
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium.
      </p>
      <p>
        Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
        architecto beatae vitae dicta sunt.
      </p>
      <p>
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
        fugit, sed quia consequuntur magni.
      </p>
      <p>
        Dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam
        est qui dolorem ipsum quia.
      </p>
    </ModalWrapper>
  ),
  args: {
    title: "Modal with Long Content",
  },
};

export const WithForm: Story = {
  render: (args: React.ComponentProps<typeof Modal>) => (
    <ModalWrapper {...args}>
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            placeholder="Enter your message"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </ModalWrapper>
  ),
  args: {
    title: "Contact Form",
  },
};
