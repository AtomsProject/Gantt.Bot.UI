/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  //darkMode: 'media',
  darkMode: 'class',
  theme: {
    extend: {},
  },

  plugins: [
    require('flowbite/plugin')
  ]
}

