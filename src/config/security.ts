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
 * 4. Randomness:
 *    - Crypto-secure randomness used for IDs and security-sensitive operations
 *    - Math.random() used only for UI effects, animations, and demo data
 */
