
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
theme: {
    extend: {
        fontFamily: {
            sans: ['Tajawal', 'sans-serif'],
        },
    },
},
plugins: [
    require('@tailwindcss/forms'),
],
}