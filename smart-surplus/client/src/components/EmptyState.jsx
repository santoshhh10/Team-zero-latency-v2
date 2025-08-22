export default function EmptyState({ title, subtitle, action }) {
	return (
		<div className="glass p-8 text-center relative overflow-hidden">
			<div className="text-5xl mb-2 points-counter">👨‍🍳</div>
			<h3 className="text-xl font-semibold">{title}</h3>
			<p className="text-gray-600 mt-1">{subtitle}</p>
			<div className="mt-3">{action || <button className="cta-button">Let's cook up some events!</button>}</div>
			<div className="absolute -left-4 -bottom-4 text-4xl floating-food">🥗</div>
			<div className="absolute -right-3 top-3 text-4xl floating-food" style={{animationDelay:'0.5s'}}>🍩</div>
		</div>
	)
}

