/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        board: { 950: '#081410', 900: '#0d1f19', 800: '#132a22', 700: '#1a382e', 600: '#244b3f', 500: '#33695a' },
        chalk: { DEFAULT: '#ECEFE4', dim: '#A9B8AD', faint: '#6E857A' },
        pen: { DEFAULT: '#FF6A5C', soft: '#FFB3AB' },
        mustard: '#F1D26A',
        tick: '#5ED8A4',
        sky: '#8EC8FF',
        paper: '#F4F2EA',
        ink: '#1C2B4A',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        hand: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        spotlight: {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
        shimmer: { from: { backgroundPosition: '0 0' }, to: { backgroundPosition: '-200% 0' } },
        ping2: { '75%,100%': { transform: 'scale(2.2)', opacity: '0' } },
      },
      animation: {
        spotlight: 'spotlight 2s ease .75s 1 forwards',
        shimmer: 'shimmer 2s linear infinite',
        ping2: 'ping2 1.6s cubic-bezier(0,0,.2,1) infinite',
      },
    },
  },
  plugins: [],
};
