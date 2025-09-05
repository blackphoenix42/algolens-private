# Source Code

This directory contains the main source code for the AlgoLens application. The codebase is built with modern React, TypeScript, and Vite, following a modular architecture pattern.

## 📁 Directory Structure

### Core Application

- **[main.tsx](main.tsx)** - Application entry point and root rendering
- **[app/](app/)** - Application-level configuration (routing, providers)
- **[pages/](pages/)** - Route-based page components
- **[components/](components/)** - Reusable UI components organized by feature

### Business Logic

- **[core/](core/)** - Core algorithm execution engine and data structures
- **[engine/](engine/)** - Algorithm runner and state management
- **[algorithms/](algorithms/)** - Algorithm implementations and definitions
- **[features/](features/)** - Feature-specific modules and logic

### Supporting Systems

- **[hooks/](hooks/)** - Custom React hooks and utilities
- **[store/](store/)** - Global state management (Zustand/Redux)
- **[contexts/](contexts/)** - React context providers and consumers
- **[services/](services/)** - External API integrations and data fetching

### Assets and Styling

- **[assets/](assets/)** - Static assets (images, fonts, icons)
- **[styles/](styles/)** - Global styles and CSS modules
- **[theme/](theme/)** - Design system and theme configuration

### Development and Testing

- **[stories/](stories/)** - Storybook component documentation
- **[tests/](tests/)** - Unit tests and testing utilities
- **[msw/](msw/)** - Mock Service Worker for API mocking

### Utilities and Types

- **[lib/](lib/)** - Utility functions and helper libraries
- **[types/](types/)** - TypeScript type definitions
- **[i18n/](i18n/)** - Internationalization and localization

## 🏗️ Architecture Overview

### Application Flow

```
main.tsx → app/router.tsx → pages/[route].tsx → components/[feature]/
```

### Data Flow

```
User Interaction → hooks/useAlgorithm → core/algorithm → engine/runner → components/visualization
```

### State Management

```
Global State (store/) ↔ React Context (contexts/) ↔ Component State (hooks/)
```

## 🔧 Technology Stack

### Core Technologies

- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework

### State Management

- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Context** - Component-level state sharing

### Testing

- **Vitest** - Unit testing framework
- **Testing Library** - Component testing utilities
- **MSW** - API mocking for tests
- **Storybook** - Component development and documentation

## 📝 Development Guidelines

### File Naming Conventions

```
PascalCase    - Components (Button.tsx, AlgorithmViewer.tsx)
camelCase     - Hooks, utilities (useAlgorithm.ts, formatTime.ts)
kebab-case    - Pages, stories (home-page.tsx, button.stories.tsx)
UPPER_CASE    - Constants (API_ENDPOINTS.ts, THEME_COLORS.ts)
```

### Directory Organization

- Group by feature rather than file type
- Keep related files close together
- Use index files for clean imports
- Separate concerns clearly

### Import Organization

```typescript
// External libraries
import React from "react";
import { useState } from "react";

// Internal utilities and types
import { formatTime } from "@/lib/utils";
import type { Algorithm } from "@/types/algorithm";

// Internal components
import { Button } from "@/components/ui/Button";
import { AlgorithmViewer } from "@/components/algorithm/AlgorithmViewer";

// Relative imports
import "./Component.styles.css";
```

## 🎯 Key Patterns

### Component Structure

```typescript
// Standard component structure
import React from 'react';
import type { ComponentProps } from './Component.types';
import { useComponent } from './Component.hooks';
import './Component.styles.css';

export const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  ...rest
}) => {
  const { state, actions } = useComponent({ prop1, prop2 });

  return (
    <div className="component" {...rest}>
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

### Custom Hook Pattern

```typescript
// Custom hook structure
import { useState, useEffect, useCallback } from "react";
import type { HookParams, HookReturn } from "./hook.types";

export const useCustomHook = (params: HookParams): HookReturn => {
  const [state, setState] = useState(initialState);

  const action = useCallback(() => {
    // Action implementation
  }, [dependencies]);

  useEffect(() => {
    // Effect implementation
  }, [dependencies]);

  return { state, action };
};
```

### Service Pattern

```typescript
// Service structure
export class AlgorithmService {
  static async getAlgorithms(): Promise<Algorithm[]> {
    // Implementation
  }

  static async runAlgorithm(
    id: string,
    data: number[]
  ): Promise<AlgorithmStep[]> {
    // Implementation
  }
}
```

## 🔍 Code Quality

### TypeScript Configuration

- Strict mode enabled
- No implicit any
- Strict null checks
- Path mapping for clean imports

### ESLint Rules

- React best practices
- TypeScript recommendations
- Accessibility checks
- Import organization

### Testing Strategy

- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for features
- E2E tests for user workflows

## 🚀 Performance Considerations

### Code Splitting

```typescript
// Lazy loading for routes
const HomePage = lazy(() => import("@/pages/HomePage"));
const AlgorithmsPage = lazy(() => import("@/pages/AlgorithmsPage"));

// Dynamic imports for features
const loadAlgorithmEngine = () => import("@/core/algorithm/engine");
```

### Bundle Optimization

- Tree shaking for unused code
- Dynamic imports for heavy components
- Vendor chunk splitting
- Asset optimization

### Runtime Performance

- React.memo for expensive components
- useMemo/useCallback for expensive computations
- Virtualization for large lists
- Web Workers for algorithm execution

## 🔧 Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Development Tools

- **TypeScript**: Type checking and IntelliSense
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Storybook**: Component development
- **Vite**: Fast development server

### Debugging

- React DevTools browser extension
- TypeScript compiler diagnostics
- Console debugging with source maps
- Network tab for API debugging

## 📚 Documentation

### Component Documentation

Each component should include:

- PropTypes or TypeScript interfaces
- Usage examples
- Storybook stories
- Unit tests

### API Documentation

Services and utilities should include:

- Function signatures
- Parameter descriptions
- Return value types
- Usage examples

## 🔄 Maintenance

### Regular Tasks

- Update dependencies regularly
- Review and refactor legacy code
- Optimize performance bottlenecks
- Update documentation
- Add tests for new features

### Code Review Checklist

- TypeScript types are accurate
- Components are properly tested
- Performance implications considered
- Accessibility requirements met
- Documentation is updated

## 🔗 Related Resources

- **Build Configuration**: `../vite.config.ts`, `../tsconfig.json`
- **Testing Configuration**: `../vitest.config.ts`, `../playwright.config.ts`
- **Style Configuration**: `../tailwind.config.ts`, `../postcss.config.js`
- **Development Scripts**: `../scripts/` directory
