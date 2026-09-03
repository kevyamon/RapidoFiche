import { theme } from './src/theme/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        background: theme.colors.background,
        text: theme.colors.text,
        border: theme.colors.border,
        status: theme.colors.status,
        subscription: theme.colors.subscription,
      },
      borderRadius: theme.radius,
      boxShadow: theme.shadows,
      fontFamily: {
        sans: theme.fonts.sans,
      },
    },
  },
  plugins: [],
};
