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
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          light: "var(--accent-light)",
        },
        card: {
          DEFAULT: "var(--bg-secondary)",
          border: "var(--border-color)",
        },
        muted: {
          DEFAULT: "var(--text-muted)",
          foreground: "var(--text-secondary)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
      }
    },
  },
  plugins: [],
};
export default config;
