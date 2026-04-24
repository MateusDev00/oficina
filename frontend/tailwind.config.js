/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: "#0F2027",
        medium: "#203A43",
        teal: "#2C5364",
        ice: "#F8F9FA",
        soft: "#E9ECEF",
        accent: "#FFB347",
        success: "#2E7D32",
        warning: "#fc0303",
        danger: "#D32F2F",
      },
    },
  },
  plugins: [],
}