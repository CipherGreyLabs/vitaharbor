/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/web/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oled: {
          DEFAULT: '#08090a',
          panel: '#0f1113',
          card: '#15181b',
          hover: '#1c2024',
          border: '#242830',
          borderBright: '#343a42',
        },
        vita: {
          blue: '#3ad2ff',
          cyan: '#3ad2ff',
          glow: 'rgba(0, 240, 255, 0.15)',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}

