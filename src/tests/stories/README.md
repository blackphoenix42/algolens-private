# AlgoLens Storybook Components

This directory contains Storybook stories for all UI components in the AlgoLens project.

## Getting Started

1. **Start Storybook**: `npm run storybook`
2. **Build Storybook**: `npm run build-storybook`

## Writing Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { YourComponent } from './YourComponent';
import { ThemeProvider } from '../../theme/ThemeProvider';

const meta: Meta<typeof YourComponent> = {
  title: 'Category/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
    docs: {
      description: {
        component: 'Description of what this component does.',
      },
    },
  },
  tags: ['autodocs'],
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
  args: {
    // your component props
  },
};
```

### Categories

- **UI/** - Basic UI components (buttons, modals, icons)
- **Canvas/** - Drawing and visualization components
- **Controls/** - Interactive algorithm controls
- **Panels/** - Layout and organizational components
- **Features/** - Higher-level feature components

### Best Practices

1. **Always wrap with ThemeProvider** for consistent theming
2. **Include dark mode variants** when relevant
3. **Add descriptive documentation** in the `docs.description` field
4. **Use proper TypeScript types** - avoid `any`
5. **Include multiple story variants** showing different states
6. **Test accessibility** using the a11y addon

### Theme Support

For components that need to showcase dark/light themes:

```typescript
export const InDarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <ThemeProvider>
          <div className="p-4 bg-slate-900">
            <Story />
          </div>
        </ThemeProvider>
      </div>
    ),
  ],
};
```

### Interactive Stories

For components that need state management:

```typescript
const InteractiveWrapper = () => {
  const [state, setState] = useState(initialState);

  return (
    <YourComponent
      value={state}
      onChange={setState}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveWrapper />,
};
```

## Available Addons

- **Controls** - Interactive prop controls
- **Docs** - Auto-generated documentation
- **Accessibility** - a11y testing
- **Viewport** - Responsive testing
- **Backgrounds** - Theme testing

## File Naming

- Stories: `ComponentName.stories.tsx`
- Place stories next to their components
- Use descriptive story names (Default, WithProps, Loading, etc.)
