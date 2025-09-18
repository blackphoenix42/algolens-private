// Centralized feature flags for the application.
// These map to Vite environment variables (must be prefixed with VITE_).
// Documented flags:
//   VITE_ENABLE_AI_UI = 'true' | 'false'  (default false)
// Toggle to show/hide experimental AI user interface components while
// keeping the backend service layer intact.

export const ENABLE_AI_UI: boolean =
  import.meta.env.VITE_ENABLE_AI_UI === "true";

// Helper so we can optionally log or surface flag states if needed later.
export const featureFlags = {
  ENABLE_AI_UI,
};

// Usage example:
// import { ENABLE_AI_UI } from '@/config/featureFlags';
// {ENABLE_AI_UI && <AIChatPanel ... />}
