/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#068BC9',
        'primary-dark': '#1F6694',
        'primary-light': '#3BA3D4',
        'primary-text': '#22A8DD',
      }
    },
  },
  plugins: [],
}