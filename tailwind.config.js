module.exports = {
  purge: [],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      blue: {
        light: '#85d7ff',
        DEFAULT: '#1fb6ff',
        dark: '#009eeb',
      },
      pink: {
        light: '#ff7ce5',
        DEFAULT: '#ff49db',
        dark: '#ff16d1',
      },
      gray: {
        darkest: '#292929',
        dark: '#2D2D2D',
        DEFAULT: '#373737',
        light: '#C6C6C6',
        lightest: '#E5E5E5',
      },
      white: {
        DEFAULT: '#FFFFFF'
      },
      golden: {
        DEFAULT: '#ebb000',
        dark: '#d6a100',
        light: '#ffd700'
      },
      darkblue: {
        DEFAULT: '#203c6c',
        dark: '#0e2a3c',
        light: '#0e2a3c'
      }
    }
  },
  plugins: [],
}
