import { FiMapPin, FiHeart } from 'react-icons/fi'

export default function FoodCard({ item, onReserve }) {
  const discounted = item.discountPercent > 0
  const price = item.price
  const finalPrice = discounted ? Math.max(0, price * (1 - item.discountPercent / 100)) : price
  const freshnessMap = { HOT:'bg-amber-500/20 text-amber-300', FRESH:'bg-emerald-500/20 text-emerald-300', CHILLED:'bg-cyan-500/20 text-cyan-300', LEFTOVER:'bg-fuchsia-500/20 text-fuchsia-300', SAFE:'bg-slate-500/20 text-slate-300' }

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'
  let apiOrigin = ''
  try { const u = new URL(apiBase); apiOrigin = `${u.protocol}//${u.host}` } catch {}
  const imgSrc = item.imageUrl ? `${apiOrigin}${item.imageUrl}` : `https://picsum.photos/seed/${item._id}/600/400`

  const co2Saved = Math.max(0, (item.discountPercent || 0) > 0 ? 0.2 : 0.1) // lightweight hint only for display

  return (
    <div className="glass overflow-hidden hover:translate-y-[-2px] transition food-card">
      <div className="relative h-40">
        <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-base-300/60 to-transparent" />
        {discounted && (
          <div className="absolute left-2 top-2">
            <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-400 to-orange-600">🔥 HOT DEAL</span>
          </div>
        )}
        <button className="absolute top-2 right-2 btn btn-circle btn-ghost btn-sm"><FiHeart/></button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base-content">{item.title}</h3>
          <span className={`badge ${freshnessMap[item.qualityTag] || 'badge-ghost'}`}>{item.qualityTag}</span>
        </div>
        <p className="text-sm text-base-content/60 line-clamp-2 mt-1">{item.description || 'Tasty and safe surplus food available.'}</p>
        <div className="flex items-center gap-2 text-xs mt-2 text-base-content/60"><FiMapPin/>{item.location || 'Campus'}</div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="glass px-2 py-1 text-center">🍽️ {item.quantity}{item.unit ? ` ${item.unit}` : ''}</div>
          <div className="glass px-2 py-1 text-center">🌱 {co2Saved.toFixed(1)} kg CO2</div>
          <div className="glass px-2 py-1 text-center">🥦 {item.isVegetarian ? 'Veg' : 'Mix'}</div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            {discounted ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">₹{finalPrice.toFixed(0)}</span>
                <span className="line-through text-xs text-base-content/50">₹{price.toFixed(0)}</span>
                <span className="badge badge-success">{item.discountPercent}% OFF</span>
              </div>
            ) : <span className="text-lg font-bold">{price > 0 ? `₹${price.toFixed(0)}` : 'Free'}</span>}
          </div>
          <button className="btn btn-primary btn-sm glow" disabled={item.status !== 'AVAILABLE'} onClick={() => onReserve(item)}>Reserve</button>
        </div>
      </div>
    </div>
  )
}