import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '../state/auth.jsx'

export default function Hero({ onSearch, value, onFilter }) {
	const { api } = useAuth()
	const [impact, setImpact] = useState({ portionsCollected: 0, carbonSavedKg: 0, waterSavedLiters: 0, activeListings: 0 })
	const [anim, setAnim] = useState(0)
	useEffect(() => {
		let mounted = true
		;(async () => {
			try { const res = await api.get('/analytics/summary'); if (mounted) setImpact(res.data) } catch {}
		})()
		return () => { mounted = false }
	}, [])
	useEffect(() => {
		const start = anim
		const end = impact.portionsCollected || 0
		if (start === end) return
		let raf; const t0 = performance.now(); const duration = 1200
		const tick = (now) => {
			const p = Math.min(1, (now - t0) / duration)
			setAnim(Math.round(start + (end - start) * p))
			if (p < 1) raf = requestAnimationFrame(tick)
		}
		raf = requestAnimationFrame(tick)
		return () => { if (raf) cancelAnimationFrame(raf) }
	}, [impact.portionsCollected])
	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 pointer-events-none" aria-hidden>
				<div className="floating-food absolute left-6 top-6 text-4xl">🥑</div>
				<div className="floating-food absolute right-8 top-10 text-4xl" style={{animationDelay:'0.5s'}}>🍅</div>
				<div className="floating-food absolute left-1/2 bottom-6 text-4xl" style={{animationDelay:'1s'}}>🥕</div>
			</div>
			<div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
				<motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.5}}
					className="text-4xl md:text-5xl font-extrabold tracking-tight">
					🌱 Save Food, Save Planet, Earn Rewards! 🏆
				</motion.h1>
				<p className="text-base-content/70 mt-3 max-w-2xl">"Turn surplus into impact - every meal matters!"</p>
				<div className="mt-6 glass p-2">
					<div className="relative">
						<input className="input input-ghost w-full pl-4 text-base" placeholder="Search dishes, canteens, tags…" value={value} onChange={e => onSearch(e.target.value)} />
					</div>
				</div>
				<div className="mt-4 text-sm text-[#2E7D32] font-semibold">Community impact: 🍽️ {anim} portions • 🌱 {impact.carbonSavedKg.toFixed(1)} kg • 💧 {impact.waterSavedLiters.toFixed(0)} L</div>
				<div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
					<button onClick={() => onFilter({ nearExpiry: true })} className="p-4 text-left hover:translate-y-[-2px] transition rounded-xl text-white" style={{background:'linear-gradient(135deg,#FF7043 0%,#FF9800 100%)'}}>
						<div className="badge badge-warning badge-outline">🕐</div>
						<div className="font-semibold mt-2">Near Expiry</div>
						<div className="text-xs text-white/90">Within 1 hour</div>
					</button>
					<button onClick={() => onFilter({ free: true })} className="p-4 text-left hover:translate-y-[-2px] transition rounded-xl text-[#2E7D32]" style={{background:'linear-gradient(135deg,#FFD54F 0%,#FFC107 100%)'}}>
						<div className="badge badge-success badge-outline">🎁</div>
						<div className="font-semibold mt-2">Free Items</div>
						<div className="text-xs text-[#2E7D32]">Price ₹0</div>
					</button>
					<button onClick={() => onFilter({ sort: 'popular' })} className="p-4 text-left hover:translate-y-[-2px] transition rounded-xl text-white" style={{background:'linear-gradient(135deg,#FF9800 0%,#FF5722 100%)'}}>
						<div className="badge badge-primary badge-outline">🔥</div>
						<div className="font-semibold mt-2">Popular Now</div>
						<div className="text-xs text-white/90">Trending deals</div>
					</button>
					<button onClick={() => onFilter({ veg: true })} className="p-4 text-left hover:translate-y-[-2px] transition rounded-xl text-white" style={{background:'linear-gradient(135deg,#8BC34A 0%,#4CAF50 100%)'}}>
						<div className="badge badge-secondary badge-outline">🥬</div>
						<div className="font-semibold mt-2">Vegetarian</div>
						<div className="text-xs text-white/90">Leafy fresh</div>
					</button>
				</div>
			</div>
		</section>
	)
}

