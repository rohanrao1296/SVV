/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B5ED7',
          light: '#3b82f6',
          dark: '#0a4eb1',
          hover: '#094cb0'
        },
        secondary: {
          DEFAULT: '#198754',
          light: '#2ec4b6',
          dark: '#146c43',
          hover: '#125f3b'
        },
        accent: {
          DEFAULT: '#FFC107',
          light: '#ffe3a8',
          dark: '#e0a800',
        },
        schoolBg: {
          DEFAULT: '#F8FAFC',
          dark: '#0F172A',
        },
        schoolText: {
          DEFAULT: '#212529',
          dark: '#F1F5F9',
        },
        cardBg: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        borderCol: {
          light: '#E2E8F0',
          dark: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 15px -3px rgba(0, 0, 0, 0.04)',
        'fluent': '0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108)',
        'fluent-depth': '0 6.4px 14.4px 0 rgba(0,0,0,0.132), 0 1.2px 3.6px 0 rgba(0,0,0,0.108)'
      }
    },
  },
  plugins: [],
}
