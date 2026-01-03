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
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
