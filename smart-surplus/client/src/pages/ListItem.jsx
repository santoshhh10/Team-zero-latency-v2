import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../state/auth.jsx'

export default function ListItem() {
	const { api, user } = useAuth()
	const [form, setForm] = useState({ title: '', description: '', quantity: 10, unit: 'portion', price: 0, qualityTag: 'SAFE', bestBefore: '', location: '', discountPercent: 0, imageFile: null })
	const [step, setStep] = useState(0)
	const [preview, setPreview] = useState('')

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
			<h2 className="text-2xl font-bold mb-2">List surplus food</h2>
			<div className="flex items-center justify-between mb-4">
				{[0,1,2,3].map(i => (
					<div key={i} className={`flex-1 h-2 mx-1 rounded ${i<=step?'bg-primary':'bg-white/10'}`}></div>
				))}
			</div>
			<form onSubmit={submit} className="grid grid-cols-1 gap-3 glass p-4">
				{step === 0 && (
					<>
						<input className="input input-bordered" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
						<textarea className="textarea textarea-bordered" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
					</>
				)}
				{step === 1 && (
					<>
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
					</>
				)}
				{step === 2 && (
					<>
						<input type="datetime-local" className="input input-bordered" value={form.bestBefore} onChange={e => setForm(f => ({ ...f, bestBefore: e.target.value }))} />
						<input className="input input-bordered" placeholder="Pickup location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
						<input type="number" className="input input-bordered" placeholder="Discount %" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))} />
					</>
				)}
				{step === 3 && (
					<>
						<div className="">
							<div className="text-sm text-gray-400 mb-2">Photo (optional)</div>
							<label className="border border-dashed border-white/20 rounded p-6 grid place-items-center cursor-pointer hover:border-white/40">
								<input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { const url = URL.createObjectURL(f); setPreview(url); setForm(x=>({...x, imageFile: f})) } }} />
								{preview ? <img src={preview} alt="preview" className="h-28 object-cover rounded"/> : <div className="text-gray-500">Drag & drop or click to upload</div>}
							</label>
						</div>
					</>
				)}
				<div className="flex items-center justify-between mt-2">
					<button type="button" className="btn btn-ghost" disabled={step===0} onClick={() => setStep(s => Math.max(0, s-1))}>Back</button>
					{step < 3 ? (
						<button type="button" className="btn btn-primary" onClick={() => setStep(s => Math.min(3, s+1))}>Next</button>
					) : (
						<button className="btn btn-primary" type="submit">Publish</button>
					)}
				</div>
			</form>
		</div>
	)
}