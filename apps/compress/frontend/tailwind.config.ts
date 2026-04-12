import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Captain Whiskers Theme - Deep Space Violet
        primary: {
          DEFAULT: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        // Cyber Teal accent
        accent: {
          DEFAULT: '#14F5DD',
          50: '#ECFEFA',
          100: '#CFFDF4',
          200: '#A8F9EC',
          300: '#6FF3E2',
          400: '#14F5DD',
          500: '#0DD9C4',
          600: '#0AB5A3',
          700: '#0D9084',
          800: '#10726B',
          900: '#115E58',
        },
        // Quantum Blue
        quantum: {
          DEFAULT: '#3B82F6',
          glow: '#60A5FA',
        },
        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        // Dark backgrounds
        dark: {
          DEFAULT: '#0F0F1A',
          100: '#1A1A2E',
          200: '#16213E',
          300: '#0F3460',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-orbitron)', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'quantum-pulse': 'quantumPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.8)' },
        },
        quantumPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(124, 58, 237, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.1) 1px, transparent 1px)',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(124, 58, 237, 0.5)',
        'glow-accent': '0 0 30px rgba(20, 245, 221, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(124, 58, 237, 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
