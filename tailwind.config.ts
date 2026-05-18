import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f4",
          100: "#ffe1e9",
          200: "#ffc3d4",
          300: "#ff95b3",
          400: "#fc5d8a",
          500: "#f43568",
          600: "#e11849",
          700: "#bd0d3b",
          800: "#9c0e36",
          900: "#831033",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
