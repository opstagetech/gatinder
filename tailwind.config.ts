import type { Config } from 'tailwindcss';

// Todas as cores e fontes vêm das variáveis CSS de src/theme/theme.css.
// Para trocar a identidade visual, mexa SÓ naquele arquivo.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: v('brand'),
        'brand-2': v('brand-2'),
        'brand-ink': v('brand-ink'),
        like: v('like'),
        nope: v('nope'),
        ok: v('ok'),
        'fecovet-red': v('fecovet-red'),
        'fecovet-green': v('fecovet-green'),
        warn: v('warn'),
        bg: v('bg'),
        surface: v('surface'),
        ink: v('ink'),
        muted: v('muted'),
        line: v('line'),
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      // Animações da TV
      keyframes: {
        'swipe-out': {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(1500px) rotate(28deg)', opacity: '1' },
        },
        'card-in': {
          '0%': { transform: 'scale(0.92)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'stamp-in': {
          '0%': { opacity: '0', transform: 'rotate(-18deg) scale(1.6)' },
          '100%': { opacity: '1', transform: 'rotate(-18deg) scale(1)' },
        },
        'like-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.25)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.4)' },
          '70%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '15%': { opacity: '1' },
          '100%': { transform: 'translateY(-1400px) scale(1.4)', opacity: '0' },
        },
        'slow-zoom': { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.06)' } },
      },
      animation: {
        'swipe-out': 'swipe-out 900ms cubic-bezier(.5,0,.75,.2) 350ms forwards',
        'card-in': 'card-in 700ms ease-out 450ms both',
        'stamp-in': 'stamp-in 300ms ease-out forwards',
        'like-pulse': 'like-pulse 600ms ease-in-out 250ms',
        'fade-in': 'fade-in 800ms ease-out both',
        'pop-in': 'pop-in 700ms cubic-bezier(.2,.9,.3,1.2) both',
        float: 'float 5s ease-in infinite',
        'slow-zoom': 'slow-zoom 12s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
