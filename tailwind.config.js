/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Tokens originales CivicView ──────────────────────────────────────
        base: {
          950: "#050810",
          900: "#0A0F1E",
          800: "#0F1629",
          700: "#141D35",
          600: "#1A2540",
        },
        electric: {
          blue: "#2C8EFF",
          cyan: "#00D9F5",
          green: "#00F5A0",
          yellow: "#FFB800",
          red: "#FF4466",
          purple: "#A855F7",
        },
        ink: {
          100: "#F0F4FF",
          200: "#C8D3F0",
          300: "rgba(200,211,240,0.7)",
          400: "rgba(200,211,240,0.4)",
          500: "rgba(200,211,240,0.25)",
        },
        aqi: {
          good: "#00F5A0",
          moderate: "#FFB800",
          unhealthy1: "#FF8C42",
          unhealthy2: "#FF4466",
          veryUnhealthy: "#A855F7",
          hazardous: "#FF1744",
        },
        primary: {
          blue: "#2C8EFF",
          yellow: "#FFB800",
          dark: "#0A0F1E",
        },

        // ── Tokens Nebula ────────────────────────────────────────────────────
        nb: {
          base: "#050a18",
          surface: "#0b1120",
          purple: "#7c3aed",
          "purple-l": "#a78bfa",
          cyan: "#06b6d4",
          "cyan-l": "#22d3ee",
          green: "#10b981",
          "green-l": "#4ade80",
          red: "#ef4444",
          "red-l": "#f87171",
          amber: "#f59e0b",
          "amber-l": "#fbbf24",
          pink: "#ec4899",
          "pink-l": "#f472b6",
          "blue-l": "#93c5fd",
          text: "#ffffff",
          text2: "rgba(255,255,255,0.55)",
          text3: "rgba(255,255,255,0.28)",
        },
      },

      fontFamily: {
        display: ['"Syne"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        "nb-mono": ['"DM Mono"', '"JetBrains Mono"', "monospace"],
      },

      borderRadius: {
        "4xl": "2rem",
        nb: "12px",
        "nb-lg": "18px",
      },

      boxShadow: {
        glass:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        "glass-lg":
          "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glow-blue":
          "0 0 20px rgba(44,142,255,0.35), 0 0 60px rgba(44,142,255,0.1)",
        "glow-cyan": "0 0 20px rgba(0,217,245,0.3)",
        "glow-green": "0 0 20px rgba(0,245,160,0.3)",
        "glow-yellow": "0 0 20px rgba(255,184,0,0.3)",
        "nb-purple": "0 0 12px rgba(124,58,237,0.5)",
        "nb-cyan": "0 0 12px rgba(6,182,212,0.5)",
        "nb-red": "0 0 12px rgba(239,68,68,0.5)",
        "nb-green": "0 0 12px rgba(16,185,129,0.5)",
        "nb-amber": "0 0 12px rgba(245,158,11,0.5)",
      },

      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 0.5s ease both",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
        "live-ping": "livePing 2s ease-in-out infinite",
        "nb-pulse": "nbPulse 2s ease-in-out infinite",
        "nb-shimmer": "nbShimmer 1.6s ease-in-out infinite",
      },

      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 15px rgba(44,142,255,0.2)" },
          "50%": {
            boxShadow:
              "0 0 35px rgba(44,142,255,0.5), 0 0 70px rgba(44,142,255,0.15)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        livePing: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
        nbPulse: {
          "0%,100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(167,139,250,0.5)",
          },
          "60%": { opacity: "0.5", boxShadow: "0 0 0 5px rgba(167,139,250,0)" },
        },
        nbShimmer: {
          "0%,100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
