/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          wine: '#722F37',
          beige: '#F5E6E8',
          gold: '#D4AF37',
          'soft-black': '#2A2A2A',
        },
        fontFamily: {
          playfair: ['Playfair Display', 'serif'],
          lato: ['Lato', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };