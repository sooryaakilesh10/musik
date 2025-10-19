/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    letterSpacing: {
      widest: ".25em",
    },
    extend: {
      colors: {
        "primary": "#000000",
        "secondary": "#ffffff",
        "neo-yellow": "#ffeb3b",
        "neo-pink": "#ff006e",
        "neo-cyan": "#00d9ff",
        "neo-lime": "#76ff03",
        "neo-purple": "#b026ff",
        "neo-orange": "#ff6b00",
        "neo-bg": "#f5f5f5",
      },
      boxShadow: {
        'brutal': '6px 6px 0px 0px #000000',
        'brutal-sm': '4px 4px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
        'brutal-pink': '6px 6px 0px 0px #ff006e',
        'brutal-cyan': '6px 6px 0px 0px #00d9ff',
        'brutal-yellow': '6px 6px 0px 0px #ffeb3b',
      },
    },
  },
  plugins: [],
}
