/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
        display: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        fof: {
          purple: "#7c3aed",
          violet: "#5b21b6",
          ink: "#1e1b4b",
          smoke: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};
