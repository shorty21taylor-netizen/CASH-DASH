/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
      },
      colors: {
        hv: {
          blue: '#1E90FF',
          'blue-dark': '#1a7ae6',
        },
        panel: {
          bg: '#0e0e10',
          surface: '#16161a',
          elevated: '#1c1c20',
        },
      },
      borderRadius: {
        panel: '4px',
      },
    },
  },
  plugins: [],
};
