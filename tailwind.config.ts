import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        beige: "#DDC3A5",
        blue: "#AEC6CF",
        ink: "#4A433B",
        muted: "#6F675E",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(74, 67, 59, 0.05)",
      },
      fontFamily: {
        sans: ["Prompt", "Noto Sans Thai", "Tahoma", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
