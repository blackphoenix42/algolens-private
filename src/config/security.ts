/**
 * Security configuration for AlgoLens
 * This file documents security considerations and mitigations
 */

// Content Security Policy configuration for production
export const CSP_CONFIG = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"], // Required for Vite dev and some analytics
  "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
  "font-src": ["'self'", "fonts.gstatic.com"],
  "img-src": ["'self'", "data:", "blob:"],
  "connect-src": ["'self'", "vitals.vercel-insights.com", "*.sentry.io"],
  "media-src": ["'self'", "blob:"],
  "worker-src": ["'self'", "blob:"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": true,
};

// Sanitization configuration for user inputs
export const SANITIZATION_CONFIG = {
  // Allow only safe HTML tags in user content
  allowedTags: [],
  allowedAttributes: {},
  // Remove all HTML by default - app uses plain text inputs
  allowedSchemes: [],
};

/**
 * Security notes for third-party libraries:
 *
 * 1. KaTeX: Math rendering library that processes LaTeX
 *    - Potential XSS via malicious LaTeX (mitigated by controlled input)
 *    - String escaping warnings are expected for LaTeX processing
 *    - Used only with trusted mathematical expressions
 *
 * 2. D3.js: Data visualization library
 *    - DOM manipulation warnings are expected for SVG generation
 *    - Used only with controlled, validated data
 *
 * 3. React: UI framework
 *    - innerHTML usage warnings from React internals
 *    - Framework handles sanitization automatically
 *
 * 4. Randomness Security:
 *    - Crypto-secure randomness (window.crypto.getRandomValues) used for:
 *      * State persistence IDs
 *      * Notification system IDs
 *      * Performance monitoring alert IDs
 *      * All ID generation by default (generateId() function)
 *    - Timestamp-based fallback used when crypto is unavailable (better than Math.random for ID generation)
 *    - Math.random() used ONLY for UI effects, animations, and demo data generation (non-security contexts)
 *    - generateNonSecureId() function available for explicit non-security contexts
 *
 * 5. Dynamic Method Calls:
 *    - All dynamic method invocations have been eliminated or secured with explicit validation
 *    - Method name whitelisting used where dynamic calls are necessary
 *    - No user-controlled method names accepted
 */
