/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F8FAFC',
          cream: '#FAFBF7',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        sky: {
          50: '#F0F9FF',
          600: '#0284C7',
          700: '#0369A1',
        },
        amber: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        earth: {
          50: '#FDF8F6',
          100: '#F2E8E5',
          600: '#8C5E45',
          700: '#73442E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'lifted': '0 10px 25px -5px rgba(13, 148, 136, 0.1), 0 8px 10px -6px rgba(13, 148, 136, 0.05)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
