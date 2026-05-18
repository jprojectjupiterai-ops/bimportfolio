import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        foreground: "#EAEAEA",
        accent: "#D4AF37", // A subtle gold/brass accent for architectural feel
        muted: "#2A2A2A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
