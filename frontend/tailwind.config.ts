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
        rausch: {
          DEFAULT: "#FF385C",
          dark: "#E31C5F",
          light: "#FF5A5F",
        },
        ink: "#222222",
        charcoal: "#484848",
        hint: "#717171",
        line: "#DDDDDD",
        cream: "#FFFFFF",
      },
      fontFamily: {
        display: [
          "Poppins", "Avenir Next", "Segoe UI", "-apple-system", "BlinkMacSystemFont", "sans-serif",
        ],
        body: [
          "Circular", "Helvetica Neue", "Segoe UI", "-apple-system", "BlinkMacSystemFont", "Roboto", "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 6px 16px rgba(0,0,0,0.12)",
        pop: "0 2px 8px rgba(0,0,0,0.18)",
        nav: "0 1px 0 rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "toast-in": { "0%": { opacity: "0", transform: "translateY(16px) scale(0.96)" }, "100%": { opacity: "1", transform: "translateY(0) scale(1)" } },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        "toast-in": "toast-in 0.25s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};
export default config;
