import { motion } from 'framer-motion'

export default function Hero({ onSearch, value, onFilter }) {
	return (
		<section className="relative overflow-hidden">
			<div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
				<motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.5}}
					className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Eat smart, save food, earn <span className="text-secondary">green points</span>
				</motion.h1>
				<p className="text-gray-400 mt-3 max-w-2xl">Discover surplus food across campus with real‑time alerts and hot deals.</p>
				<div className="mt-6 glass p-2">
					<div className="relative">
						<input className="input input-ghost w-full pl-4 text-base" placeholder="Search dishes, canteens, tags…" value={value} onChange={e => onSearch(e.target.value)} />
					</div>
				</div>
				<div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
					<button onClick={() => onFilter({ nearExpiry: true })} className="glass p-4 text-left hover:border-white/20">
						<div className="badge badge-warning badge-outline">⏰</div>
						<div className="font-semibold mt-2">Near Expiry</div>
						<div className="text-xs text-gray-400">Within 1 hour</div>
					</button>
					<button onClick={() => onFilter({ free: true })} className="glass p-4 text-left hover:border-white/20">
						<div className="badge badge-success badge-outline">🆓</div>
						<div className="font-semibold mt-2">Free Items</div>
						<div className="text-xs text-gray-400">Price ₹0</div>
					</button>
					<button onClick={() => onFilter({ sort: 'popular' })} className="glass p-4 text-left hover:border-white/20">
						<div className="badge badge-primary badge-outline">🔥</div>
						<div className="font-semibold mt-2">Popular Now</div>
						<div className="text-xs text-gray-400">Highest discounts</div>
					</button>
					<button onClick={() => onFilter({ veg: true })} className="glass p-4 text-left hover:border-white/20">
						<div className="badge badge-secondary badge-outline">🥗</div>
						<div className="font-semibold mt-2">Vegetarian</div>
						<div className="text-xs text-gray-400">Veg-friendly</div>
					</button>
				</div>
			</div>
		</section>
	)
}

