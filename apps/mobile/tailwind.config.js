/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F2',
        parchment: '#F2ECE1',
        bone: '#E8E0D0',
        ash: '#9A9081',
        espresso: '#3B2F22',
        ink: '#1A1612',
        porcelain: '#FFFEFB',
        burgundy: '#6B1F2A',
        forest: '#274D3A',
        oxide: '#B0432F',
        saffron: {
          50: '#FFF8EC',
          100: '#FFEFD0',
          200: '#FFDC9A',
          300: '#FFC55F',
          400: '#FFAE2E',
          500: '#F2960C',
          600: '#C97700',
          700: '#9C5C03',
          800: '#704208',
          900: '#4A2D08',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
};
