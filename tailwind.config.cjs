/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@shadcn/ui/**/*.js' 
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}