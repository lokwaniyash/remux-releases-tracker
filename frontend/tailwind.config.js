/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f8f7fa',   // very light for hover states
          100: '#e8e6f0',
          200: '#d1cde3',
          300: '#dbd7ebff',
          400: '#8a7fb8',
          500: '#38286bff',
          600: '#504582',
          700: '#3a3165',  // medium dark purple for borders
          800: '#191230ff',  // dark purple for cards/containers
          900: '#0b0918ff',  // very dark purple for background
        },
        background: '#0d0818', // deep dark purple-black background
        primary: {
          DEFAULT: '#8b5cf6', // vibrant purple
          dark: '#7c3aed',
          light: '#a78bfa',
        },
        text: {
          DEFAULT: '#cfc9e6ff',  // bright white/gray for main text
          muted: '#060607ff',    // medium gray for secondary text
        },
        border: {
          DEFAULT: '#e5e7eb',  // light gray/white for visible borders
          subtle: '#4b5563',   // darker gray for subtle borders
        },
      },
    },
  },
  darkMode: 'class',
    plugins: [],
};
