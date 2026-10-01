/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      maxWidth: {
        'site': '1400px',
      },
      colors: {
        apple: {
          dark: '#000000',
          darkCard: '#121215',
          darkCardHover: '#1c1c21',
          darkBorder: '#27272a',
          lightBg: '#fbfbfd',
          lightCard: '#ffffff',
          lightCardHover: '#f5f5f7',
          lightBorder: '#e5e5ea',
          blue: '#0071e3',
          blueHover: '#0077ED',
          indigo: '#5e5ce6',
          teal: '#2997ff',
          grayText: '#86868b',
          lightGrayText: '#6e6e73',
          success: '#30d158',
          warning: '#ffd60a',
          danger: '#ff453a'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      backdropBlur: {
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(0,113,227,0.4))' },
          '100%': { opacity: '0.8', filter: 'drop-shadow(0 0 25px rgba(0,113,227,0.8))' },
        }
      }
    },
  },
  plugins: [],
}
