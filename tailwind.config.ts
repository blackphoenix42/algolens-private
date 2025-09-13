import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      // Enhanced color system
      colors: {
        // Custom color palette for better theming
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      // Enhanced spacing scale
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },
      // Enhanced animation system
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 2s infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateZ(0)" },
          "100%": { opacity: "1", transform: "translateZ(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translate3d(0, 20px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translate3d(0, -20px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translate3d(20px, 0, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translate3d(-20px, 0, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale3d(0.95, 0.95, 1)" },
          "100%": { opacity: "1", transform: "scale3d(1, 1, 1)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -5px, 0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale3d(1, 1, 1)" },
          "50%": { opacity: "0.8", transform: "scale3d(0.98, 0.98, 1)" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { transform: "translate3d(-100%, 0, 0)" },
          "100%": { transform: "translate3d(100%, 0, 0)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate3d(0, 0, 1, -3deg)" },
          "50%": { transform: "rotate3d(0, 0, 1, 3deg)" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale3d(1, 1, 1)" },
          "50%": { transform: "scale3d(1.05, 1.05, 1)" },
        },
      },
      // Enhanced typography
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SF Mono",
          "Monaco",
          "Inconsolata",
          "Roboto Mono",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      // Enhanced shadows
      boxShadow: {
        soft: "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
        medium: "0 4px 12px 0 rgba(0, 0, 0, 0.10)",
        large: "0 8px 24px 0 rgba(0, 0, 0, 0.12)",
        "xl-soft": "0 20px 40px 0 rgba(0, 0, 0, 0.08)",
        glow: "0 0 20px rgba(99, 102, 241, 0.3)",
        "glow-lg": "0 0 40px rgba(99, 102, 241, 0.2)",
      },
      // Enhanced border radius
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      // Enhanced backdrop blur
      backdropBlur: {
        xs: "2px",
      },
      // Enhanced gradients
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      // Enhanced screens for better responsive design
      screens: {
        xs: "475px",
        "3xl": "1920px",
      },
      // Enhanced transitions
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "900": "900ms",
      },
      // Animation delays
      animationDelay: {
        "100": "100ms",
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "600": "600ms",
        "700": "700ms",
        "800": "800ms",
        "900": "900ms",
        "1000": "1000ms",
      },
    },
  },
  plugins: [
    // Add container queries plugin equivalent
    function ({ addComponents, addUtilities, theme }) {
      // Animation delay utilities
      const delays = theme("animationDelay");
      const delayUtilities = Object.entries(delays).reduce(
        (acc, [key, value]) => {
          acc[`.animation-delay-${key}`] = {
            animationDelay: String(value),
          };
          return acc;
        },
        {} as Record<string, { animationDelay: string }>
      );

      addUtilities(delayUtilities);

      addComponents({
        ".container": {
          maxWidth: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: theme("spacing.4"),
          paddingRight: theme("spacing.4"),
          "@screen sm": {
            maxWidth: theme("screens.sm"),
          },
          "@screen md": {
            maxWidth: theme("screens.md"),
          },
          "@screen lg": {
            maxWidth: theme("screens.lg"),
          },
          "@screen xl": {
            maxWidth: theme("screens.xl"),
          },
          "@screen 2xl": {
            maxWidth: theme("screens.2xl"),
          },
        },
        // Responsive text utilities
        ".text-responsive": {
          fontSize: theme("fontSize.sm[0]"),
          lineHeight: theme("fontSize.sm[1].lineHeight"),
          "@screen md": {
            fontSize: theme("fontSize.base[0]"),
            lineHeight: theme("fontSize.base[1].lineHeight"),
          },
          "@screen lg": {
            fontSize: theme("fontSize.lg[0]"),
            lineHeight: theme("fontSize.lg[1].lineHeight"),
          },
        },
        // Glass morphism utilities
        ".glass": {
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        },
        ".glass-dark": {
          background: "rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        },
        // Scroll enhancements
        ".scroll-smooth": {
          scrollBehavior: "smooth",
        },
        ".hide-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
} satisfies Config;
