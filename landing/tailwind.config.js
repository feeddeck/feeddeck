/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#49d3b4",
        onprimary: "#1f2229",
        secondary: "#353a46",
        onsecondary: "#e2e4e9",
        background: "#1f2229",
        onbackground: "#e2e4e9",
      },
    },
  },
  plugins: [],
};
