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
		<div className="max-w-6xl mx-auto px-4 py-8">
			<h2 className="text-2xl font-bold mb-4">Campus Events</h2>
			<div className="flex flex-wrap gap-2 mb-4">
				{['All','Food Sharing','Cooking Classes','Sustainability Workshops'].map(t => (
					<button key={t} className="btn btn-sm btn-ghost">{t}</button>
				))}
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
	)
}