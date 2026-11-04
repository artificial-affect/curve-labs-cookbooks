import type { Config } from 'tailwindcss';

const config: Config = {
  plugins: [],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      animation: { 'fade-in': 'fade-in 180ms ease-out' },
      keyframes: {
        'fade-in': { to: { opacity: '1', transform: 'translateY(0)' }, from: { opacity: '0', transform: 'translateY(4px)' } },
      },
      colors: {
        ring: 'hsl(var(--ring))',
        input: 'hsl(var(--input))',
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
      },
    },
  },
};

export default config;
