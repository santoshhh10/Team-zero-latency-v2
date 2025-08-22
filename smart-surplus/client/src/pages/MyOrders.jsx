import { useEffect, useState } from 'react'
import { useAuth } from '../state/auth.jsx'
import { format } from 'date-fns'

export default function MyOrders() {
	const { api } = useAuth()
	const [orders, setOrders] = useState([])

	useEffect(() => {
		let mounted = true
		async function load() {
			const res = await api.get('/orders/my')
			if (mounted) setOrders(res.data.orders)
		}
		load();
		return () => { mounted = false }
	}, [])

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h2 className="text-2xl font-bold mb-4">My Reservations</h2>
			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{orders.map(o => (
					<div key={o._id} className="card bg-base-100 shadow">
						<div className="card-body">
							<h3 className="card-title text-lg">{o.foodItem?.title || 'Food item'}</h3>
							<p className="text-sm text-gray-500">Status: {o.status}</p>
							{(o.status === 'RESERVED') && (
								<div className="p-3 rounded grid gap-2">
									<div className="text-sm">Your pickup token:</div>
									<div className="text-2xl font-mono font-bold tracking-widest">
										{(() => { try { const p = JSON.parse(o.qrPayload); return p.token || p.secret || '—' } catch { return '—' } })()}
									</div>
									<div className="text-xs text-gray-500">Show this token at pickup</div>
								</div>
							)}
							<p className="text-xs text-gray-400">Reserved on {format(new Date(o.createdAt), 'MMM d, p')}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}