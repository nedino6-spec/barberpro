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
        background: "#050505",
        foreground: "#fcfcfc",
        card: "#111111",
        border: "rgba(255,215,0,0.1)", // Gold subtle border
        primary: {
          DEFAULT: "#d4af37", // Premium Gold
          hover: "#eab308", // Lighter Gold on hover
          light: "rgba(212, 175, 55, 0.15)",
        },
        muted: {
          DEFAULT: "#3f3f46",
          foreground: "#a1a1aa",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(212, 175, 55, 0.4)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
