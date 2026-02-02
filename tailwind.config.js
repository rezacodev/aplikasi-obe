/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
  safelist: [
    // Data attributes
    'data-[state=selected]:bg-muted',
    'data-[state=open]:bg-accent',
    'data-[state=checked]:bg-primary',
    'data-[state=checked]:text-primary-foreground',
    // Common utility classes
    'hover:bg-muted/50',
    'hover:bg-accent',
    'hover:text-accent-foreground',
    'focus-visible:ring-ring/50',
    'focus-visible:ring-[3px]',
    'border-input',
    'bg-background',
    'text-muted-foreground',
    'text-foreground',
    // Button variants
    'bg-primary',
    'text-primary-foreground',
    'hover:bg-primary/90',
    'border',
    'shadow-xs',
    'hover:bg-accent',
    'hover:text-accent-foreground',
    // Table classes
    'rounded-md',
    'border-b',
    'transition-colors',
    'h-12',
    'px-4',
    'align-middle',
    'font-medium',
    'p-4',
    // Layout classes
    'w-full',
    'flex',
    'items-center',
    'justify-end',
    'space-x-2',
    'py-4',
    'max-w-sm',
    'ml-auto',
  ],
}