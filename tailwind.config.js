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
          DEFAULT: '#040608',
          panel: '#090d13',
          card: '#0d131b',
          hover: '#131a24',
          border: '#1a2332',
          borderBright: '#29374e',
        },
        vita: {
          blue: '#00b4d8',
          cyan: '#00f0ff',
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

