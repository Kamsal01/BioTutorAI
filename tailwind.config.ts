import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: { 50: "#eefdf4", 100: "#d7fbe6", 500: "#19a760", 700: "#087445" },
        coral: "#ff6f61",
        sun: "#f8c537",
        ink: "#1d2a32"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(29, 42, 50, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
