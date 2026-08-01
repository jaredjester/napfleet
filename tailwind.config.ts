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
        charcoal: "#181B17",
        "deep-olive": "#535C45",
        "field-olive": "#6B7358",
        cream: "#F4F0E6",
        "warm-white": "#FFFDF7",
        khaki: "#B8AE91",
        "signal-orange": "#D95F36",
        "muted-sky": "#8FB8CE",
        "text-gray": "#6D7069",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        "hero-desktop": "clamp(3.625rem, 6vw, 4.75rem)",
        "hero-mobile": "clamp(2.5rem, 10vw, 3.125rem)",
        "section-desktop": "clamp(2.75rem, 5vw, 3.75rem)",
        "section-mobile": "clamp(2rem, 8vw, 2.625rem)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(16px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
