/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'pw-sm': 'var(--radius-sm)',
  			'pw-md': 'var(--radius-md)',
  			'pw-lg': 'var(--radius-lg)',
  			'pw-xl': 'var(--radius-xl)',
  			pill: 'var(--radius-pill)'
  		},
  		boxShadow: {
  			'pw-sm': 'var(--shadow-sm)',
  			'pw-md': 'var(--shadow-md)',
  			'pw-lg': 'var(--shadow-lg)'
  		},
  		spacing: {
  			'pw-1': 'var(--space-1)',
  			'pw-2': 'var(--space-2)',
  			'pw-3': 'var(--space-3)',
  			'pw-4': 'var(--space-4)',
  			'pw-5': 'var(--space-5)',
  			'pw-6': 'var(--space-6)',
  			'pw-7': 'var(--space-7)',
  			'pw-8': 'var(--space-8)',
  			'pw-9': 'var(--space-9)',
  			'pw-10': 'var(--space-10)'
  		},
  		fontSize: {
  			'pw-xs': ['var(--text-xs)', { lineHeight: 'var(--leading-snug)' }],
  			'pw-sm': ['var(--text-sm)', { lineHeight: 'var(--leading-normal)' }],
  			'pw-base': ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
  			'pw-md': ['var(--text-md)', { lineHeight: 'var(--leading-normal)' }],
  			'pw-lg': ['var(--text-lg)', { lineHeight: 'var(--leading-snug)' }],
  			'pw-xl': ['var(--text-xl)', { lineHeight: 'var(--leading-snug)' }],
  			'pw-2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
  			'pw-3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
  			'pw-4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }]
  		},
  		transitionDuration: {
  			pw: '180ms'
  		},
  		colors: {
  			cream: 'var(--color-bg)',
  			surface: 'var(--color-surface)',
  			ink: {
  				DEFAULT: 'var(--color-text)',
  				muted: 'var(--text-muted)',
  				subtle: 'var(--text-subtle)'
  			},
  			divider: 'var(--color-divider)',
  			brand: {
  				DEFAULT: 'var(--color-accent)',
  				100: 'var(--color-accent-100)',
  				200: 'var(--color-accent-200)',
  				300: 'var(--color-accent-300)',
  				400: 'var(--color-accent-400)',
  				500: 'var(--color-accent-500)',
  				600: 'var(--color-accent-600)',
  				700: 'var(--color-accent-700)',
  				800: 'var(--color-accent-800)',
  				900: 'var(--color-accent-900)'
  			},
  			sage: {
  				DEFAULT: 'var(--color-accent-2)',
  				100: 'var(--color-accent-2-100)',
  				200: 'var(--color-accent-2-200)',
  				300: 'var(--color-accent-2-300)',
  				400: 'var(--color-accent-2-400)',
  				500: 'var(--color-accent-2-500)',
  				600: 'var(--color-accent-2-600)',
  				700: 'var(--color-accent-2-700)',
  				800: 'var(--color-accent-2-800)',
  				900: 'var(--color-accent-2-900)'
  			},
  			neutral: {
  				100: 'var(--color-neutral-100)',
  				200: 'var(--color-neutral-200)',
  				300: 'var(--color-neutral-300)',
  				400: 'var(--color-neutral-400)',
  				500: 'var(--color-neutral-500)',
  				600: 'var(--color-neutral-600)',
  				700: 'var(--color-neutral-700)',
  				800: 'var(--color-neutral-800)',
  				900: 'var(--color-neutral-900)'
  			},
  			success: { DEFAULT: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  			warning: { DEFAULT: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  			danger: { DEFAULT: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
  			info: { DEFAULT: 'var(--color-info)', bg: 'var(--color-info-bg)' },
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
