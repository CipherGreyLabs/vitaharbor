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
        canvas: '#0b0c0e',
        surface: '#141619',
        sunken: '#0e1013',
        hairline: {
          DEFAULT: 'rgba(255, 255, 255, 0.07)',
          strong: 'rgba(255, 255, 255, 0.14)',
        },
        ink: {
          DEFAULT: '#f4f5f7',
          medium: '#a2a8b0',
          muted: '#7d848c',
        },
        stage: {
          done: '#3fb950',
          progress: '#5b8def',
          caution: '#d29922',
          idle: '#5c636b',
        },
        deep: '#0e1013',
        accent: '#4d7cfe',
      },
      fontSize: {
        micro: ['11px', { lineHeight: '16px', letterSpacing: '0.04em' }],
        caption: ['12px', { lineHeight: '18px' }],
        body: ['13px', { lineHeight: '20px' }],
        subtitle: ['15px', { lineHeight: '24px' }],
        lead: ['17px', { lineHeight: '28px' }],
        title: ['26px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        display: ['40px', { lineHeight: '44px', letterSpacing: '-0.035em' }],
        displaylg: ['56px', { lineHeight: '58px', letterSpacing: '-0.035em' }],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03), 0 10px 26px -18px rgba(0,0,0,0.8)',
        lift: '0 20px 44px -28px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
