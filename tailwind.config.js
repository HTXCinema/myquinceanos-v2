/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rose:  '#C97C8A',
        dark:  '#1a0a0f',
        gold:  '#C9A040',
        blush: '#FAD8E9',
        cream: '#FDF6F0',
        muted: '#7a5c65',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
