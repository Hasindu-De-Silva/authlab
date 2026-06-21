/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff88',
        'neon-blue': '#00d4ff',
        'neon-purple': '#a855f7',
        'neon-red': '#ff4444',
        'neon-yellow': '#ffd700',
        'dark-bg': '#080c14',
        'dark-card': '#0d1421',
        'dark-border': '#1a2640',
        'dark-surface': '#111827',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)",
        'cyber-gradient': 'linear-gradient(135deg, #080c14 0%, #0d1421 50%, #080c14 100%)',
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scan': 'scan 3s linear infinite',
        'type': 'type 2s steps(40) forwards',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88' },
          '50%': { boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-2px, -2px)' },
          '80%': { transform: 'translate(2px, 2px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          'from': { textShadow: '0 0 10px #00ff88' },
          'to': { textShadow: '0 0 20px #00ff88, 0 0 40px #00ff88' },
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 136, 0.3)',
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'neon-red': '0 0 20px rgba(255, 68, 68, 0.3)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }
    },
  },
  plugins: [],
}
