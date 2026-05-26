import type { Config } from "tailwindcss";
import { tailwindColors } from "./src/lib/colors";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      // Couleurs custom — palette + alias sémantiques (primary, secondary,
      // success, danger, warning, no). Source de vérité : src/lib/colors.ts.
      colors: tailwindColors,
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
