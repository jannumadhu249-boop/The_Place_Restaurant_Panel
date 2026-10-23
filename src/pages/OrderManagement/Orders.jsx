import React, { useState } from 'react';
import {
  ShoppingCart,
  Check,
  X,
  Clock,
  ChefHat,
  Bike,
  Eye,
  Search,
  Filter,
  DollarSign,
  Printer,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Orders() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orders, setOrders] = useState([
    {
      id: '#ORD-8924',
      customer: 'Sophie Taylor',
      phone: '+1 555-1234',
      address: 'Apt 4B, Hillcrest Manor, Downtown',
      items: [
        { name: 'Butter Chicken Special', qty: 2, price: 16.99 },
        { name: 'Garlic Butter Naan', qty: 4, price: 3.50 },
        { name: 'Mango Lassi Chilled', qty: 2, price: 4.99 },
      ],
      total: '$57.96',
      payment: 'Paid (Credit Card)',
      type: 'Delivery',
      status: 'Preparing',
      time: '6 mins ago',
      notes: 'Extra spicy butter chicken please, and leave at door.'
    },
    {
      id: '#ORD-8923',
      customer: 'Rahul Sharma',
      phone: '+1 555-5678',
      address: '74 Elm Street, City Center',
      items: [
        { name: 'Paneer Tikka Masala', qty: 1, price: 14.50 },
        { name: 'Tandoori Roti', qty: 2, price: 2.50 },
      ],
      total: '$19.50',
      payment: 'Cash on Delivery',
      type: 'Takeaway',
      status: 'Preparing',
      time: '14 mins ago',
      notes: 'Customer will pick up in 10 mins.'
    },
    {
      id: '#ORD-8922',
      customer: 'David Miller',
      phone: '+1 555-9012',
      address: '12 Oxford Road, Suite 300',
      items: [
        { name: 'Chicken Biryani Feast Box', qty: 1, price: 18.50 },
        { name: 'Gulab Jamun (2 pcs)', qty: 1, price: 5.50 },
      ],
      total: '$24.00',
      payment: 'Paid (Apple Pay)',
      type: 'Delivery',
      status: 'Ready',
      time: '22 mins ago',
      notes: 'Please ensure rider has hot-bag.'
    },
    {
      id: '#ORD-8921',
      customer: 'Emma Watson',
      phone: '+1 555-3456',
      address: '88 Sunset Blvd, Building 2',
      items: [
        { name: 'Crispy Veg Spring Rolls', qty: 2, price: 7.99 },
        { name: 'Garlic Naan', qty: 2, price: 3.50 },
      ],
      total: '$22.98',
      payment: 'Paid (Stripe)',
      type: 'Delivery',
      status: 'Pending',
      time: '2 mins ago',
      notes: 'Include extra green chutney.'
    },
    {
      id: '#ORD-8920',
      customer: 'Alex Rivera',
      phone: '+1 555-7788',
      address: 'Table #4 (In-Store Dine-In)',
      items: [
        { name: 'Tandoori Mixed Grill Platter', qty: 1, price: 28.00 },
        { name: 'Fresh Mint Lime Soda', qty: 2, price: 4.00 },
      ],
      total: '$36.00',
      payment: 'Paid (Table QR)',
      type: 'Dine-In',
      status: 'Delivered',
      time: '45 mins ago',
      notes: 'Table 4 requested quick serving.'
    }
  ]);

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const statuses = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered'];

  // Filtering
  const filtered = orders.filter(o => {
    const matchesStatus = filter === 'All' || o.status === filter;
    const matchesType = typeFilter === 'All' || o.type === typeFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.address.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><ShoppingCart size={22} color="var(--primary)" /> Real-Time Order Management</h1>
          <p className="page-desc">Process live incoming food tickets, kitchen cooking queues, and courier pickups</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Top Filter & Search Bar */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by Order ID (#ORD-), Customer Name, Phone, or Street Address..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Channel selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Channel:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Channels</option>
              <option value="Delivery">Delivery (Courier)</option>
              <option value="Takeaway">Self Takeaway</option>
              <option value="Dine-In">Table QR Dine-In</option>
            </select>
          </div>
        </div>

        {/* Status Tabs with count badges */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {statuses.map(s => {
            const count = s === 'All' ? orders.length : orders.filter(x => x.status === s).length;
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: 999 }}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ticket</th>
                <th>Customer & Location</th>
                <th>Ordered Items Summary</th>
                <th>Payment / Total</th>
                <th>Status</th>
                <th>Kitchen Dispatch Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 14, color: 'var(--primary)' }}>{o.id}</strong>
                      <span className="badge badge-muted" style={{ fontSize: 10.5 }}>{o.type}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} /> {o.time}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.customer}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.address}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-light)' }}>{o.phone}</div>
                  </td>

                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {o.items.map((it, i) => (
                        <div key={i}>• {it.qty}x {it.name}</div>
                      ))}
                    </div>
                    {o.notes && (
                      <div style={{ fontSize: 11, color: '#d97706', marginTop: 3 }}>
                        Note: {o.notes}
                      </div>
                    )}
                  </td>

                  <td>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>{o.total}</div>
                    <span className="badge badge-info" style={{ fontSize: 10, marginTop: 3 }}>
                      {o.payment}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${
                      o.status === 'Pending' ? 'badge-warning' :
                      o.status === 'Preparing' ? 'badge-primary' :
                      o.status === 'Ready' ? 'badge-success' : 'badge-muted'
                    }`}>
                      {o.status === 'Pending' ? '⏳ Pending Review' :
                       o.status === 'Preparing' ? '🔥 Cooking in Kitchen' :
                       o.status === 'Ready' ? '✓ Ready for Pickup' : 'Completed'}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        title="View Full Ticket"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <Eye size={13} />
                      </button>

                      {o.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => updateStatus(o.id, 'Preparing')}
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => updateStatus(o.id, 'Cancelled')}
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}

                      {o.status === 'Preparing' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => updateStatus(o.id, 'Ready')}
                        >
                          <ChefHat size={12} /> Mark Packed
                        </button>
                      )}

                      {o.status === 'Ready' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(o.id, 'Delivered')}
                        >
                          <Bike size={12} /> Hand Over
                        </button>
                      )}

                      {o.status === 'Delivered' && (
                        <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                          ✓ Fulfilled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Ticket Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Order Details: {selectedOrder.id}</h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedOrder.time} • Channel: {selectedOrder.type}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedOrder.customer}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>📍 {selectedOrder.address}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>📞 {selectedOrder.phone}</div>
                {selectedOrder.notes && (
                  <div style={{ marginTop: 8, padding: '6px 10px', background: '#fffbeb', color: '#b45309', borderRadius: 6, fontSize: 12 }}>
                    <strong>Kitchen Instruction:</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Itemized Food Bill</h4>
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                {selectedOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderBottom: idx === selectedOrder.items.length - 1 ? 'none' : '1px solid var(--border)',
                      fontSize: 13
                    }}
                  >
                    <span>{it.qty}x {it.name}</span>
                    <strong>${(it.qty * it.price).toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, padding: '8px 4px' }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--primary)' }}>{selectedOrder.total}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                Payment: {selectedOrder.payment}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              {selectedOrder.status === 'Pending' && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateStatus(selectedOrder.id, 'Preparing')}
                >
                  Accept & Start Cooking
                </button>
              )}
              {selectedOrder.status === 'Preparing' && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateStatus(selectedOrder.id, 'Ready')}
                >
                  Mark Packed & Ready
                </button>
              )}
              {selectedOrder.status === 'Ready' && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateStatus(selectedOrder.id, 'Delivered')}
                >
                  Confirm Hand Over to Courier
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
