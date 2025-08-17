import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../state/auth.jsx'

export default function ListItem() {
	const { api, user } = useAuth()
	const [form, setForm] = useState({ title: '', description: '', quantity: 10, unit: 'portion', price: 0, qualityTag: 'SAFE', bestBefore: '', location: '', discountPercent: 0 })
	const [imageFile, setImageFile] = useState(null)
	const finalPrice = useMemo(() => {
		const p = Number(form.price) || 0
		const d = Math.min(100, Math.max(0, Number(form.discountPercent) || 0))
		return Math.max(0, Math.round(p * (1 - d / 100)))
	}, [form.price, form.discountPercent])

	async function submit(e) {
		e.preventDefault()
		try {
			const data = new FormData()
			Object.entries(form).forEach(([k, v]) => data.append(k, v))
			if (imageFile) data.append('image', imageFile)
			await api.post('/food', data, { headers: { 'Content-Type': 'multipart/form-data' } })
			toast.success('Listed!')
			setForm({ title: '', description: '', quantity: 10, unit: 'portion', price: 0, qualityTag: 'SAFE', bestBefore: '', location: '', discountPercent: 0 })
			setImageFile(null)
		} catch (err) {
			toast.error(err.response?.data?.error || 'Failed')
		}
	}

	if (!user || (user.role !== 'canteen' && user.role !== 'organizer' && user.role !== 'admin')) {
		return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-gray-500">Sign in as a canteen/organizer to list food.</div>
	}

	return (
		<div className="max-w-2xl mx-auto px-4 py-10">
			<h2 className="text-2xl font-bold mb-4">List surplus food</h2>
			<form onSubmit={submit} className="grid grid-cols-1 gap-3">
				<input className="input input-bordered" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
				<textarea className="textarea textarea-bordered" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
				<label className="form-control">
					<div className="label"><span className="label-text">Upload image (optional)</span></div>
					<input type="file" accept="image/*" className="file-input file-input-bordered" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
				</label>
				<div className="grid grid-cols-2 gap-3">
					<input type="number" className="input input-bordered" placeholder="Quantity" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
					<input className="input input-bordered" placeholder="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
				</div>
				<div className="grid grid-cols-3 gap-3">
					<label className="form-control">
						<div className="label"><span className="label-text">Original price (₹)</span></div>
						<input type="number" className="input input-bordered" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
					</label>
					<label className="form-control">
						<div className="label"><span className="label-text">Discount %</span></div>
						<input type="number" className="input input-bordered" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))} />
					</label>
					<label className="form-control">
						<div className="label"><span className="label-text">Final price (auto)</span></div>
						<input className="input input-bordered" value={finalPrice} readOnly />
					</label>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<select className="select select-bordered" value={form.qualityTag} onChange={e => setForm(f => ({ ...f, qualityTag: e.target.value }))}>
						<option>SAFE</option>
						<option>FRESH</option>
						<option>HOT</option>
						<option>CHILLED</option>
						<option>LEFTOVER</option>
					</select>
					<input type="datetime-local" className="input input-bordered" value={form.bestBefore} onChange={e => setForm(f => ({ ...f, bestBefore: e.target.value }))} />
				</div>
				<input className="input input-bordered" placeholder="Pickup location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
				<button className="btn btn-primary" type="submit">Publish</button>
			</form>
		</div>
	)
}