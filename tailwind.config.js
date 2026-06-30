/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        accent: {
          blue: '#1E90FF',
          glow: '#3BA9FF',
        },
        panel: {
          bg: '#000000',
          surface: '#0d0f14',
          elevated: '#12141a',
        },
      },
      borderRadius: {
        card: '20px',
        xl: '14px',
      },
    },
  },
  plugins: [],
};
