/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(222, 47%, 11%)",
        foreground: "hsl(213, 31%, 91%)",
        primary: {
          DEFAULT: "hsl(221.2, 83.2%, 53.3%)",
          foreground: "hsl(210, 40%, 98%)",
        },
        secondary: {
          DEFAULT: "hsl(222.2, 47.4%, 11.2%)",
          foreground: "hsl(210, 40%, 98%)",
        },
        accent: {
          DEFAULT: "hsl(217.2, 32.6%, 17.5%)",
          foreground: "hsl(210, 40%, 98%)",
        },
        card: {
          DEFAULT: "hsl(217.2, 32.6%, 17.5%)",
          foreground: "hsl(213, 31%, 91%)",
        },
        muted: {
          DEFAULT: "hsl(217.2, 32.6%, 17.5%)",
          foreground: "hsl(215, 20.2%, 65.1%)",
        },
        success: "hsl(142.1, 70.6%, 45.3%)",
        warning: "hsl(37.7, 92.1%, 50.2%)",
        destructive: "hsl(0, 84.2%, 60.2%)",
        border: "hsl(217.2, 32.6%, 17.5%)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        premium: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
