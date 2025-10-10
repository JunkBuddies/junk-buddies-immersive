/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 💎 Brand Colors
      colors: {
        gold: "#d4af37",
        black: "#0b0b0b",
        charcoal: "#121212",
        silver: "#C0C0C0",
        platinum: "#e5e5e5",
      },

      // 📱 Responsive Breakpoints
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },

      // ✨ Text & Shadow Effects
      textShadow: {
        gold: "0 0 10px rgba(212,175,55,0.7)",
        glow: "0 0 15px rgba(255,255,255,0.4)",
      },

      // 🌀 Box Shadows for buttons/cards
      boxShadow: {
        gold: "0 0 10px rgba(212,175,55,0.5)",
        glow: "0 0 20px rgba(255,255,255,0.2)",
        inset: "inset 0 0 6px rgba(212,175,55,0.3)",
      },

      // 🎞️ Animation keyframes
      keyframes: {
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(212,175,55,0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(212,175,55,0.8)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      // 🎬 Animation presets
      animation: {
        fadeInUp: "fadeInUp 0.6s ease-out forwards",
        pulseGold: "pulseGold 2s infinite ease-in-out",
        shimmer: "shimmer 2s linear infinite",
      },

      // 🌈 Background gradients
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(90deg, rgba(212,175,55,1) 0%, rgba(255,225,130,1) 50%, rgba(212,175,55,1) 100%)",
        "dark-radial":
          "radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)",
      },
    },
  },
  plugins: [
    // Optional text shadow plugin (safe fallback)
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow-gold": {
          textShadow: "0 0 10px rgba(212,175,55,0.8)",
        },
        ".text-shadow-glow": {
          textShadow: "0 0 15px rgba(255,255,255,0.4)",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
