/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0px 2px 1px rgba(0, 9, 63, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-red-hat-display)"],
        sans: ["var(--font-redhat)"],
      },
    },
  },
  plugins: [],
};