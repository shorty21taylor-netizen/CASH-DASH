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
          green: '#4ade80',
          glow: '#22c55e',
        },
        panel: {
          bg: '#0a0c0a',
          surface: '#121512',
          elevated: '#161916',
        },
      },
      borderRadius: {
        card: '16px',
        xl: '12px',
      },
    },
  },
  plugins: [],
};
