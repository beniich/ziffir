/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette Zaphir (Luxe / Cyberpunk)
        zaphir: {
          50:  '#fdf8e7',
          100: '#faedc4',
          200: '#f5d98a',
          300: '#f0c34f',
          400: '#ebb025',
          500: '#d49619',  // Or principal
          600: '#a87613',
          700: '#7c570d',
          800: '#503808',
          900: '#241a03',
        },
        obsidian: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        cyber: {
          cyan:    '#22d3ee',
          magenta: '#d946ef',
          purple:  '#a855f7',
          emerald: '#10b981',
          red:     '#ef4444',
          amber:   '#f59e0b',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gold-gradient':  'linear-gradient(135deg, #f5d98a 0%, #d49619 50%, #7c570d 100%)',
        'mesh-gradient':  'radial-gradient(at 20% 30%, rgba(212, 150, 25, 0.15) 0%, transparent 50%), radial-gradient(at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-gold':   '0 0 20px rgba(212, 150, 25, 0.4), 0 0 40px rgba(212, 150, 25, 0.2)',
        'glow-cyan':   '0 0 20px rgba(34, 211, 238, 0.4)',
        'glass':       '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'cyber':       '0 0 30px rgba(168, 85, 247, 0.3), 0 0 60px rgba(34, 211, 238, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
        'shimmer':     'shimmer 3s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'fade-in':     'fade-in 0.4s ease-out',
        'slide-up':    'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'gradient-x':  'gradient-x 8s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 150, 25, 0.4)' },
          '50%':      { boxShadow: '0 0 40px rgba(212, 150, 25, 0.8)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
