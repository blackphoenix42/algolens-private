# Application Configuration

This directory contains the core application setup including routing, providers, and global configuration.

## 📁 Contents

- **[router.tsx](router.tsx)** - Application routing configuration using React Router
- **[providers/](providers/)** - React context providers and global state setup

## 🛣️ Routing System

### Route Configuration

The routing system uses React Router v6 with the following structure:

```typescript
// Example router structure
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const AlgorithmsPage = lazy(() => import('@/pages/AlgorithmsPage'));
const AlgorithmDetailPage = lazy(() => import('@/pages/AlgorithmDetailPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'algorithms',
        children: [
          {
            index: true,
            element: <AlgorithmsPage />
          },
          {
            path: ':category',
            element: <AlgorithmCategoryPage />
          },
          {
            path: ':category/:algorithm',
            element: <AlgorithmDetailPage />
          }
        ]
      }
    ]
  }
]);
```

### Route Structure

```
/                           - Homepage
/algorithms                 - Algorithm listing
/algorithms/sorting         - Sorting algorithms category
/algorithms/sorting/bubble  - Specific algorithm view
/algorithms/searching       - Searching algorithms category
/algorithms/graph           - Graph algorithms category
/about                      - About page
/404                        - Not found page
```

### Protected Routes

```typescript
// Example protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### Route Loading States

```typescript
// Suspense wrapper for lazy-loaded routes
const RouteWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);
```

## 🔌 Provider System

### Provider Hierarchy

The providers directory organizes React context providers in a specific order:

```typescript
// Example provider composition
export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <ThemeProvider>
      <I18nProvider>
        <QueryClientProvider>
          <AuthProvider>
            <AlgorithmProvider>
              {children}
            </AlgorithmProvider>
          </AuthProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
```

### Key Providers

#### Theme Provider

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const resolvedTheme = useResolvedTheme(theme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      <div className={resolvedTheme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

#### Algorithm Provider

```typescript
interface AlgorithmContextType {
  currentAlgorithm: Algorithm | null;
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  playbackSpeed: number;
  setAlgorithm: (algorithm: Algorithm) => void;
  play: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
}
```

#### Query Client Provider

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export const AppQueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
```

## 🔧 Configuration

### Environment Configuration

```typescript
// config/env.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  version: import.meta.env.PACKAGE_VERSION || "0.0.1",
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  analytics: {
    googleId: import.meta.env.VITE_GA_ID,
  },
};
```

### Feature Flags

```typescript
// config/features.ts
export const features = {
  enableNewAlgorithmEngine: import.meta.env.VITE_ENABLE_NEW_ENGINE === "true",
  enableVideoExport: import.meta.env.VITE_ENABLE_VIDEO_EXPORT === "true",
  enableMultiLanguage: import.meta.env.VITE_ENABLE_I18N === "true",
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
};
```

## 🚀 Application Initialization

### Main App Component

```typescript
// App.tsx
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './app/providers';
import { router } from './app/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const App = () => (
  <ErrorBoundary>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </ErrorBoundary>
);
```

### Service Worker Registration

```typescript
// app/serviceWorker.ts
export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
};
```

## 🔍 Route Guards and Middleware

### Authentication Guard

```typescript
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### SEO Middleware

```typescript
export const SEORoute = ({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    document.title = `${title} | AlgoLens`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return <>{children}</>;
};
```

## 📱 Progressive Web App Setup

### PWA Configuration

```typescript
// app/pwa.ts
export const initializePWA = () => {
  // Register service worker
  registerServiceWorker();

  // Handle app install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    // Store the event for later use
    window.deferredPrompt = e;
  });

  // Handle app installation
  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed");
  });
};
```

## 🔄 State Synchronization

### URL State Management

```typescript
// hooks/useURLState.ts
export const useURLState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateURL = useCallback(
    (params: Record<string, string>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            newParams.set(key, value);
          } else {
            newParams.delete(key);
          }
        });
        return newParams;
      });
    },
    [setSearchParams]
  );

  return { searchParams, updateURL };
};
```

### Global State Integration

```typescript
// hooks/useAppState.ts
export const useAppState = () => {
  const algorithmState = useAlgorithmStore();
  const themeState = useTheme();
  const userState = useAuth();

  return {
    algorithm: algorithmState,
    theme: themeState,
    user: userState,
  };
};
```

## 🛠️ Development Tools

### Router DevTools

```typescript
// Development-only router debugging
if (import.meta.env.DEV) {
  import("@/lib/devtools").then(({ setupRouterDevtools }) => {
    setupRouterDevtools();
  });
}
```

### Hot Reload Support

```typescript
// Hot reload for development
if (import.meta.hot) {
  import.meta.hot.accept();
}
```

## 📊 Analytics Integration

### Route Tracking

```typescript
// hooks/useRouteTracking.ts
export const useRouteTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (features.enableAnalytics) {
      gtag("config", config.analytics.googleId, {
        page_path: location.pathname,
      });
    }
  }, [location]);
};
```

## 🔗 Related Resources

- **Pages**: `../pages/` - Route components and page layouts
- **Components**: `../components/` - UI components used in routes
- **Hooks**: `../hooks/` - Custom hooks for routing and state
- **Store**: `../store/` - Global state management
- **Types**: `../types/` - TypeScript definitions for routing
