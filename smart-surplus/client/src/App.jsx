import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { FiSearch, FiBell, FiUser, FiPlusCircle } from 'react-icons/fi'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import ListItem from './pages/ListItem.jsx'
import MyOrders from './pages/MyOrders.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import Events from './pages/Events.jsx'
import Analytics from './pages/Analytics.jsx'
import { useAuth } from './state/auth.jsx'

function Navbar() {
  const { user } = useAuth()
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return (
    <div className="sticky top-0 z-40 bg-base-100/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="navbar p-0 min-h-16">
          <div className="flex-1 gap-3 items-center">
            <Link to="/" className="font-extrabold text-2xl tracking-tight text-primary">SmartSurplus</Link>
            <div className="hidden md:flex items-center flex-1">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input input-bordered w-full pl-10" placeholder="Search dishes, canteens, events" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/events" className="btn btn-ghost">Events</Link>
            <Link to="/analytics" className="btn btn-ghost">Impact</Link>
            {user?.role && (user.role === 'canteen' || user.role === 'organizer' || user.role === 'admin') && (
              <Link to="/list" className="btn btn-primary btn-sm gap-2"><FiPlusCircle /> List surplus</Link>
            )}
            <button className="btn btn-ghost btn-circle"><FiBell size={20} /></button>
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
