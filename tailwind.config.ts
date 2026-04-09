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
        primary: "#E6C364",
        "primary-dim": "#C9A84C",
        "on-primary": "#3D2E00",
        "primary-container": "#C9A84C",
        "on-primary-container": "#503D00",
        background: "#131313",
        surface: "#131313",
        "surface-dim": "#131313",
        "surface-bright": "#3A3939",
        "surface-container-lowest": "#0E0E0E",
        "surface-container-low": "#1C1B1B",
        "surface-container": "#201F1F",
        "surface-container-high": "#2A2A2A",
        "surface-container-highest": "#353534",
        "on-surface": "#E5E2E1",
        "on-surface-variant": "#D0C5B2",
        outline: "#99907E",
        "outline-variant": "#4D4637",
        error: "#FFB4AB",
        "error-container": "#93000A",
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
