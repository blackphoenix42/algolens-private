# Base UI Components

This directory contains the foundational, reusable UI components that serve as building blocks for the entire AlgoLens application. These components follow design system principles and maintain consistency across the application.

## 📁 Component Categories

### Form Components

- **Button** - Action buttons with variants, sizes, and states
- **Input** - Text inputs with validation and accessibility features
- **Select** - Dropdown selection components
- **Checkbox** - Checkbox inputs with custom styling
- **Radio** - Radio button groups
- **Switch** - Toggle switch components
- **Slider** - Range inputs for numeric values

### Layout Components

- **Card** - Container component for content grouping
- **Modal** - Overlay dialogs and modals
- **Drawer** - Slide-out panels and sidebars
- **Tabs** - Tabbed interface components
- **Accordion** - Collapsible content sections
- **Grid** - Responsive grid layouts
- **Stack** - Flexible spacing containers

### Feedback Components

- **Toast** - Notification messages
- **Alert** - Contextual alerts and warnings
- **Loading** - Loading indicators and spinners
- **Progress** - Progress bars and indicators
- **Badge** - Status badges and labels
- **Tooltip** - Hover information displays

### Data Display

- **Table** - Data tables with sorting and filtering
- **List** - Styled list components
- **Avatar** - User avatar displays
- **Icon** - SVG icon components
- **Image** - Optimized image displays
- **Typography** - Text styling components

## 🎯 Design Principles

### Consistency

- Unified visual language across all components
- Consistent spacing, colors, and typography
- Standardized interaction patterns
- Predictable behavior and feedback

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management and indicators
- Appropriate ARIA attributes

### Flexibility

- Configurable props for customization
- Support for different sizes and variants
- Extensible styling system
- Composition-friendly architecture

### Performance

- Lightweight bundle impact
- Lazy loading where appropriate
- Optimized re-renders
- Tree-shakable exports

## 🔧 Component Architecture

### Base Component Structure

```typescript
// ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';

// ui/Button/Button.types.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ui/Button/Button.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '../Spinner';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',

        // Size variants
        {
          'h-8 px-3 text-xs': size === 'xs',
          'h-9 px-4 text-sm': size === 'sm',
          'h-10 px-6 text-sm': size === 'md',
          'h-11 px-8 text-base': size === 'lg',
          'h-12 px-10 text-lg': size === 'xl',
        },

        // Color variants
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        },

        // Full width
        { 'w-full': fullWidth },

        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
```

### Form Components

#### Input Component

```typescript
// ui/Input/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  label,
  description,
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  id,
  ...props
}, ref) => {
  const inputId = id || useId();

  return (
    <div className={cn('space-y-2', { 'w-full': fullWidth })}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium leading-none">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            {
              'pl-10': leftIcon,
              'pr-10': rightIcon,
              'border-destructive focus-visible:ring-destructive': error,
            },
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>

      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});
```

#### Select Component

```typescript
// ui/Select/Select.tsx
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onValueChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  placeholder,
  disabled,
  error,
  onValueChange,
}) => {
  return (
    <select
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input',
        'bg-background px-3 py-2 text-sm ring-offset-background',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        { 'border-destructive': error }
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};
```

### Layout Components

#### Card Component

```typescript
// ui/Card/Card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'default',
  padding = 'md',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground',
      {
        'border-border': variant === 'default',
        'border-2 border-border': variant === 'outlined',
        'shadow-md': variant === 'elevated',
        'p-0': padding === 'none',
        'p-4': padding === 'sm',
        'p-6': padding === 'md',
        'p-8': padding === 'lg',
      },
      className
    )}
    {...props}
  />
));

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  ...props
}, ref) => (
  <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
));

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
```

#### Modal Component

```typescript
// ui/Modal/Modal.tsx
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, closeOnEscape, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
      />
      <div
        className={cn(
          'relative z-10 w-full max-h-[90vh] overflow-y-auto',
          'bg-background rounded-lg border shadow-lg',
          {
            'max-w-sm': size === 'sm',
            'max-w-md': size === 'md',
            'max-w-lg': size === 'lg',
            'max-w-4xl': size === 'xl',
            'max-w-full h-full': size === 'full',
          }
        )}
      >
        {(title || description) && (
          <div className="p-6 border-b">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
```

### Feedback Components

#### Toast Component

```typescript
// ui/Toast/Toast.tsx
interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  action?: React.ReactNode;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'default',
  action,
  onClose,
}) => {
  return (
    <div
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between',
        'space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        {
          'border bg-background text-foreground': variant === 'default',
          'destructive group border-destructive bg-destructive text-destructive-foreground': variant === 'destructive',
          'border-green-200 bg-green-50 text-green-800': variant === 'success',
          'border-yellow-200 bg-yellow-50 text-yellow-800': variant === 'warning',
        }
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
```

## 🎨 Theming and Customization

### CSS Custom Properties

```css
/* Base theme variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

### Component Variants

```typescript
// ui/Button/variants.ts
export const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  },
};
```

## 🧪 Testing Strategies

### Component Testing

```typescript
// ui/Button/Button.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});
```

### Visual Testing

```typescript
// ui/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
```

## 📱 Responsive Design

### Breakpoint Considerations

```typescript
// Responsive component props
interface ResponsiveProps {
  size?: {
    base?: 'sm' | 'md' | 'lg';
    md?: 'sm' | 'md' | 'lg';
    lg?: 'sm' | 'md' | 'lg';
  };
}

// Usage with responsive utilities
<Button
  className={cn(
    'text-sm md:text-base lg:text-lg',
    'px-4 md:px-6 lg:px-8'
  )}
>
  Responsive Button
</Button>
```

## ♿ Accessibility Features

### Keyboard Navigation

- Tab order management
- Enter/Space key handling
- Arrow key navigation for lists
- Escape key for modals

### Screen Reader Support

- Semantic HTML elements
- ARIA labels and descriptions
- Live regions for dynamic content
- Focus management

### Color and Contrast

- WCAG AA contrast ratios
- Color-blind friendly palettes
- High contrast mode support
- Reduced motion preferences

## 🔗 Related Resources

- **Theme**: `../../theme/` - Design tokens and theme configuration
- **Styles**: `../../styles/` - Global styles and utilities
- **Hooks**: `../../hooks/` - Custom hooks used by components
- **Utils**: `../../lib/utils/` - Utility functions for styling
