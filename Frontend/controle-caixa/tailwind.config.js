/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B3A57',
        secondary: '#4A90E2',
        'gray-dark': '#333333',
        'gray-light': '#E0E0E0',
        success: '#2ECC71',
      },
    },
  },
  plugins: [],
};