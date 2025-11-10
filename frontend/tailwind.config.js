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
            50: '#1f132e',
            100: '#1a0f29',
            200: '#160c23',
            300: '#120a1d',
            400: '#0f0818',
            500: '#0b0512',
            600: '#090410',
            700: '#06030c',
            800: '#04020a',
            900: '#020105',
            },
            background: '#110029',
            primary: {
            DEFAULT: '#6f42c1',
            dark: '#5931a8',
            light: '#8a63d8',
            },
            text: {
            DEFAULT: '#cfc5ff',
            muted: '#7b6a9f',
            },
        },
        },
    },
    darkMode: 'class',
    plugins: [],
};
