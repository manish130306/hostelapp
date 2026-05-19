export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        college: {
          navy: "#073763",
          blue: "#0E6BA8",
          teal: "#0EA5A3",
          mint: "#DDF7F4",
          ink: "#102033"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(7, 55, 99, 0.12)"
      }
    }
  },
  plugins: []
};
