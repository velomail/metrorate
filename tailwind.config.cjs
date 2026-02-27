/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#51f2fb",
        "primary-content": "#004b50",
        "background-light": "#f5f8f8",
        "background-dark": "#0f2223",
        "surface-light": "#eef4f4",
        "surface-dark": "#1a3031",
        "surface-variant": "#dde6e6",
        "surface-variant-dark": "#2a4243"
      },
      fontFamily: {
        display: ["Inter", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        full: "9999px"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

