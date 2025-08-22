import { useEffect, useState } from 'react'
import { useAuth } from '../state/auth.jsx'
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner'
import toast from 'react-hot-toast'

export default function OwnerDashboard() {
	const { api, user } = useAuth()
	const [items, setItems] = useState([])
	const [orders, setOrders] = useState([])
	const [scanMode, setScanMode] = useState(false)
	const [scanResult, setScanResult] = useState('')
	const [tokenInput, setTokenInput] = useState('')
	const [claiming, setClaiming] = useState(false)
	const [dec, setDec] = useState({})

	async function load() {
		const [mine, ords] = await Promise.all([
			api.get('/food/mine'),
			api.get('/orders/owner')
		])
		setItems(mine.data.items); setOrders(ords.data.orders)
	}

	useEffect(() => {
		if (!user) return
		let mounted = true
		;(async () => { if (mounted) await load() })()
		return () => { mounted = false }
	}, [user])

	async function verify(qrText) {
		try {
			const res = await api.post('/orders/verify', { qrText })
			toast.success('Claimed order ' + res.data.orderId)
			await load()
		} catch (err) {
			toast.error(err.response?.data?.error || 'Failed to verify')
		}
	}

	async function claimByToken() {
		if (!tokenInput.trim()) return toast.error('Enter token')
		try {
			setClaiming(true)
			const token = tokenInput.trim().toUpperCase()
			const res = await api.post('/orders/verify', { token })
			toast.success('Claimed order ' + res.data.orderId)
			setTokenInput('')
			await load()
		} catch (err) {
			toast.error(err.response?.data?.error || 'Failed to claim')
		} finally { setClaiming(false) }
	}

	async function reducePortions(itemId) {
		const amount = Math.max(1, Number(dec[itemId]) || 1)
		try {
			await api.post(`/food/${itemId}/decrement`, { amount })
			await load()
		} catch (err) {
			toast.error(err.response?.data?.error || 'Failed to reduce')
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
			<div className="mb-6 flex items-end gap-2">
				<div className="form-control">
					<label className="label p-0 pb-1"><span className="label-text text-xs">Enter pickup token</span></label>
					<input className="input input-bordered input-sm w-48" placeholder="e.g., 7KX9P2" value={tokenInput} onChange={e => setTokenInput(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') claimByToken() }} />
				</div>
				<button className={`btn btn-sm ${claiming ? 'btn-disabled' : ''}`} onClick={claimByToken} disabled={claiming}>{claiming ? 'Claiming...' : 'Claim'}</button>
			</div>
			<div className="grid md:grid-cols-2 gap-8">
				<div>
					<h3 className="font-semibold mb-2">My Listings</h3>
					<div className="space-y-3">
						{items.map(it => (
							<div key={it._id} className="p-3 border rounded flex items-center justify-between">
								<div>
									<div className="font-medium">{it.title}</div>
									<div className="text-xs text-gray-500">Qty: {it.quantity} • Status: {it.status}</div>
									<div className="text-xs text-gray-500">Best before: {new Date(it.bestBefore).toLocaleString()}</div>
								</div>
								<div className="flex items-center gap-2">
									<input
										type="number"
										min={1}
										defaultValue={1}
										className="input input-bordered input-xs w-16"
										onChange={e => setDec(d => ({ ...d, [it._id]: Math.max(1, Number(e.target.value) || 1) }))}
									/>
									<button className="btn btn-xs btn-warning" onClick={() => reducePortions(it._id)} disabled={it.status === 'EXPIRED' || it.quantity <= 0}>
										Reduce
									</button>
								</div>
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