/**
 * Design tokens are RGB triplets declared once in src/web/styles/index.css.
 * Tailwind maps them to semantic utility names, and the <alpha-value> slot keeps
 * opacity modifiers such as bg-surface/85 or ring-ink/20 working.
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/web/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--vh-canvas-rgb) / <alpha-value>)',
        surface: 'rgb(var(--vh-surface-rgb) / <alpha-value>)',
        sunken: 'rgb(var(--vh-sunken-rgb) / <alpha-value>)',
        hairline: {
          DEFAULT: 'rgb(var(--vh-hairline-rgb) / <alpha-value>)',
          strong: 'rgb(var(--vh-hairline-strong-rgb) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--vh-ink-rgb) / <alpha-value>)',
          medium: 'rgb(var(--vh-ink-medium-rgb) / <alpha-value>)',
          muted: 'rgb(var(--vh-ink-muted-rgb) / <alpha-value>)',
        },
        stage: {
          done: 'rgb(var(--vh-done-rgb) / <alpha-value>)',
          progress: 'rgb(var(--vh-progress-rgb) / <alpha-value>)',
          caution: 'rgb(var(--vh-caution-rgb) / <alpha-value>)',
          idle: 'rgb(var(--vh-idle-rgb) / <alpha-value>)',
        },
        deep: 'rgb(var(--vh-deep-rgb) / <alpha-value>)',
        accent: 'rgb(var(--vh-accent-rgb) / <alpha-value>)',
        // Legacy palettes retained for the archived route components.
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
      fontSize: {
        // Seven deliberate steps: four for interface text, three for display.
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
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.05)',
        lift: '0 12px 28px -16px rgba(16, 24, 40, 0.22)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
