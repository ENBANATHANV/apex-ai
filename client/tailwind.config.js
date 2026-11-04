/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-surface-elevated)',
        border: 'var(--border-color)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        electric: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          neon: '#00FF87',
          bright: '#10B981',
        },
        dark: {
          950: '#070A0E',
          900: '#0B0F14',
          850: '#11161D',
          800: '#161D26',
          700: '#212A36',
          600: '#323E4F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(34, 197, 94, 0.4)',
        'neon-strong': '0 0 30px -2px rgba(0, 255, 135, 0.6)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 135, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
