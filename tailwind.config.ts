import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					soft: 'hsl(var(--accent-soft))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				elegant: {
					50: 'hsl(45 60% 95%)',
					100: 'hsl(45 55% 90%)',
					200: 'hsl(45 50% 80%)',
					300: 'hsl(45 45% 70%)',
					400: 'hsl(45 40% 60%)',
					500: 'hsl(45 85% 55%)',
					600: 'hsl(45 80% 45%)',
					700: 'hsl(45 75% 35%)',
					800: 'hsl(45 70% 25%)',
					900: 'hsl(45 65% 15%)',
				},
				navy: {
					50: 'hsl(220 60% 95%)',
					100: 'hsl(220 55% 90%)',
					200: 'hsl(220 50% 80%)',
					300: 'hsl(220 45% 70%)',
					400: 'hsl(220 40% 60%)',
					500: 'hsl(220 50% 25%)',
					600: 'hsl(220 55% 20%)',
					700: 'hsl(220 60% 15%)',
					800: 'hsl(220 65% 10%)',
					900: 'hsl(220 70% 5%)',
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
				sans: ['Inter', 'system-ui', 'sans-serif'],
				serif: ['Crimson Text', 'Georgia', 'serif'],
				mono: ['JetBrains Mono', 'Consolas', 'monospace'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
				'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
				'base': ['1rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
				'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.015em' }],
				'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],
				'2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.025em' }],
				'3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.03em' }],
				'4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.035em' }],
				'5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
				'6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.045em' }],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(24px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.92)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'elegant-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px hsl(var(--accent) / 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px hsl(var(--accent) / 0.5)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
				'scale-in': 'scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
				'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
				'elegant-glow': 'elegant-glow 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite'
			},
			backdropBlur: {
				xs: '2px',
				sm: '4px',
				md: '8px',
				lg: '12px',
				xl: '16px',
				'2xl': '24px',
				'3xl': '40px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
