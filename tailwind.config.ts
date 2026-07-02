import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1020",
        surface: "#111827",
        panel: "#172033",
        text: "#F8FAFC",
        muted: "#94A3B8",
        primary: "#60A5FA",
        accent: "#F472B6",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        line: "#26344D",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "Cascadia Code", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { DEFAULT: "8px", md: "8px", lg: "10px", pill: "999px" },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 6px 24px rgba(2,6,20,0.5)",
        pop: "0 18px 48px -16px rgba(2,6,20,0.85)",
        glow: "0 0 30px -6px rgba(96,165,250,0.55)",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(5px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        orbitpulse: { "0%,100%": { opacity: "0.55", transform: "scale(1)" }, "50%": { opacity: "1", transform: "scale(1.12)" } },
        spinslow: { to: { transform: "rotate(360deg)" } },
      },
      animation: { fadeUp: "fadeUp 0.25s ease-out", orbitpulse: "orbitpulse 1.8s ease-in-out infinite", spinslow: "spinslow 40s linear infinite" },
    },
  },
  plugins: [],
};
export default config;
