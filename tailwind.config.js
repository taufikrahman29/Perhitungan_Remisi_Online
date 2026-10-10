/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          blue: '#0f172a',
          light: '#1e293b'
        },
        royal: {
          blue: '#2563eb',
          dark: '#1d4ed8',
          light: '#eff6ff'
        },
        gold: {
          DEFAULT: '#f59e0b',
          dark: '#d97706'
        }
      }
    },
  },
  plugins: [],
}
