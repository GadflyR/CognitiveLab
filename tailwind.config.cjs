module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        blob: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%":     { transform: "translate(30px,-40px) scale(1.1)" },
          "66%":     { transform: "translate(-20px,20px) scale(0.9)" },
        },
      },
      animation: {
        blob: "blob 18s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
