// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanctum: {
          primary: 'var(--sanctum-primary)',
          bg: 'var(--sanctum-bg)',
          sidebar: 'var(--sanctum-sidebar)',
          surface: 'var(--sanctum-surface)',
          accent: 'var(--sanctum-accent)',
          'text-curr': 'var(--sanctum-text-primary)',
          'text-muted': 'var(--sanctum-text-secondary)',
          border: 'var(--sanctum-border)',
        }
      }
    },
  },
  plugins: [],
}