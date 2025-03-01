/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'acai-primary': '#4A154B',
          'acai-secondary': '#611f5c',
          'acai-cream': '#F5E1C8',
          'acai-success': '#2D8A39',
        },
        fontFamily: {
          'playfair': ['Playfair Display', 'serif'],
          'quicksand': ['Quicksand', 'sans-serif'],
        },
        screens: {
          'xs': '475px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
        },
        zIndex: {
          '30': '30',
          '40': '40',
          '50': '50',
        }
      },
    },
    plugins: [],
  }