export default function EmptyState({ title, subtitle, action }) {
	return (
		<div className="glass p-8 text-center">
			<div className="text-4xl">🍽️</div>
			<h3 className="text-xl font-semibold mt-2">{title}</h3>
			<p className="text-gray-400 mt-1">{subtitle}</p>
			{action}
		</div>
	)
}

