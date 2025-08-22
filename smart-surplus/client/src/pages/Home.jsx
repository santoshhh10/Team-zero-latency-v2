import { useEffect, useState } from 'react'
import { FiFilter } from 'react-icons/fi'
import { useAuth } from '../state/auth.jsx'
import Hero from '../components/Hero.jsx'
import FoodCard from '../components/FoodCard.jsx'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function Home() {
	const { api, user } = useAuth()
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState({ tag: '', q: '', veg: false, free: false, nearExpiry: false, sort: '' })

	useEffect(() => { AOS.init({ duration: 600, once: true }) }, [])

	useEffect(() => {
		let mounted = true
		async function load() {
			setLoading(true)
			const params = { status: 'AVAILABLE', q: filter.q, tag: filter.tag }
			if (filter.veg) params.veg = true
			if (filter.free) params.free = true
			if (filter.nearExpiry) params.nearExpiry = true
			if (filter.sort) params.sort = filter.sort
			const res = await api.get('/food', { params })
			if (mounted) setItems(res.data.items)
			setLoading(false)
		}
		load()
		return () => { mounted = false }
	}, [filter.q, filter.tag, filter.veg, filter.free, filter.nearExpiry, filter.sort])

	async function reserve(item) {
		if (!user) return alert('Please sign in to reserve')
		const res = await api.post(`/food/${item._id}/reserve`, { quantity: 1 })
		alert('Reserved! Show QR at pickup: ' + res.data.qrPayload)
	}

	return (
		<div>
			<Hero value={filter.q} onSearch={(q) => setFilter(f => ({ ...f, q }))} onFilter={(filt) => setFilter(prev => ({ ...prev, ...filt }))} />
			<section>
				<div className="max-w-6xl mx-auto px-4 py-8">
					<div className="flex items-center gap-3 mb-4">
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
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{loading ? Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="skeleton-glass h-64"></div>
						)) : items.map(item => (
							<div key={item._id} data-aos="fade-up"><FoodCard item={item} onReserve={reserve} /></div>
						))}
					</div>
				</div>
			</section>
		</div>
	)
}