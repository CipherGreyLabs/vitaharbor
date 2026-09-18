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
        canvas: '#000000',
        surface: 'rgba(7, 10, 18, 0.65)',
        sunken: '#03050a',
        hairline: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.16)',
        },
        ink: {
          DEFAULT: '#ffffff',
          medium: '#cbd5e1',
          muted: '#a3acb5',
        },
        stage: {
          done: '#00ff9d',
          progress: '#00d2ff',
          caution: '#ff3366',
          idle: '#7c848d',
        },
        deep: '#030509',
        accent: '#0055ff',
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
        card: '0 8px 32px 0 rgba(0, 15, 40, 0.4)',
        lift: '0 20px 50px -10px rgba(0, 85, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.05)',
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
