import type { Config } from "tailwindcss";

interface ExtendedConfig extends Config {
  safelist?: string[];
}

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  safelist: [
    "text-4xl",
    "font-bold",
    "bg-gradient-to-r",
    "from-[#4F46E5]",
    "to-[#10B981]",
    "bg-clip-text",
    "text-transparent",
  ],
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
} satisfies ExtendedConfig;
