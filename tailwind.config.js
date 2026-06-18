/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf7',
          100: '#faf3e6',
          200: '#f2e2be',
          300: '#e6c88a',
          400: '#daab5a',
          500: '#c38f38',
          600: '#a67228',
          700: '#845421',
          800: '#643d1a',
          900: '#462812',
          DEFAULT: '#D4AF37'
        },
        luxury: {
          navy: '#060A13',
          slate: '#0F1626',
          glass: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)'
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
