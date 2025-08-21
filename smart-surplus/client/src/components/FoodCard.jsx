import { FiMapPin, FiHeart } from 'react-icons/fi'

export default function FoodCard({ item, onReserve }) {
	const discounted = item.discountPercent > 0
	const price = item.price
	const finalPrice = discounted ? Math.max(0, price * (1 - item.discountPercent / 100)) : price
	const freshnessMap = { HOT:'bg-amber-500/20 text-amber-300', FRESH:'bg-emerald-500/20 text-emerald-300', CHILLED:'bg-cyan-500/20 text-cyan-300', LEFTOVER:'bg-fuchsia-500/20 text-fuchsia-300', SAFE:'bg-slate-500/20 text-slate-300' }
	return (
		<div className="glass overflow-hidden hover:translate-y-[-2px] transition">
			<div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900">
				<img src={`https://picsum.photos/seed/${item._id}/600/400`} alt={item.title} className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
				<button className="absolute top-2 right-2 btn btn-circle btn-ghost btn-sm"><FiHeart/></button>
			</div>
			<div className="p-4">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold">{item.title}</h3>
					<span className={`badge ${freshnessMap[item.qualityTag] || 'badge-ghost'}`}>{item.qualityTag}</span>
				</div>
				<p className="text-sm text-gray-400 line-clamp-2 mt-1">{item.description || 'Tasty and safe surplus food available.'}</p>
				<div className="flex items-center gap-2 text-xs mt-2 text-gray-400"><FiMapPin/>{item.location || 'Campus'}</div>
				<div className="flex items-center justify-between mt-3">
					<div>
						{discounted ? (
							<div className="flex items-baseline gap-2">
								<span className="text-lg font-bold text-primary">₹{finalPrice.toFixed(0)}</span>
								<span className="line-through text-xs text-gray-500">₹{price.toFixed(0)}</span>
								<span className="badge badge-success">{item.discountPercent}% OFF</span>
							</div>
						) : <span className="text-lg font-bold">{price > 0 ? `₹${price.toFixed(0)}` : 'Free'}</span>}
					</div>
					<button className="btn btn-primary btn-sm glow" disabled={item.status !== 'AVAILABLE'} onClick={() => onReserve(item)}>Reserve</button>
				</div>
			</div>
		</div>
	)
}

