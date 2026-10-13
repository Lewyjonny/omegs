import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#f2f6f9',
          100: '#e1eaf1',
          200: '#c3d4e1',
          300: '#94b2c8',
          400: '#5f88a8',
          500: '#3f6a8b',
          600: '#2f5372',
          700: '#26435d',
          800: '#1c3247',
          900: '#12233a',
          950: '#0b1626',
        },
        mint: {
          50: '#effbf6',
          100: '#d8f5e8',
          200: '#b3ead3',
          300: '#82d9b8',
          400: '#4fc199',
          500: '#2ca67f',
          600: '#1f8667',
          700: '#1b6b54',
          800: '#185545',
          900: '#15463a',
        },
        surface: '#f6f8f9',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(18,35,58,0.04), 0 8px 24px -8px rgba(18,35,58,0.10)',
        lift: '0 2px 4px rgba(18,35,58,0.04), 0 18px 40px -12px rgba(18,35,58,0.18)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [forms],
};
