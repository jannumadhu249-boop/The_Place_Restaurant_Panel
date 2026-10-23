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
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [kitchenOrders, setKitchenOrders] = useState([
    { id: '#ORD-8924', customer: 'Sophie Taylor', items: '2x Butter Chicken, 4x Garlic Naan, 2x Mango Lassi', total: '$48.50', time: '4 mins ago', status: 'Preparing', type: 'Delivery' },
    { id: '#ORD-8923', customer: 'Rahul Sharma', items: '1x Paneer Tikka Masala, 2x Tandoori Roti', total: '$21.20', time: '11 mins ago', status: 'Preparing', type: 'Takeaway' },
    { id: '#ORD-8922', customer: 'David Miller', items: '1x Chicken Biryani Feast Box, 1x Gulab Jamun', total: '$32.00', time: '18 mins ago', status: 'Ready', type: 'Delivery' },
    { id: '#ORD-8921', customer: 'Emma Watson', items: '3x Veg Hakka Noodles, 1x Spring Rolls', total: '$36.80', time: '26 mins ago', status: 'Ready', type: 'Delivery' },
  ]);

  const topDishes = [
    { rank: 1, name: 'Butter Chicken Special', category: 'Main Course', orders: 248, revenue: '$4,213.50', rate: '96%' },
    { rank: 2, name: 'Paneer Butter Masala', category: 'Main Course', orders: 194, revenue: '$2,813.00', rate: '94%' },
    { rank: 3, name: 'Garlic Butter Naan', category: 'Breads', orders: 420, revenue: '$1,470.00', rate: '99%' },
    { rank: 4, name: 'Crispy Veg Spring Rolls', category: 'Starters', orders: 152, revenue: '$1,214.48', rate: '91%' },
    { rank: 5, name: 'Mango Lassi Chilled', category: 'Beverages', orders: 180, revenue: '$898.20', rate: '95%' },
  ];

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
          <h1 className="page-title">Welcome back, Spice Garden Bistro!</h1>
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
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">$1,842.50</div>
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

        {/* Channel Analytics & Quick Metrics */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div>
                <h2 className="card-title">Order Channel Split</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Revenue distribution across channels</p>
              </div>
              <span className="badge badge-primary">Today</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span>🛵 Online App Delivery</span>
                  <strong>68% ($1,252.90)</strong>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '68%', height: '100%', background: 'var(--primary)', borderRadius: 999 }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span>🥡 Customer Self Takeaway</span>
                  <strong>22% ($405.35)</strong>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '22%', height: '100%', background: '#10b981', borderRadius: 999 }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span>🍽️ In-Store Table QR</span>
                  <strong>10% ($184.25)</strong>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '10%', height: '100%', background: '#6366f1', borderRadius: 999 }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)', marginTop: 24 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>⚡ Manager Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              <Link to="/coupons" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>
                New Coupon
              </Link>
              <Link to="/happy-hours" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>
                Happy Hours
              </Link>
              <Link to="/my-wallet" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>
                Wallet Payout
              </Link>
              <Link to="/restaurant" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>
                Store Timing
              </Link>
            </div>
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
                      #{d.rank}
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
