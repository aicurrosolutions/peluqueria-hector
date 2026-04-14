import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#755B00",
        "primary-dim": "#584400",
        "on-primary": "#FFFFFF",
        "primary-container": "#FFE08F",
        "on-primary-container": "#241A00",
        background: "#FFFFFF",
        surface: "#FFFFFF",
        "surface-dim": "#F3F3F3",
        "surface-bright": "#FFFFFF",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F9F9F9",
        "surface-container": "#F3F3F3",
        "surface-container-high": "#EDEDED",
        "surface-container-highest": "#E2E2E2",
        "on-surface": "#1C1B1B",
        "on-surface-variant": "#5F5E5E",
        outline: "#6B6860",
        "outline-variant": "#C9C6BC",
        secondary: "#5F5E5E",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#F3F3F3",
        "inverse-surface": "#333333",
        "inverse-on-surface": "#F3F3F3",
        "inverse-primary": "#FFE08F",
        error: "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-error": "#FFFFFF",
        "on-error-container": "#410002",
        success: "#15803D",
        "success-container": "rgba(21,128,61,0.10)",
        "success-border": "#16A34A",
        warning: "#B45309",
        "warning-container": "rgba(180,83,9,0.10)",
      },
      fontFamily: {
        headline: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        label: ["var(--font-manrope)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0px",
        none: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        full: "9999px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
