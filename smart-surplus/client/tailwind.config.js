import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
		extend: {
			colors: {
				primary: '#e23744',
				accent: '#ff6d6d'
			}
		}
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				zomato: {
					primary: '#e23744',
					secondary: '#1c1c1c',
					accent: '#ff6d6d',
					neutral: '#2b3440',
					'base-100': '#ffffff'
				}
			}
		]
	}
};