import React, { useState } from 'react';
import {
  ShoppingBag,
  DollarSign,
  Utensils,
  Star,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ChefHat,
  Bike,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  IndianRupee
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [kitchenOrders, setKitchenOrders] = useState([
    { id: '#ORD-8924', customer: 'Sophie Taylor', items: '2x Butter Chicken, 4x Garlic Naan, 2x Mango Lassi', total: '₹ 48.50', time: '4 mins ago', status: 'Preparing', type: 'Delivery' },
    { id: '#ORD-8923', customer: 'Rahul Sharma', items: '1x Paneer Tikka Masala, 2x Tandoori Roti', total: '₹ 21.20', time: '11 mins ago', status: 'Preparing', type: 'Takeaway' },
    { id: '#ORD-8922', customer: 'David Miller', items: '1x Chicken Biryani Feast Box, 1x Gulab Jamun', total: '₹ 32.00', time: '18 mins ago', status: 'Ready', type: 'Delivery' },
    { id: '#ORD-8921', customer: 'Emma Watson', items: '3x Veg Hakka Noodles, 1x Spring Rolls', total: '₹ 36.80', time: '26 mins ago', status: 'Ready', type: 'Delivery' },
  ]);

  const topDishes = [
    { rank: 1, name: 'Butter Chicken Special', category: 'Main Course', orders: 248, revenue: '₹ 4,213.50', rate: '96%', rating: 4.9 },
    { rank: 2, name: 'Paneer Butter Masala', category: 'Main Course', orders: 194, revenue: '₹ 2,813.00', rate: '94%', rating: 4.7 },
    { rank: 3, name: 'Garlic Butter Naan', category: 'Breads', orders: 420, revenue: '₹ 1,470.00', rate: '99%', rating: 4.8 },
    { rank: 4, name: 'Crispy Veg Spring Rolls', category: 'Starters', orders: 152, revenue: '₹ 1,214.48', rate: '91%', rating: 4.5 },
    { rank: 5, name: 'Mango Lassi Chilled', category: 'Beverages', orders: 180, revenue: '₹ 898.20', rate: '95%', rating: 4.6 },
  ];

  const topRatedFood = [...topDishes].sort((a, b) => b.rating - a.rating)[0];

  const updateOrderStatus = (id, newStatus) => {
    setKitchenOrders(kitchenOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-primary" style={{ padding: '4px 10px' }}>
              <Sparkles size={13} /> Live Store Dashboard
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-Time Kitchen Feed</span>
          </div>
          <h1 className="page-title">Welcome back, The Place!</h1>
          <p className="page-desc">Here is what's happening in your restaurant kitchen and delivery line today</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/food-management/create-food" className="btn btn-outline">
            <Plus size={15} /> Add Menu Dish
          </Link>
          <Link to="/orders" className="btn btn-primary">
            <ShoppingBag size={15} /> Order Dispatch Queue
          </Link>
        </div>
      </div>

      {/* Modern High-Impact Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">₹ 1,842.50</div>
            <div style={{ fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, fontWeight: 600 }}>
              <TrendingUp size={13} /> +18.4% vs yesterday
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="stat-label">Orders Processed</div>
            <div className="stat-value">48 Orders</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
              4 active in kitchen now
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Star size={24} fill="#f59e0b" />
          </div>
          <div>
            <div className="stat-label">Customer Satisfaction</div>
            <div className="stat-value">4.9 ★ / 5.0</div>
            <div style={{ fontSize: 11.5, color: '#d97706', marginTop: 4, fontWeight: 600 }}>
              Based on 215 verified reviews
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
            <Utensils size={24} />
          </div>
          <div>
            <div className="stat-label">Active Menu Items</div>
            <div className="stat-value">64 Dishes</div>
            <div style={{ fontSize: 11.5, color: 'var(--success)', marginTop: 4, fontWeight: 600 }}>
              ● 100% kitchen availability
            </div>
          </div>
        </div>

        {/* <div className="stat-card" style={{ borderLeft: '4px solid #e11d48' }}>
          <div className="stat-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
            <Star size={24} fill="#e11d48" />
          </div>
          <div>
            <div className="stat-label">Top Rated Food</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{topRatedFood.name}</div>
            <div style={{ fontSize: 11.5, color: '#be123c', marginTop: 4, fontWeight: 600 }}>
              ★ {topRatedFood.rating.toFixed(1)} · {topRatedFood.orders} orders
            </div>
          </div>
        </div> */}
      </div>

      {/* Two-Column Layout for Kitchen Queue & Channel Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Live Kitchen Dispatch Feed */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ChefHat size={19} color="var(--primary)" /> Live Kitchen Dispatch
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Orders awaiting cooking or courier pickup</p>
            </div>
            <Link to="/orders" className="btn btn-outline btn-sm">Full Screen</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {kitchenOrders.map((o) => (
              <div
                key={o.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 14,
                  background: o.status === 'Preparing' ? '#fffbf5' : '#fafafa',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>{o.id}</strong>
                    <span className="badge badge-muted" style={{ fontSize: 11 }}>{o.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`badge ${o.status === 'Preparing' ? 'badge-warning' : 'badge-success'}`}>
                      {o.status === 'Preparing' ? '🔥 Cooking' : '✓ Packed & Ready'}
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{o.time}</span>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 10, fontWeight: 500 }}>
                  {o.items}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Customer: <strong style={{ color: 'var(--text-main)' }}>{o.customer}</strong> • Total: <strong style={{ color: 'var(--primary)' }}>{o.total}</strong>
                  </div>

                  <div>
                    {o.status === 'Preparing' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateOrderStatus(o.id, 'Ready')}
                      >
                        <CheckCircle2 size={13} /> Mark Packed
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateOrderStatus(o.id, 'Delivered')}
                      >
                        <Bike size={13} /> Handed to Courier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Food Card */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={19} color="#e11d48" fill="#e11d48" /> Top Rated Food
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Highest customer-rated dish this week</p>
            </div>
            <Link to="/food-management/foods" className='btn btn-outline btn-sm' style={{ padding: '4px 10px' }}>View All</Link>
          </div>

          <div
            style={{
              flex: 1,
              borderRadius: 14,
              border: '1px solid var(--border)',
              background: 'linear-gradient(160deg, #fff7ed 0%, #ffffff 45%, #fff1f2 100%)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {topRatedFood.category}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: -0.4, color: 'var(--text-main)' }}>
                  {topRatedFood.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                  Loved by guests with {topRatedFood.rate} positive feedback
                </p>
              </div>
              <div
                style={{
                  minWidth: 64,
                  height: 64,
                  borderRadius: 16,
                  background: '#fff',
                  border: '1px solid var(--border)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#e11d48', lineHeight: 1 }}>{topRatedFood.rating.toFixed(1)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>/ 5.0</div>
                </div>
              </div>
            </div>

            {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 650 }}>Orders</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{topRatedFood.orders}</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 650 }}>Revenue</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2, color: 'var(--primary)' }}>{topRatedFood.revenue}</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Top Performing Dishes Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Top Selling Specialties This Week</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer favorites ordered most frequently</p>
          </div>
          <Link to="/food-management/foods" className="btn btn-outline btn-sm">Manage Full Menu</Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Dish Title</th>
                <th>Category</th>
                <th>Orders Count</th>
                <th>Total Volume</th>
                <th>Customer Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {topDishes.map((d) => (
                <tr key={d.rank}>
                  <td>
                    <span style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: d.rank === 1 ? 'linear-gradient(135deg, #f97316, #e11d48)' : '#f1f5f9',
                      color: d.rank === 1 ? '#fff' : 'var(--text-main)',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      fontSize: 12
                    }}>
                      {d.rank}
                    </span>
                  </td>
                  <td><strong>{d.name}</strong></td>
                  <td><span className="badge badge-muted">{d.category}</span></td>
                  <td><strong>{d.orders} orders</strong></td>
                  <td><strong style={{ color: 'var(--primary)' }}>{d.revenue}</strong></td>
                  <td>
                    <span className="badge badge-success">★ {d.rate} positive</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
