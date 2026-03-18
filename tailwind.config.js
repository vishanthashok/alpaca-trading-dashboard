/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        display: ["'Space Mono'", "monospace"],
      },
      colors: {
        terminal: {
          bg: "#080C10",
          surface: "#0D1117",
          card: "#111820",
          border: "#1E2D3D",
          green: "#00FF88",
          "green-dim": "#00CC6A",
          red: "#FF3B5C",
          "red-dim": "#CC2E49",
          amber: "#FFB800",
          blue: "#4D9FFF",
          muted: "#4A5568",
          text: "#8892A4",
          bright: "#E2E8F0",
        },
      },
      animation: {
        "pulse-green": "pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        blink: "blink 1s step-end infinite",
        ticker: "ticker 20s linear infinite",
      },
      keyframes: {
        pulseGreen: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)",
        "scanline":
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      },
      backgroundSize: {
        "grid-pattern": "40px 40px",
      },
      boxShadow: {
        "neon-green": "0 0 20px rgba(0, 255, 136, 0.15), 0 0 40px rgba(0, 255, 136, 0.05)",
        "neon-red": "0 0 20px rgba(255, 59, 92, 0.15), 0 0 40px rgba(255, 59, 92, 0.05)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
      },
    },
  },
  plugins: [],
};
