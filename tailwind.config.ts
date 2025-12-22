import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          "primary-pink": "#F4A6B8",
          "soft-blush": "#FCE6EC",
          "muted-peach": "#F6C1B0",
          "calm-green": "#9BB8A0",
          "warm-yellow": "#F6D84C",
          "text-primary": "#1F1F1F",
          "text-secondary": "#7A7A7A",
          dark: "#273071", // Deep navy for headers
          lightest: "#FFF5F8", // Lightest pink tint for backgrounds
        },
        // Pink scale for various uses
        pink: {
          50: "#FFF5F8",
          100: "#FCE6EC",
          200: "#F9CDD9",
          300: "#F6B4C6",
          400: "#F4A6B8",
          500: "#F095AB",
          600: "#E87A97",
          700: "#D65F82",
          800: "#C4446D",
          900: "#A82F5B",
        },
        // Peach/coral scale
        peach: {
          50: "#FFF7F4",
          100: "#FFEEE7",
          200: "#FED8C9",
          300: "#F6C1B0",
          400: "#F3B09C",
          500: "#F09F88",
        },
        // Calm green (limited use)
        green: {
          50: "#F4F8F5",
          100: "#E5EFE7",
          200: "#C7DCC9",
          300: "#9BB8A0",
          400: "#7FA885",
          500: "#639869",
        },
        // Yellow accent (micro-highlights only)
        yellow: {
          50: "#FFFEF0",
          100: "#FFF9D6",
          200: "#FFF3AE",
          300: "#F9E978",
          400: "#F6D84C",
          500: "#F0CA2E",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(244, 166, 184, 0.08)",
        "soft-lg": "0 4px 20px rgba(244, 166, 184, 0.12)",
        "soft-xl": "0 8px 32px rgba(244, 166, 184, 0.16)",
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
