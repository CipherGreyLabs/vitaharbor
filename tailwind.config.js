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
        canvas: 'rgba(var(--vh-canvas), <alpha-value>)',
        surface: 'rgba(var(--vh-surface-1), <alpha-value>)',
        sunken: 'rgba(var(--vh-surface-2), <alpha-value>)',
        hairline: {
          DEFAULT: 'rgba(var(--vh-border), <alpha-value>)',
          strong: 'rgba(var(--vh-border-strong), <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgba(var(--vh-ink), <alpha-value>)',
          medium: 'rgba(var(--vh-ink-medium), <alpha-value>)',
          muted: 'rgba(var(--vh-ink-muted), <alpha-value>)',
        },
        stage: {
          done: 'rgba(var(--vh-stage-done), <alpha-value>)',
          progress: 'rgba(var(--vh-stage-progress), <alpha-value>)',
          caution: 'rgba(var(--vh-stage-caution), <alpha-value>)',
          idle: 'rgba(var(--vh-stage-idle), <alpha-value>)',
        },
        deep: 'rgba(var(--vh-surface-3), <alpha-value>)',
        accent: 'rgba(var(--vh-accent), <alpha-value>)',
        'accent-hover': 'rgba(var(--vh-accent-hover), <alpha-value>)',
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
        card: '0 1px 0 0 rgba(255,255,255,0.025), 0 10px 28px -20px rgba(0,0,0,0.72)',
        lift: '0 18px 40px -26px rgba(0,0,0,0.82), 0 0 0 1px rgba(79,181,255,0.14)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
