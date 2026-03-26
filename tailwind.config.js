/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',    // green-600 — main brand
        danger: '#dc2626',     // red-600 — over budget
        warn: '#d97706',       // amber-600 — near limit
        surface: '#f9fafb',    // gray-50
      },
    },
  },
  plugins: [],
};
