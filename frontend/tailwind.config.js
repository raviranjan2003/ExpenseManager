/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        ink: {
          950: '#0c1222',
          900: '#111827',
          800: '#1e293b',
        },
      },
      boxShadow: {
        soft: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
        glow: '0 0 0 1px rgba(45, 212, 191, 0.25), 0 20px 40px -20px rgba(13, 148, 136, 0.35)',
      },
    },
  },
  plugins: [],
};
