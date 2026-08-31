/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#232f42',
          850: '#151c28',
          950: '#0b0f17',
        },
        dark: {
          950: '#0b0f17',
          900: '#111722',
          850: '#151c28',
          800: '#1c2536',
          750: '#232f42',
          700: '#2c3b52',
          600: '#3d4f6b',
          500: '#526685',
          400: '#7387a3',
          300: '#9cb0cb',
          200: '#cad6e8',
          100: '#edf2f9',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'modal': '0 20px 40px -10px rgba(15, 23, 42, 0.16)',
        'modal-dark': '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
        'glow': '0 0 20px -5px rgba(99, 102, 241, 0.4)'
      }
    },
  },
  plugins: [],
}
