/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "2xl": "0px 2px 8px 0px #0000001F",
        "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
  theme: {
    fontFamily: {
      sans: ["Karla", "sans-serif"],
    },
  },
};
