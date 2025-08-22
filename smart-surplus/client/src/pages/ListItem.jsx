import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../state/auth.jsx'

export default function ListItem() {
	const { api, user } = useAuth()
	const [form, setForm] = useState({ title: '', description: '', quantity: 10, unit: 'portion', price: 0, qualityTag: 'SAFE', bestBefore: '', location: '', discountPercent: 0, imageFile: null })
	const [step, setStep] = useState(0)
	const [preview, setPreview] = useState('')
	const videoRef = useRef(null)
	const [camOn, setCamOn] = useState(false)

	async function submit(e) {
		e.preventDefault()

		if (step < 3) { setStep(3); return }
		if (!form.imageFile) { toast.error('Please capture a photo'); return }

		try {
			const fd = new FormData()
			fd.append('title', form.title)
			fd.append('description', form.description)
			fd.append('quantity', String(form.quantity))
			fd.append('unit', form.unit)
			fd.append('price', String(form.price))
			fd.append('qualityTag', form.qualityTag)
			fd.append('bestBefore', form.bestBefore)
			fd.append('location', form.location)
			fd.append('discountPercent', String(form.discountPercent))
			fd.append('image', form.imageFile)

						await api.post('/food', fd)
			toast.success('Listed!')
			setStep(0); setPreview('')
			setForm({ title: '', description: '', quantity: 10, unit: 'portion', price: 0, qualityTag: 'SAFE', bestBefore: '', location: '', discountPercent: 0, imageFile: null })
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
			<form onSubmit={submit} onKeyDown={(e) => { if (e.key === 'Enter' && step < 3) e.preventDefault() }} className="grid grid-cols-1 gap-3 glass p-4">
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
						<div className="space-y-2">
							{camOn ? (
								<div className="space-y-2">
									<video ref={videoRef} autoPlay playsInline className="w-full rounded" />
									<div className="flex gap-2">
										<button type="button" className="btn btn-sm" onClick={async () => {
											try {
												const stream = await navigator.mediaDevices.getUserMedia({ video: true })
												if (videoRef.current) videoRef.current.srcObject = stream
											} catch {}
										}}>Start</button>
										<button type="button" className="btn btn-sm btn-primary" onClick={() => {
											const video = videoRef.current; if (!video) return
											const canvas = document.createElement('canvas')
											canvas.width = video.videoWidth; canvas.height = video.videoHeight
											const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0)
											canvas.toBlob((blob) => {
												if (blob) {
													const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
													const url = URL.createObjectURL(file)
													setPreview(url); setForm(x => ({ ...x, imageFile: file }))
												}
											}, 'image/jpeg', 0.85)
										}}>Capture</button>
										<button type="button" className="btn btn-sm btn-ghost" onClick={() => {
											const video = videoRef.current; if (video && video.srcObject) { (video.srcObject).getTracks().forEach(t => t.stop()); video.srcObject = null }
											setCamOn(false)
										}}>Stop</button>
									</div>
								</div>
							) : (
								<button type="button" className="btn btn-outline btn-sm" onClick={() => setCamOn(true)}>Use Camera</button>
							)}
							{preview && <img src={preview} alt="preview" className="h-28 object-cover rounded" />}
						</div>
					</>
				)}
				<div className="flex items-center justify-between mt-2">
					<button type="button" className="btn btn-ghost" disabled={step===0} onClick={() => setStep(s => Math.max(0, s-1))}>Back</button>
					{step < 3 ? (
						<button type="button" className="btn btn-primary" onClick={() => setStep(s => Math.min(3, s+1))}>Next</button>
					) : (
						<button className="btn btn-primary" type="submit" disabled={!form.imageFile}>Publish</button>
					)}
				</div>
			</form>
		</div>
	)
}