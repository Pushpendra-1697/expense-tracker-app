/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b1220',
          900: '#121a2b',
          800: '#1a2438',
          700: '#243049',
        },
        mint: {
          400: '#5eead4',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
        coral: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        sand: {
          50: '#f7f4ef',
          100: '#efe9df',
          200: '#e2d8c8',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 40px rgba(11, 18, 32, 0.08)',
      },
    },
  },
  plugins: [],
};
