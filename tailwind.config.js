/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e5fa8', light: '#2d7dd2', dark: '#154a85' },
        surface: '#f0f4f9',
      },
      fontFamily: {
        heb: ['Heebo', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
