/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Ocean Blue palette ──────────────────────────────
        'neon-green':  '#00e5ff',   // repurposed → electric cyan (primary accent)
        'neon-blue':   '#2979ff',   // deep electric blue (secondary accent)
        'neon-purple': '#00b0ff',   // bright sky blue (tertiary)
        'neon-red':    '#ff1744',   // alert red (unchanged)
        'neon-yellow': '#ffab00',   // amber (XP / hints)

        // ── Dark navy backgrounds ───────────────────────────
        'dark-bg':      '#020b18',  // deepest navy-black
        'dark-card':    '#071428',  // card surface
        'dark-border':  '#0d2444',  // border lines
        'dark-surface': '#0a1f3a',  // elevated surface
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern':   "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
        'cyber-gradient': 'linear-gradient(135deg, #020b18 0%, #071428 50%, #020b18 100%)',
        'ocean-hero':     'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(41,121,255,0.25) 0%, transparent 70%)',
      },
      animation: {
        'pulse-blue': 'pulse-blue 2s ease-in-out infinite',
        'glitch':     'glitch 0.3s ease-in-out',
        'scan':       'scan 3s linear infinite',
        'type':       'type 2s steps(40) forwards',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'ripple':     'ripple 1.5s ease-out infinite',
      },
      keyframes: {
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 5px #00e5ff, 0 0 10px #00e5ff' },
          '50%':      { boxShadow: '0 0 20px #00e5ff, 0 0 40px #2979ff' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%':      { transform: 'translate(-2px, 2px)' },
          '40%':      { transform: 'translate(2px, -2px)' },
          '60%':      { transform: 'translate(-2px, -2px)' },
          '80%':      { transform: 'translate(2px, 2px)' },
        },
        'scan': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'glow': {
          'from': { textShadow: '0 0 10px #00e5ff' },
          'to':   { textShadow: '0 0 20px #00e5ff, 0 0 40px #2979ff' },
        },
        'ripple': {
          '0%':   { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
      boxShadow: {
        'neon':        '0 0 20px rgba(0, 229, 255, 0.35)',
        'neon-blue':   '0 0 20px rgba(41, 121, 255, 0.35)',
        'neon-purple': '0 0 20px rgba(0, 176, 255, 0.35)',
        'neon-red':    '0 0 20px rgba(255, 23, 68, 0.35)',
        'card':        '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        'ocean':       '0 8px 40px rgba(41, 121, 255, 0.2)',
      }
    },
  },
  plugins: [],
}
