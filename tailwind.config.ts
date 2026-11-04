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
    },
  },
  plugins: [],
} satisfies Config;
