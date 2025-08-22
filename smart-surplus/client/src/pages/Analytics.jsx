import { useEffect, useState } from 'react'
import { useAuth } from '../state/auth.jsx'
import { Line, Doughnut } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js'
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend)

export default function Analytics() {
	const { api } = useAuth()
	const [summary, setSummary] = useState(null)
	const [top, setTop] = useState([])
	useEffect(() => {
		let mounted = true
		async function load() {
			const [sum, lb] = await Promise.all([
				api.get('/analytics/summary'),
				api.get('/analytics/leaderboard')
			])
			if (mounted) { setSummary(sum.data); setTop(lb.data.top || []) }
		}
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
					<div className="skeleton-glass h-24"></div>
				) : (
					<div className="stats glass">
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
				{summary && (
					<div className="grid md:grid-cols-2 gap-6 mt-6">
						<div className="glass p-4">
							<div className="font-semibold mb-2">Collections over time (demo)</div>
							<Line data={{ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets:[{ label:'Portions', data:[3,5,8,6,9,12,7], borderColor:'#6366f1', tension:.35 }] }} options={{ plugins:{legend:{display:false}}, scales:{y:{display:false},x:{display:false}} }} />
						</div>
						<div className="glass p-4">
							<div className="font-semibold mb-2">Impact breakdown</div>
							<Doughnut data={{ labels:['Carbon (kg)','Water (L)'], datasets:[{ data:[summary.carbonSavedKg, summary.waterSavedLiters], backgroundColor:['#6366f1','#10b981'] }] }} options={{ plugins:{legend:{position:'bottom'}} }} />
						</div>
						<div className="glass p-4 md:col-span-2">
							<div className="font-semibold mb-2">Leaderboard (Green Points)</div>
							<div className="overflow-x-auto">
								<table className="table table-sm">
									<thead>
										<tr><th>#</th><th>Name</th><th>Role</th><th>Points</th></tr>
									</thead>
									<tbody>
										{top.map((u, i) => (
											<tr key={u._id || i}>
												<td>{i+1}</td>
												<td>{u.name}</td>
												<td>{u.role}</td>
												<td>{u.greenPoints}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}