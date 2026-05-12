import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — calming medical blue
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Triage colors — colorblind-safe palette
        triage: {
          mild: "#22c55e",       // Green
          "mild-bg": "#f0fdf4",
          "mild-border": "#86efac",
          urgent: "#f59e0b",     // Amber
          "urgent-bg": "#fffbeb",
          "urgent-border": "#fcd34d",
          critical: "#ef4444",   // Red
          "critical-bg": "#fef2f2",
          "critical-border": "#fca5a5",
        },
        // Surface colors for light/dark
        surface: {
          primary: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",
          dark: {
            primary: "#0f172a",
            secondary: "#1e293b",
            tertiary: "#334155",
          },
        },
        // Text colors
        content: {
          primary: "#0f172a",
          secondary: "#475569",
          tertiary: "#94a3b8",
          inverse: "#ffffff",
          dark: {
            primary: "#f8fafc",
            secondary: "#cbd5e1",
            tertiary: "#64748b",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "serif"],
      },
      fontSize: {
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
      },
      borderRadius: {
        "chat": "1.25rem",
        "card": "1rem",
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
        "elevated": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
        "chat-bubble": "0 1px 2px 0 rgb(0 0 0 / 0.04)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounce 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "typing-dot": "typingDot 1.4s infinite ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        typingDot: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-4px)" },
        },
      },
      spacing: {
        "chat-gap": "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
