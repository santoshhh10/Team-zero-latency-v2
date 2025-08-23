import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../state/auth.jsx'

export default function Auth() {
	const { api, setToken, setUser } = useAuth()
	const [mode, setMode] = useState('login')
	const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
	const [verifyMode, setVerifyMode] = useState(false)
	const [pendingEmail, setPendingEmail] = useState('')
	const [otp, setOtp] = useState('')

	async function submit(e) {
		e.preventDefault()
		try {
			if (mode === 'login') {
				const res = await api.post('/auth/login', { email: form.email, password: form.password })
				setToken(res.data.token); setUser(res.data.user)
				toast.success('Welcome back!')
			} else {
				const res = await api.post('/auth/register', form)
				if (res.data?.pendingVerification) {
					setVerifyMode(true)
					setPendingEmail(form.email)
					toast.success('We sent a verification code to your email')
				} else {
					toast.success('Registered')
				}
			}
		} catch (err) {
			toast.error(err.response?.data?.error || 'Failed')
		}
	}

	return (
		<div className="max-w-md mx-auto px-4 py-10">
			<div className="card bg-base-100 shadow">
				<div className="card-body">
					<h2 className="card-title">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
					<form onSubmit={submit} className="flex flex-col gap-3">
						{mode === 'register' && (
							<input className="input input-bordered" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
						)}
						<input className="input input-bordered" type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
						<input className="input input-bordered" type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
						{mode === 'register' && (
							<select className="select select-bordered" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
								<option value="student">Student</option>
								<option value="canteen">Canteen</option>
								<option value="organizer">Organizer</option>
								<option value="ngo">NGO</option>
							</select>
						)}
						<button className="btn btn-primary" type="submit">{mode === 'login' ? 'Sign in' : 'Register'}</button>
					</form>
					<div className="text-sm text-center text-gray-500">
						{mode === 'login' ? (
							<button className="link" onClick={() => setMode('register')}>New here? Create an account</button>
						) : (
							<button className="link" onClick={() => setMode('login')}>Already have an account? Sign in</button>
						)}
					</div>
					{verifyMode && (
						<div className="mt-4 p-3 border rounded">
							<div className="font-semibold">Verify your email</div>
							<input className="input input-bordered w-full mt-2" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} />
							<button className="btn btn-primary w-full mt-2" onClick={async () => {
								try {
									const res = await api.post('/auth/verify-email', { email: pendingEmail, code: otp })
									setToken(res.data.token); setUser(res.data.user)
									toast.success('Email verified!')
									setVerifyMode(false); setOtp(''); setPendingEmail('')
								} catch (err) {
									toast.error(err.response?.data?.error || 'Verification failed')
								}
							}}>Verify</button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}