import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // DevFlow 브랜드 색상
        primary: "#4F46E5",
        "primary-foreground": "#ffffff",

        secondary: "#64748B",
        accent: "#E2E8F0",

        darkbg: "#0F0F0F",
        darkcard: "#1a1a1a",
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
