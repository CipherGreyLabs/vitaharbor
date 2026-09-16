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
        bg: {
          DEFAULT: '#090c11',
          surface1: '#0f141b',
          surface2: '#151b24',
          surface3: '#1b2330',
        },
        border: {
          subtle: '#202a38',
          bright: '#2f3d52',
        },
        content: {
          primary: '#edf5ff',
          secondary: '#9aaabd',
          muted: '#68788c',
        },
        accent: {
          DEFAULT: '#249cf4',
          hover: '#4fb5ff',
          soft: 'rgba(36, 156, 244, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
