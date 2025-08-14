import { useEffect, useState } from 'react'
import { useAuth } from '../state/auth.jsx'

export default function Analytics() {
	const { api } = useAuth()
	const [summary, setSummary] = useState(null)
	useEffect(() => {
		let mounted = true
		async function load() { const res = await api.get('/analytics/summary'); if (mounted) setSummary(res.data) }
		load();
		return () => { mounted = false }
	}, [])
	return (
		<div>
			<section className="bg-gradient-to-r from-pink-50 to-red-50">
				<div className="max-w-6xl mx-auto px-4 py-10">
					<h1 className="text-3xl md:text-4xl font-extrabold">Our Impact</h1>
					<p className="text-gray-600 mt-2">Track the environmental benefits achieved by your campus</p>
				</div>
			</section>
			<div className="max-w-6xl mx-auto px-4 py-8">
				{!summary ? (
					<div className="skeleton h-24"></div>
				) : (
					<div className="stats shadow">
						<div className="stat">
							<div className="stat-title">Portions Collected</div>
							<div className="stat-value">{summary.portionsCollected}</div>
						</div>
						<div className="stat">
							<div className="stat-title">Carbon Saved</div>
							<div className="stat-value">{summary.carbonSavedKg.toFixed(1)} kg</div>
						</div>
						<div className="stat">
							<div className="stat-title">Water Saved</div>
							<div className="stat-value">{summary.waterSavedLiters.toFixed(0)} L</div>
						</div>
						<div className="stat">
							<div className="stat-title">Active Listings</div>
							<div className="stat-value">{summary.activeListings}</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}