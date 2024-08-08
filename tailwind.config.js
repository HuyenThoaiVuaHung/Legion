module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.{html,ts}",
  ], // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        blue: {
          light: "#85d7ff",
          DEFAULT: "#1fb6ff",
          dark: "#009eeb",
        },
        pink: {
          light: "#ff7ce5",
          DEFAULT: "#ff49db",
          dark: "#ff16d1",
        },
        gray: {
          darkest: "#292929",
          dark: "#2D2D2D",
          DEFAULT: "#373737",
          light: "#C6C6C6",
          lightest: "#E5E5E5",
        },
        white: {
          DEFAULT: "#FFFFFF",
        },
        golden: {
          DEFAULT: "#ebb000",
          dark: "#d6a100",
          light: "#ffd700",
        },
        darkblue: {
          DEFAULT: "#203c6c",
          dark: "#0e2a3c",
          light: "#0e2a3c",
        },
      },
      boxShadow: {
        hard: '2px 2px 0px 0px rgba(0,0,0,1)',
        'very-hard': '0.5rem 0.5rem 0px 0px rgba(0,0,0,1)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: []
};
