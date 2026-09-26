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
        canvas: '#f6f3ea',
        surface: '#fffdf8',
        sunken: '#ece9df',
        hairline: {
          DEFAULT: 'rgba(26, 42, 58, 0.12)',
          strong: 'rgba(26, 42, 58, 0.22)',
        },
        ink: {
          DEFAULT: '#1a2a3a',
          medium: '#45596c',
          muted: '#55697b',
        },
        stage: {
          done: '#23724a',
          progress: '#245db7',
          caution: '#975f00',
          idle: '#5d6977',
        },
        deep: '#23364a',
        accent: '#155fcc',
      },
      fontSize: {
        micro: ['12px', { lineHeight: '16px', letterSpacing: '0.03em' }],
        caption: ['14px', { lineHeight: '20px' }],
        body: ['15px', { lineHeight: '23px' }],
        subtitle: ['16px', { lineHeight: '24px' }],
        lead: ['17px', { lineHeight: '28px' }],
        title: ['26px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        display: ['40px', { lineHeight: '44px', letterSpacing: '-0.035em' }],
        displaylg: ['56px', { lineHeight: '58px', letterSpacing: '-0.035em' }],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(26,42,58,0.04), 0 10px 26px -18px rgba(26,42,58,0.14)',
        lift: '0 18px 40px -28px rgba(26,42,58,0.2), 0 0 0 1px rgba(26,42,58,0.06)',
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
