/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a3f7a', light: '#2563eb', dark: '#112d5c' },
        surface: '#f0f4f9',
      },
      fontFamily: {
        heb: ['Heebo', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
