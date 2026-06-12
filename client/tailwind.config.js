/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#102033',
        ocean: {
          50: '#eff8ff',
          100: '#dcefff',
          500: '#2f80ed',
          600: '#1d68d8',
          700: '#1855b4',
        },
        hearth: {
          50: '#fffaf3',
          100: '#f8efe2',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(20, 63, 114, 0.09)',
      },
    },
  },
  plugins: [],
}
