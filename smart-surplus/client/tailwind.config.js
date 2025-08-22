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
					primary: '#2563EB',
					secondary: '#22C55E',
					accent: '#F59E0B',
					neutral: '#334155',
					'base-100': '#FAFAFA',
					info: '#38BDF8',
					success: '#22C55E',
					warning: '#F59E0B',
					error: '#EF4444'
				}
			},
			{
				smartdark: {
					primary: '#3B82F6',
					secondary: '#22C55E',
					accent: '#F59E0B',
					neutral: '#94A3B8',
					'base-100': '#0B1220',
					info: '#38BDF8',
					success: '#22C55E',
					warning: '#F59E0B',
					error: '#EF4444'
				}
			}
		]
	}
};