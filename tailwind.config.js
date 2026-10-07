/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: '#140b06',
        panel: '#24160c',
        cream: '#fff8e7',
        sand: '#e9d6b0',
        gold: { DEFAULT: '#fad258', deep: '#f3b92c' },
        ink: '#4A2511',
      },
    },
  },
  plugins: [],
}
