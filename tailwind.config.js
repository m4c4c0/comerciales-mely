/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1B2229",
        muted: "#5B6472",
        faint: "#8A93A1",
        line: "#E4E1D9",
        cream: "#F7F4EE",
        surface: "#FFFFFF",
        brand: {
          950: "#0A1B2C",
          900: "#0E2439",
          800: "#153450",
          700: "#1B3B57",
          600: "#234B6C",
          500: "#2CA6A4",
          100: "#E4F3F2",
        },
        clay: {
          600: "#B96A2C",
          500: "#DD8A3E",
          100: "#FBEBDA",
        },
        brick: {
          600: "#9A3A28",
          500: "#B3432E",
          100: "#F7E3DE",
        },
        moss: {
          600: "#3D7A5A",
          500: "#4E9873",
          100: "#E4F2EA",
        },
      },
      fontFamily: {
        display: [
          "Manrope", "Segoe UI", "ui-sans-serif", "system-ui", "-apple-system", "Roboto", "Helvetica Neue", "Arial", "sans-serif",
        ],
        sans: [
          "Inter", "Segoe UI", "ui-sans-serif", "system-ui", "-apple-system", "Roboto", "Helvetica Neue", "Arial", "sans-serif",
        ],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        pill: "999px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(14,36,57,0.04), 0 8px 24px -12px rgba(14,36,57,0.12)",
      },
    },
  },
  plugins: [],
};
