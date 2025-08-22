import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './auth.jsx'

const SocketContext = createContext(null)

function getSocketOrigin() {
	const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'
	try { const u = new URL(base); return `${u.protocol}//${u.host}` } catch { return 'http://localhost:5000' }
}

export function SocketProvider({ children }) {
	const { token } = useAuth()
	const [socket, setSocket] = useState(null)
	const [notifications, setNotifications] = useState([])

	useEffect(() => {
		const origin = getSocketOrigin()
		const s = io(origin, { transports: ['websocket'], auth: token ? { token } : undefined })
		setSocket(s)
		s.on('connect', () => {})
		s.on('new-listing', ({ item }) => {
			setNotifications(n => [{ type: 'new-listing', at: Date.now(), data: { title: item.title, location: item.location } }, ...n].slice(0, 50))
			toast.custom(t => (
				<div className="alert shadow bg-base-100 border">
					<span>New listing: <b>{item.title}</b> • {item.location || 'Campus'}</span>
				</div>
			))
		})
		s.on('expiry-alert', (p) => {
			setNotifications(n => [{ type: 'expiry-alert', at: Date.now(), data: { title: p.title, location: p.location } }, ...n].slice(0, 50))
			toast((t) => `Near expiry at ${p.location || 'Campus'}: ${p.title}`, { icon: '⏰' })
		})
		return () => { s.disconnect() }
	}, [token])

	const value = useMemo(() => ({ socket, notifications, setNotifications }), [socket, notifications])
	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() { return useContext(SocketContext) }