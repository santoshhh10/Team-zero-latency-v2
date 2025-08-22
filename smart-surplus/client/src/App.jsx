import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FiSearch, FiBell, FiUser, FiPlusCircle } from 'react-icons/fi'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import ListItem from './pages/ListItem.jsx'
import MyOrders from './pages/MyOrders.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import Events from './pages/Events.jsx'
import Analytics from './pages/Analytics.jsx'
import { useAuth } from './state/auth.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { useSocket } from './state/socket.jsx'
import { getLevelAndProgress } from './utils/points.js'

function Navbar() {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [notif, setNotif] = useState([])
  const { notifications } = useSocket()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  const [points, setPoints] = useState(user?.greenPoints || 0)
  useEffect(() => {
    const end = user?.greenPoints || 0
    const start = points
    if (start === end) return
    const duration = 800
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const val = Math.round(start + (end - start) * p)
      setPoints(val)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [user?.greenPoints])
  return (
    <div className="sticky top-0 z-50 border-b border-base-200/60 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/75">
      <div className="max-w-6xl mx-auto px-4">
        <div className="navbar p-0 min-h-16">
          <div className="flex-1 gap-3 items-center">
            <Link to="/" className="font-extrabold text-2xl tracking-tight text-primary">🍎 SmartSurplus</Link>
            <div className="hidden md:flex items-center flex-1">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input input-bordered w-full pl-10 glow" placeholder="Search dishes, canteens, events" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/events" className="btn btn-ghost">🎉 Events</Link>
            <Link to="/analytics" className="btn btn-ghost">🌱 Impact</Link>
            {user?.role && (user.role === 'canteen' || user.role === 'organizer' || user.role === 'admin') && (
              <Link to="/list" className="btn btn-primary btn-sm gap-2 glow"><FiPlusCircle /> List surplus</Link>
            )}
            <div className="hidden sm:flex items-center gap-3 rounded-full px-3 py-2 bg-base-100 border">
              <div className="flex items-center gap-2">
                <span>🌿</span>
                <span className="text-sm font-semibold">{points} pts</span>
              </div>
              <PointsMiniBar points={points} />
            </div>
            <ThemeToggle />
            <div className="dropdown dropdown-end">
              <button className="btn btn-ghost btn-circle" onClick={() => setOpen(o => !o)}><FiBell size={20} /></button>
              {open && (
                <ul className="dropdown-content z-50 menu p-2 shadow glass rounded-box w-72 right-0 max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <li className="text-sm text-gray-400 px-2 py-2">No notifications yet</li>
                  ) : notifications.map((n, idx) => (
                    <li key={idx} className="px-2 py-2">
                      <div className="text-sm">
                        {n.type === 'new-listing' && (<span>New listing: <b>{n.data.title}</b> • {n.data.location || 'Campus'}</span>)}
                        {n.type === 'expiry-alert' && (<span>Near expiry: <b>{n.data.title}</b> • {n.data.location || 'Campus'}</span>)}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(n.at).toLocaleTimeString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {user ? (
              <Link to="/me" className="btn btn-outline btn-sm gap-2"><FiUser /> {user.name.split(' ')[0]}</Link>
            ) : (
              <Link to="/auth" className="btn btn-outline btn-sm">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PointsMiniBar({ points }) {
  const { level, progressPercent } = getLevelAndProgress(points)
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs">Lv {level}</div>
      <div className="h-2 w-20 rounded bg-base-200 overflow-hidden">
        <div className="h-2 bg-primary" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/list" element={<ListItem />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
          Built for zero-waste campuses • SmartSurplus
        </div>
      </footer>
    </div>
  )
}

export default function App() { return <AppLayout /> }
