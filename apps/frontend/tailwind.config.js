/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include packages that use Tailwind classes
    "../../packages/workflow-nodes/src/**/*.{js,jsx}",
    "../../packages/workflow-edges/src/**/*.{js,jsx}",
    "../../packages/json-forms-renderers/src/**/*.{js,jsx}",
    "../../packages/widgets/src/**/*.{js,jsx}",
    "../../packages/widgets-ui/src/**/*.{js,jsx}",
    "../../packages/ui/src/**/*.{js,jsx}",
    "../../packages/datasources-ui/src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--brand-primary-rgb) / <alpha-value>)",
          foreground: "var(--brand-text-primary)",
        },
        secondary: {
          DEFAULT: "var(--brand-border)",
          foreground: "var(--brand-text-primary)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "var(--brand-text-primary)",
        },
        success: "hsl(var(--status-success) / <alpha-value>)",
        warning: "hsl(var(--status-warning) / <alpha-value>)",
        info: "hsl(var(--status-info) / <alpha-value>)",
        danger: "hsl(var(--status-danger) / <alpha-value>)",
        surface: {
          canvas: "hsl(var(--surface-canvas) / <alpha-value>)",
          card: "hsl(var(--surface-card) / <alpha-value>)",
          raised: "hsl(var(--surface-raised) / <alpha-value>)",
          subtle: "hsl(var(--surface-subtle) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "var(--brand-border-dark)",
          foreground: "var(--brand-text-muted)",
        },
        accent: {
          DEFAULT: "var(--brand-border-dark)",
          foreground: "var(--brand-text-primary)",
        },
        popover: {
          DEFAULT: "var(--brand-dark)",
          foreground: "var(--brand-text-primary)",
        },
        card: {
          DEFAULT: "var(--brand-dark-card)",
          foreground: "var(--brand-text-primary)",
        },
        brand: {
          green: "var(--brand-primary)",
          "green-link": "var(--brand-primary-link)",
          "green-border": "var(--brand-primary-border)",
          black: "var(--brand-black)",
          dark: "var(--brand-dark)",
          "border-dark": "var(--brand-border-dark)",
          border: "var(--brand-border)",
          "border-mid": "var(--brand-border-mid)",
          "border-light": "var(--brand-border-light)",
          "text-dark": "var(--brand-text-dark)",
          "text-muted": "var(--brand-text-muted)",
          "text-secondary": "var(--brand-text-secondary)",
          "text-primary": "var(--brand-text-primary)",
        }
      },
      fontFamily: {
        sans: ["Circular", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        display: ["Circular", "sans-serif"],
        mono: ["Source Code Pro", "Office Code Pro", "Menlo", "monospace"],
      },

      borderRadius: {
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        overlay: "var(--radius-overlay)",
      },

      zIndex: {
        canvas: "1",
        sticky: "20",
        overlay: "40",
        popover: "50",
        tooltip: "60",
        toast: "70",
      },

      transitionDuration: {
        fast: "120ms",
        base: "180ms",
      },

      boxShadow: {
        "whisper": "none",
        "card": "none",
        "deep": "none",
        "focus": "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        "soft": "var(--shadow-soft)",
        "raised": "var(--shadow-raised)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
