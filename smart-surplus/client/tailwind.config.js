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
					primary: '#4CAF50', // Fresh Green
					secondary: '#FF9800', // Warm Orange
					accent: '#FF5722', // Tomato Red
					neutral: '#2E7D32', // Deep Forest
					'base-100': '#FFF8E1', // Cream White
					info: '#8BC34A',
					success: '#4CAF50',
					warning: '#FFC107',
					error: '#FF7043'
				}
			},
			{
				smartdark: {
					primary: '#8BC34A',
					secondary: '#FFB74D',
					accent: '#FF7043',
					neutral: '#1B5E20',
					'base-100': '#0f172a',
					info: '#81D4FA',
					success: '#66BB6A',
					warning: '#FFD54F',
					error: '#EF5350'
				}
			}
		]
	}
};