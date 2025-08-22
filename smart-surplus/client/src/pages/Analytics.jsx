import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../state/auth.jsx'
import { Line, Doughnut } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

function Podium({ users }) {
	const [a,b,c] = users
	return (
		<div className="grid grid-cols-3 gap-3 items-end text-center">
			<div className="bg-base-100 border rounded-xl p-3">
				<div className="text-2xl">🥈</div>
				<div className="font-semibold line-clamp-1">{b?.name || '-'}</div>
				<div className="text-sm text-base-content/70">{b?.greenPoints || 0} pts</div>
			</div>
			<div className="bg-base-100 border rounded-xl p-4 shadow-md">
				<div className="text-3xl">🥇</div>
				<div className="font-semibold line-clamp-1">{a?.name || '-'}</div>
				<div className="text-sm text-base-content/70">{a?.greenPoints || 0} pts</div>
			</div>
			<div className="bg-base-100 border rounded-xl p-3">
				<div className="text-2xl">🥉</div>
				<div className="font-semibold line-clamp-1">{c?.name || '-'}</div>
				<div className="text-sm text-base-content/70">{c?.greenPoints || 0} pts</div>
			</div>
		</div>
	)
}

export default function Analytics() {
	const { api } = useAuth()
	const [summary, setSummary] = useState(null)
	const [top, setTop] = useState([])
	const [anim, setAnim] = useState({ portions: 0, carbon: 0, water: 0, active: 0 })
	const podium = useMemo(() => top.slice(0,3), [top])
	const rest = useMemo(() => top.slice(3), [top])
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
	useEffect(() => {
		if (!summary) return
		const start = anim
		const end = { portions: summary.portionsCollected, carbon: Math.round(summary.carbonSavedKg), water: Math.round(summary.waterSavedLiters), active: summary.activeListings }
		let raf; const t0 = performance.now(); const duration = 800
		const tick = (now) => {
			const p = Math.min(1, (now - t0) / duration)
			setAnim({
				portions: Math.round(start.portions + (end.portions - start.portions) * p),
				carbon: Math.round(start.carbon + (end.carbon - start.carbon) * p),
				water: Math.round(start.water + (end.water - start.water) * p),
				active: Math.round(start.active + (end.active - start.active) * p),
			})
			if (p < 1) raf = requestAnimationFrame(tick)
		}
		raf = requestAnimationFrame(tick)
		return () => { if (raf) cancelAnimationFrame(raf) }
	}, [summary])
	return (
		<div className="fixed inset-0 z-40 bg-black/40">
			<div className="absolute inset-x-0 bottom-0 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/75 rounded-t-2xl overflow-auto max-h-[92%]">
				<div className="max-w-6xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-2xl md:text-3xl font-extrabold">🏆 Green Champions Leaderboard 🌟</div>
							<div className="text-sm text-gray-600">"Heroes of Food Sustainability!"</div>
						</div>
						<a href="/" className="btn btn-circle">🍏</a>
					</div>
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
						<div className="metric-card">
							<div className="text-sm opacity-80">Portions Collected 🍽️</div>
							<div className="text-3xl font-extrabold">{anim.portions}</div>
						</div>
						<div className="metric-card" style={{background:'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)'}}>
							<div className="text-sm opacity-80">Carbon Saved 🌱</div>
							<div className="text-3xl font-extrabold">{anim.carbon} kg</div>
						</div>
						<div className="metric-card" style={{background:'linear-gradient(135deg, #4FC3F7 0%, #0288D1 100%)'}}>
							<div className="text-sm opacity-80">Water Saved 💧</div>
							<div className="text-3xl font-extrabold">{anim.water} L</div>
						</div>
						<div className="metric-card" style={{background:'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)'}}>
							<div className="text-sm opacity-80">Active Listings 📋</div>
							<div className="text-3xl font-extrabold">{anim.active}</div>
						</div>
					</div>
					{summary ? (
						<div className="grid lg:grid-cols-2 gap-6 mt-6">
							<div className="glass p-4">
								<div className="font-semibold mb-2">Collections over time</div>
								<Line data={{ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets:[{ label:'Portions', data:[3,5,8,6,9,12,7], fill:true, backgroundColor:'rgba(76,175,80,0.15)', borderColor:'#4CAF50', tension:.35, pointRadius:4, pointBackgroundColor:'#FF9800' }] }} options={{ plugins:{legend:{display:false}, tooltip:{callbacks:{label:(ctx)=>`🍽️ ${ctx.parsed.y} portions`}}}, scales:{y:{display:false},x:{display:false}} }} />
							</div>
							<div className="glass p-4">
								<div className="font-semibold mb-2">Impact breakdown</div>
								<Doughnut data={{ labels:['Carbon (kg)','Water (L)'], datasets:[{ data:[summary.carbonSavedKg, summary.waterSavedLiters], backgroundColor:['#4CAF50','#FF9800'] }] }} options={{ plugins:{legend:{position:'bottom'}} }} />
							</div>
							<div className="glass p-4 lg:col-span-2">
								<div className="font-semibold mb-3">Leaderboard (Green Points)</div>
								{podium.length > 0 && (
									<div className="mb-4">
										<Podium users={podium} />
									</div>
								)}
								<div className="space-y-2">
									{rest.map((u, i) => {
										const maxPts = Math.max(1, podium[0]?.greenPoints || u.greenPoints)
										const pct = Math.min(100, Math.round((u.greenPoints / maxPts) * 100))
										return (
											<div key={u._id || i} className="p-3 border rounded flex items-center gap-3">
												<div className="w-8 text-center text-sm">{i+4}</div>
												<div className="flex-1">
													<div className="flex items-center justify-between text-sm">
														<div className="font-medium line-clamp-1">{u.name}</div>
														<div className="font-semibold">{u.greenPoints} pts</div>
													</div>
													<div className="h-2 bg-base-200 rounded mt-1 overflow-hidden">
														<div className="h-2 bg-primary" style={{ width: `${pct}%` }} />
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						</div>
					) : (
						<div className="skeleton-glass h-24 mt-6"></div>
					)}
				</div>
			</div>
		</div>
	)
}