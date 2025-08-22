import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../state/auth.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Events() {
	const { api, user } = useAuth()
	const [events, setEvents] = useState([])
	const [form, setForm] = useState({ title: '', location: '', startTime: '', endTime: '', expectedSurplusPortions: 0, notes: '' })

	useEffect(() => {
		let mounted = true
		async function load() {
			const res = await api.get('/events')
			if (mounted) setEvents(res.data.events)
		}
		load();
		return () => { mounted = false }
	}, [])

	async function createEvent(e) {
		e.preventDefault()
		try {
			await api.post('/events', form)
			toast.success('Event created')
			setForm({ title: '', location: '', startTime: '', endTime: '', expectedSurplusPortions: 0, notes: '' })
			const res = await api.get('/events'); setEvents(res.data.events)
		} catch (err) { toast.error(err.response?.data?.error || 'Failed') }
	}

	return (
		<div>
			<section className="relative overflow-hidden" style={{background:'linear-gradient(135deg, #FFF8E1 0%, #E8F5E8 100%)'}}>
				<div className="max-w-6xl mx-auto px-4 py-8">
					<h2 className="text-3xl md:text-4xl font-extrabold">🎉 Campus Food Events 🍽️</h2>
					<p className="text-gray-600">"Join the food-sharing community!"</p>
				</div>
			</section>
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="flex flex-wrap gap-3 mb-6">
					<button className="px-3 py-1 rounded-full text-sm" style={{background:'linear-gradient(90deg, #FF9800, #FF5722)'}}>
						<span className="text-white">All</span>
					</button>
					<button className="px-3 py-1 rounded-full text-sm" style={{background:'#4CAF50'}}>
						<span className="text-white">🤝 Food Sharing</span>
					</button>
					<button className="px-3 py-1 rounded-full text-sm" style={{background:'#FF9800'}}>
						<span className="text-white">👨‍🍳 Cooking Classes</span>
					</button>
					<button className="px-3 py-1 rounded-full text-sm" style={{background:'#26A69A'}}>
						<span className="text-white">🌍 Sustainability Workshops</span>
					</button>
				</div>
				<div className="grid md:grid-cols-2 gap-8">
					<div>
						{events.length === 0 ? (
							<EmptyState title="No events yet" subtitle="Be the first to post a campus event!" />
						) : (
							<div className="space-y-3">
								{events.map(ev => (
									<div key={ev._id} className="glass p-4">
										<div className="font-medium">{ev.title}</div>
										<div className="text-sm text-gray-400">{ev.location} • {new Date(ev.startTime).toLocaleString()} - {new Date(ev.endTime).toLocaleString()}</div>
									</div>
								))}
							</div>
						)}
					</div>
					<div>
						<h3 className="font-semibold mb-2">Post an event</h3>
						{(!user || (user.role !== 'organizer' && user.role !== 'admin')) ? (
							<div className="text-gray-500 text-sm">Sign in as organizer to post events</div>
						) : (
							<form onSubmit={createEvent} className="grid gap-3 glass p-4">
								<input className="input input-bordered" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
								<input className="input input-bordered" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
								<input type="datetime-local" className="input input-bordered" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
								<input type="datetime-local" className="input input-bordered" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
								<input type="number" className="input input-bordered" placeholder="Expected surplus portions" value={form.expectedSurplusPortions} onChange={e => setForm(f => ({ ...f, expectedSurplusPortions: Number(e.target.value) }))} />
								<textarea className="textarea textarea-bordered" placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
								<button className="btn btn-primary" type="submit">Create event</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}