import { useEffect, useState } from 'react'
import { useAuth } from '../state/auth.jsx'
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner'

export default function OwnerDashboard() {
	const { api, user } = useAuth()
	const [items, setItems] = useState([])
	const [orders, setOrders] = useState([])
	const [scanMode, setScanMode] = useState(false)
	const [scanResult, setScanResult] = useState('')

	useEffect(() => {
		if (!user) return
		let mounted = true
		async function load() {
			const [mine, ords] = await Promise.all([
				api.get('/food/mine'),
				api.get('/orders/owner')
			])
			if (mounted) { setItems(mine.data.items); setOrders(ords.data.orders) }
		}
		load();
		return () => { mounted = false }
	}, [user])

	async function verify(qrText) {
		try {
			const res = await api.post('/orders/verify', { qrText })
			alert('Verified order ' + res.data.orderId)
		} catch (err) {
			alert(err.response?.data?.error || 'Failed to verify')
		}
	}

	if (!user || (user.role !== 'canteen' && user.role !== 'organizer' && user.role !== 'admin')) {
		return <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-500">Sign in as a canteen/organizer to view dashboard.</div>
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold mb-4">Owner Dashboard</h2>
				<button className="btn" onClick={() => setScanMode(s => !s)}>{scanMode ? 'Stop Scanner' : 'Scan Pickup QR'}</button>
			</div>
			{scanMode && (
				<div className="mb-6 rounded overflow-hidden">
					<QrScanner onDecode={(res) => { setScanResult(res); verify(res) }} onError={(err) => console.log(err?.message)} />
				</div>
			)}
			<div className="grid md:grid-cols-2 gap-8">
				<div>
					<h3 className="font-semibold mb-2">My Listings</h3>
					<div className="space-y-3">
						{items.map(it => (
							<div key={it._id} className="p-3 border rounded flex items-center justify-between">
								<div>
									<div className="font-medium">{it.title}</div>
									<div className="text-xs text-gray-500">Qty: {it.quantity} • Status: {it.status}</div>
								</div>
								<div className="text-sm text-gray-500">Best before: {new Date(it.bestBefore).toLocaleString()}</div>
							</div>
						))}
					</div>
				</div>
				<div>
					<h3 className="font-semibold mb-2">Recent Reservations</h3>
					<div className="space-y-3">
						{orders.map(o => (
							<div key={o._id} className="p-3 border rounded">
								<div className="font-medium">{o.foodItem?.title} <span className="badge ml-2">{o.status}</span></div>
								<div className="text-xs text-gray-500">Buyer: {o.buyer?.name} • {new Date(o.createdAt).toLocaleString()}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}