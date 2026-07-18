const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false, // Docusaurus handles reset
    container: false,
  },
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7582ff',
          deep: '#5c6aff',
          soft: '#949fff',
        },
        background: '#171717',
        card: '#1f1f1f',
        'brand-black': '#171717',
        'brand-black-text': '#0f0f0f',
        'primary-foreground': '#0f0f0f',
        muted: {
          DEFAULT: '#242424',
          foreground: '#898989',
        },
        border: '#2e2e2e',
        foreground: '#fafafa',
      },
      borderRadius: {
        sm: '6px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
