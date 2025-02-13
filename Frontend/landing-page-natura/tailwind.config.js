/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: '#FF6F61',
          secondary: '#C5E384',
          dark: '#333333',
        },
        fontFamily: {
          poppins: ['Poppins', 'sans-serif'],
          opensans: ['Open Sans', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };