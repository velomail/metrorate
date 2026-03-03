/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        "primary-dark": "#1d4ed8",
        "primary-content": "#ffffff",
        border: "#e2e8f0",
        muted: "#64748b",
        "background-light": "#f8fafc",
        "background-dark": "#0f2223",
        "surface-light": "#f1f5f9",
        "surface-dark": "#1a3031",
        "surface-variant": "#e2e8f0",
        "surface-variant-dark": "#2a4243"
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "8px",
        xl: "12px",
        full: "9999px"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

