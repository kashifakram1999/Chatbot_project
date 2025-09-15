import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bronn theme
        ink: {
          900: "#0F1115",
          800: "#151821",
          700: "#1C2030",
          600: "#24293A",
        },
        steel: {
          700: "#2E3446",
          600: "#3A425A",
          400: "#697089",
          300: "#8A91A6",
        },
        parchment: {
          50: "#FCFAF5",
          100: "#F7F2E6",
          200: "#EDE5CE",
        },
        amber: {
          600: "#C88B2E",
          500: "#D9A441",
          300: "#E9C878",
        },
        blood: {
          500: "#8E2A2A",
        },
        // semantic
        bg: "var(--bg)",
        card: "var(--card)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.12)",
        ring: "0 0 0 1px var(--border)",
      },
      backgroundImage: {
        "bronns-sheen":
          "radial-gradient(1200px 400px at 50% -10%, rgba(217,164,65,0.10), transparent 60%)",
        "parchment-noise":
          "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22><rect width=%224%22 height=%224%22 fill=%22%23F7F2E6%22/><circle cx=%221%22 cy=%221%22 r=%220.5%22 fill=%22%23EDE5CE%22/></svg>')",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "pulse-soft": { "0%,100%": { opacity: 0.65 }, "50%": { opacity: 1 } },
      },
      animation: {
        "fade-up": "fade-up .25s ease-out both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
