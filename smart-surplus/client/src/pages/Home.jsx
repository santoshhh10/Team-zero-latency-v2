import { useEffect, useMemo, useState } from 'react'
import { FiMapPin, FiFilter, FiTag } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../state/auth.jsx'

function ListingCard({ item, onReserve }) {
	const timeLeft = useMemo(() => formatDistanceToNow(new Date(item.bestBefore), { addSuffix: true }), [item.bestBefore])
	const discounted = item.discountPercent > 0
	const price = item.price
	const finalPrice = discounted ? Math.max(0, price * (1 - item.discountPercent / 100)) : price
	return (
		<div className="card bg-base-100 shadow hover:shadow-lg transition overflow-hidden">
			<figure className="h-36 bg-gray-100">
				<img src={`https://picsum.photos/seed/${item._id}/600/400`} alt={item.title} className="w-full h-full object-cover" />
			</figure>
			<div className="card-body">
				<h3 className="card-title text-lg">{item.title}</h3>
				<p className="text-sm text-gray-500 line-clamp-2">{item.description || 'Tasty and safe surplus food available.'}</p>
				<div className="flex items-center gap-2 text-xs">
					<span className="badge badge-outline">{item.qualityTag}</span>
					<span className="badge"><FiMapPin /> {item.location || 'Campus'}</span>
					<span className="badge badge-ghost">Best before {timeLeft}</span>
				</div>
				<div className="flex items-center justify-between mt-2">
					<div>
						{discounted ? (
							<div className="flex items-baseline gap-2">
								<span className="text-lg font-semibold">₹{finalPrice.toFixed(0)}</span>
								<span className="line-through text-sm text-gray-400">₹{price.toFixed(0)}</span>
								<span className="badge badge-success">{item.discountPercent}% OFF</span>
							</div>
						) : (
							<span className="text-lg font-semibold">{price > 0 ? `₹${price.toFixed(0)}` : 'Free'}</span>
						)}
					</div>
					<button className="btn btn-primary btn-sm" onClick={() => onReserve(item)} disabled={item.status !== 'AVAILABLE'}>
						Reserve
					</button>
				</div>
			</div>
		</div>
	)
}

export default function Home() {
	const { api, user } = useAuth()
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState({ tag: '', q: '' })

	useEffect(() => {
		let mounted = true
		async function load() {
			setLoading(true)
			const res = await api.get('/food', { params: { status: 'AVAILABLE', q: filter.q, tag: filter.tag } })
			if (mounted) setItems(res.data.items)
			setLoading(false)
		}
		load()
		return () => { mounted = false }
	}, [filter.q, filter.tag])

	async function reserve(item) {
		if (!user) return alert('Please sign in to reserve')
		const res = await api.post(`/food/${item._id}/reserve`, { quantity: 1 })
		alert('Reserved! Show QR at pickup: ' + res.data.qrPayload)
	}

	return (
		<div>
			<section className="bg-gradient-to-r from-primary/10 to-pink-100">
				<div className="max-w-6xl mx-auto px-4 py-10">
					<h1 className="text-3xl md:text-4xl font-extrabold">Discover surplus food near you</h1>
					<p className="text-gray-600 mt-2">Save money, reduce waste, and earn green points.</p>
					<div className="mt-4 flex flex-col md:flex-row gap-3">
						<input className="input input-bordered flex-1" placeholder="Search for dishes or places" value={filter.q} onChange={e => setFilter(f => ({ ...f, q: e.target.value }))} />
						<select className="select select-bordered" value={filter.tag} onChange={e => setFilter(f => ({ ...f, tag: e.target.value }))}>
							<option value="">All tags</option>
							<option>FRESH</option>
							<option>HOT</option>
							<option>CHILLED</option>
							<option>LEFTOVER</option>
							<option>SAFE</option>
						</select>
						<button className="btn"><FiFilter /> Filters</button>
					</div>
				</div>
			</section>
			<section>
				<div className="max-w-6xl mx-auto px-4 py-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{loading ? Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="skeleton h-64"></div>
						)) : items.map(item => (
							<ListingCard key={item._id} item={item} onReserve={reserve} />
						))}
					</div>
				</div>
			</section>
		</div>
	)
}