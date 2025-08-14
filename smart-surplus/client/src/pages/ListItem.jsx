import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../state/auth.jsx'

export default function ListItem() {
	const { api, user } = useAuth()
	const [form, setForm] = useState({ title: '', description: '', quantity: 10, unit: 'portion', price: 0, qualityTag: 'SAFE', bestBefore: '', location: '', discountPercent: 0 })

	async function submit(e) {
		e.preventDefault()
		try {
			await api.post('/food', form)
			toast.success('Listed!')
			setForm({ title: '', description: '', quantity: 10, unit: 'portion', price: 0, qualityTag: 'SAFE', bestBefore: '', location: '', discountPercent: 0 })
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
				<div className="grid grid-cols-2 gap-3">
					<input type="number" className="input input-bordered" placeholder="Quantity" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
					<input className="input input-bordered" placeholder="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
				</div>
				<div className="grid grid-cols-2 gap-3">
					<input type="number" className="input input-bordered" placeholder="Price (₹) 0 for free" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
					<select className="select select-bordered" value={form.qualityTag} onChange={e => setForm(f => ({ ...f, qualityTag: e.target.value }))}>
						<option>SAFE</option>
						<option>FRESH</option>
						<option>HOT</option>
						<option>CHILLED</option>
						<option>LEFTOVER</option>
					</select>
				</div>
				<input type="datetime-local" className="input input-bordered" value={form.bestBefore} onChange={e => setForm(f => ({ ...f, bestBefore: e.target.value }))} />
				<input className="input input-bordered" placeholder="Pickup location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
				<input type="number" className="input input-bordered" placeholder="Discount %" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))} />
				<button className="btn btn-primary" type="submit">Publish</button>
			</form>
		</div>
	)
}