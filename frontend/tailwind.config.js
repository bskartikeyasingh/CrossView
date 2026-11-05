/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F7F5',
        card: '#FFFFFF',
        primary: {
          DEFAULT: '#20252D',
          hover: '#13161B',
        },
        secondary: {
          DEFAULT: '#737983',
          light: '#9CA3AF',
        },
        navy: {
          DEFAULT: '#263F65',
          dark: '#1C2F4D',
          light: '#375482',
        },
        mutedBlue: {
          DEFAULT: '#6687B2',
          light: '#8FA9CB',
        },
        border: '#E5E7EB',
        corroborated: {
          DEFAULT: '#15803D',
          light: '#DCFCE7',
          dark: '#166534',
        },
        disputed: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark: '#B45309',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

