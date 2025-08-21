import { useEffect, useState } from 'react'

export default function ThemeToggle() {
	const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'smartdark')

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme)
		localStorage.setItem('theme', theme)
	}, [theme])

	return (
		<button className="btn btn-ghost btn-sm" onClick={() => setTheme(t => t === 'smartdark' ? 'smartlight' : 'smartdark')}>
			{theme === 'smartdark' ? '☀️' : '🌙'}
		</button>
	)
}

