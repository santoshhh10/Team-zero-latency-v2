import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
		extend: {}
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				smartlight: {
					primary: '#6366f1',
					secondary: '#10b981',
					accent: '#f59e0b',
					neutral: '#1f2937',
					'base-100': '#f7fafc',
					info: '#38bdf8',
					success: '#10b981',
					warning: '#f59e0b',
					error: '#ef4444'
				}
			},
			{
				smartdark: {
					primary: '#6366f1',
					secondary: '#10b981',
					accent: '#f59e0b',
					neutral: '#0b1220',
					'base-100': '#0f172a',
					info: '#38bdf8',
					success: '#10b981',
					warning: '#f59e0b',
					error: '#ef4444'
				}
			}
		]
	}
};