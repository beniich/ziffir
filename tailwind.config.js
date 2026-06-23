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
        zaphir: {
          50: '#fefcf3',
          100: '#fdf6db',
          200: '#fbe9b0',
          300: '#f8d67a',
          400: '#f4be43',
          500: '#d49619',
          600: '#b37e12',
          700: '#8c600b',
          800: '#664506',
          900: '#402a02',
          DEFAULT: '#d49619'
        },
        obsidian: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#222326',
          800: '#141518',
          900: '#0c0d10',
          950: '#050507',
          DEFAULT: '#0c0d10'
        },
        'cyber-cyan': '#00ffcc',
        'cyber-magenta': '#ff007f',
        luxury: {
          navy: '#060A13',
          slate: '#0F1626',
          glass: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)'
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-gold': '0 0 15px rgba(212, 150, 25, 0.35)',
        'cyber': '0 0 15px rgba(0, 255, 204, 0.45)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
