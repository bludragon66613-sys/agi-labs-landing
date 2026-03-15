/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        neo: {
          bg: '#050505',
          surface: '#0a0a0c',
          card: '#111115',
          border: '#1f1f26',
          red: '#E8342E',
          redGlow: 'rgba(232, 52, 46, 0.4)',
          blue: '#2B7FD4',
          blueGlow: 'rgba(43, 127, 212, 0.4)',
          text: '#f4f4f5',
          muted: '#8b8b99',
          terminalGreen: '#4ade80'
        }
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'glow-pulse': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 15px rgba(232,52,46,0.2))' },
          '100%': { filter: 'drop-shadow(0 0 30px rgba(43,127,212,0.4))' },
        }
      }
    }
  },
  plugins: [],
}
