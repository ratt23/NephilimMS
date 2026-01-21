/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#01007f',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'bounce-slight': 'bounce-slight 1s infinite',
        'ping-pong-x': 'ping-pong-x 4s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'bounce-slight': {
          '0%, 100%': { transform: 'translateY(-10%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        'ping-pong-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-25%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
