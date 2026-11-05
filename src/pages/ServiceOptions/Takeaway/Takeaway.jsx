import React, { useMemo, useState } from 'react';
import {
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Package,
  Plus,
  Search,
  Settings2,
  RefreshCw,
  Phone,
  User,
  Printer,
  Banknote,
  Smartphone,
  CreditCard,
  Minus,
  Utensils,
  Tag,
  Check,
} from 'lucide-react';
import '../ServiceOps.css';
import TakeawayConfigModal from './TakeawayConfigModal';
import TakeawayBillModal from './TakeawayBillModal';
import NewTakeawayOrderModal from './NewTakeawayOrderModal';

const INITIAL_QUEUE = [
  { id: 'TKW-2208', guest: 'Aisha Khan', phone: '+91 98765 41200', items: 3, status: 'Ready', eta: 'Now', total: 480, placed: '12:42 PM', slot: '12:55', payment: 'UPI' },
  { id: 'TKW-2207', guest: 'Rohan Mehta', phone: '+91 97123 88120', items: 5, status: 'Preparing', eta: '8 min', total: 920, placed: '12:35 PM', slot: '12:50', payment: 'Cash' },
  { id: 'TKW-2206', guest: 'Neha Gupta', phone: '+91 96456 22010', items: 2, status: 'Preparing', eta: '12 min', total: 310, placed: '12:28 PM', slot: '12:45', payment: 'Card' },
  { id: 'TKW-2205', guest: 'Omar Ali', phone: '+91 95987 77330', items: 4, status: 'Queued', eta: '18 min', total: 650, placed: '12:20 PM', slot: '13:00', payment: 'Unpaid' },
];

const INITIAL_HISTORY = [
  { id: 'TKW-2204', guest: 'Priya P.', items: 2, status: 'Picked up', total: 240, time: '12:10 PM', payment: 'UPI' },
  { id: 'TKW-2203', guest: 'David M.', items: 6, status: 'Picked up', total: 1180, time: '11:55 AM', payment: 'Card' },
  { id: 'TKW-2202', guest: 'Chris E.', items: 1, status: 'Cancelled', total: 180, time: '11:40 AM', payment: 'Cash' },
  { id: 'TKW-2201', guest: 'Emma W.', items: 3, status: 'Picked up', total: 420, time: '11:22 AM', payment: 'UPI' },
];

const MENU_ITEMS = [
  { id: 'm1', name: 'Butter Chicken', category: 'Main Course', price: 420 },
  { id: 'm2', name: 'Paneer Tikka', category: 'Starters', price: 280 },
  { id: 'm3', name: 'Garlic Naan', category: 'Breads', price: 80 },
  { id: 'm4', name: 'Dal Makhani', category: 'Main Course', price: 220 },
  { id: 'm5', name: 'Chicken Biryani', category: 'Rice', price: 360 },
  { id: 'm6', name: 'Mango Lassi', category: 'Drinks', price: 120 },
  { id: 'm7', name: 'Masala Chai', category: 'Drinks', price: 60 },
  { id: 'm8', name: 'Veg Fried Rice', category: 'Rice', price: 180 },
  { id: 'm9', name: 'Tandoori Chicken', category: 'Starters', price: 380 },
  { id: 'm10', name: 'Gulab Jamun', category: 'Desserts', price: 100 },
  { id: 'm11', name: 'Kulfi', category: 'Desserts', price: 120 },
  { id: 'm12', name: 'Roti', category: 'Breads', price: 40 },
];

const MENU_CATEGORIES = ['All', ...new Set(MENU_ITEMS.map((m) => m.category))];
const AVAILABLE_COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, label: '10% OFF' },
  { code: 'FLAT50', type: 'flat', value: 50, label: '₹50 OFF' },
  { code: 'TAKEAWAY20', type: 'percent', value: 20, label: '20% OFF' },
];

export default function Takeaway() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [enabled, setEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Counter form state (inline quick order)
  const [cart, setCart] = useState({});
  const [menuCategory, setMenuCategory] = useState('All');
  const [orderGuest, setOrderGuest] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderPayMethod, setOrderPayMethod] = useState('Cash');
  const [orderCashReceived, setOrderCashReceived] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [manualDiscount, setManualDiscount] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    prepMins: 20,
    packingFee: 15,
    maxOrdersPerSlot: 8,
    slotInterval: 15,
    notifySms: true,
    notifyPush: true,
    autoReady: false,
    requirePrepaid: false,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredQueue = useMemo(() => {
    return queue.filter((o) => {
      const statusOk = statusFilter === 'All' || o.status === statusFilter;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.guest.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [queue, statusFilter, search]);

  const filteredMenu = useMemo(() => {
    return MENU_ITEMS.filter((m) => {
      return menuCategory === 'All' || m.category === menuCategory;
    });
  }, [menuCategory]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = MENU_ITEMS.find((m) => m.id === id);
        return { ...item, qty, subtotal: item.price * qty };
      });
  }, [cart]);

  const cartSubtotal = useMemo(
    () => cartItems.reduce((s, i) => s + i.subtotal, 0),
    [cartItems]
  );

  const discountAmount = useMemo(() => {
    let disc = Number(manualDiscount) || 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        disc += Math.round((cartSubtotal * appliedCoupon.value) / 100);
      } else {
        disc += appliedCoupon.value;
      }
    }
    return Math.min(disc, cartSubtotal);
  }, [appliedCoupon, manualDiscount, cartSubtotal]);

  const cartTotal = useMemo(() => {
    if (cartItems.length === 0) return 0;
    const base = Math.max(0, cartSubtotal - discountAmount);
    return base + (settings.packingFee || 0);
  }, [cartSubtotal, discountAmount, cartItems.length, settings.packingFee]);

  const stats = useMemo(() => {
    const ready = queue.filter((o) => o.status === 'Ready').length;
    const preparing = queue.filter((o) => o.status === 'Preparing').length;
    const queued = queue.filter((o) => o.status === 'Queued').length;
    const completed = history.filter((o) => o.status === 'Picked up').length;
    const revenue = [...queue, ...history.filter((h) => h.status === 'Picked up')].reduce(
      (s, o) => s + (o.total || 0),
      0
    );
    return { ready, preparing, queued, completed, revenue, open: queue.length };
  }, [queue, history]);

  const money = (n) =>
    `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const avatarColor = (status) => {
    if (status === 'Ready') return { bg: '#ecfdf5', color: '#059669' };
    if (status === 'Preparing') return { bg: '#fff7ed', color: '#ea580c' };
    return { bg: '#eff6ff', color: '#2563eb' };
  };

  const statusBadge = (s) => {
    if (s === 'Ready' || s === 'Picked up') return 'badge-success';
    if (s === 'Cancelled') return 'badge-danger';
    if (s === 'Preparing') return 'badge-warning';
    return 'badge-info';
  };

  const updateSetting = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    const found = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (!found) {
      alert(`Invalid coupon "${code}".`);
      return;
    }
    setAppliedCoupon(found);
    setCouponInput(code);
    showToast(`✓ Coupon ${code} applied successfully!`);
  };

  // Create Takeaway Order from Inline Right Card
  const handleCreateOrder = (e) => {
    if (e) e.preventDefault();
    if (!orderGuest.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (cartItems.length === 0) {
      alert('Please select at least 1 food item for the takeaway order.');
      return;
    }

    const newId = `TKW-${2200 + queue.length + history.length + 1}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
      id: newId,
      guest: orderGuest.trim(),
      phone: orderPhone.trim() || '+91 98xxx 00000',
      items: cartItems.reduce((s, i) => s + i.qty, 0),
      itemsList: cartItems,
      status: 'Queued',
      eta: `${settings.prepMins} min`,
      subtotal: cartSubtotal,
      discount: discountAmount,
      coupon: appliedCoupon ? appliedCoupon.code : null,
      total: cartTotal,
      placed: nowTime,
      slot: '13:15',
      payment: orderPayMethod,
    };

    setQueue((prev) => [newOrder, ...prev]);

    // Reset Form
    setOrderGuest('');
    setOrderPhone('');
    setCart({});
    setOrderCashReceived('');
    setAppliedCoupon(null);
    setCouponInput('');
    setManualDiscount('');

    showToast(`✓ Takeaway order ${newId} created for ${newOrder.guest} (${money(cartTotal)})! Paid via ${orderPayMethod}.`);
  };

  // Create Takeaway Order from Modal
  const handleModalCreateOrder = (orderData) => {
    const newId = `TKW-${2200 + queue.length + history.length + 1}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
      id: newId,
      guest: orderData.guest,
      phone: orderData.phone,
      items: orderData.cartItems.reduce((s, i) => s + i.qty, 0),
      itemsList: orderData.cartItems,
      status: 'Queued',
      eta: `${settings.prepMins} min`,
      subtotal: orderData.subtotal,
      discount: orderData.discountAmount,
      coupon: orderData.coupon,
      total: orderData.total,
      placed: nowTime,
      slot: orderData.slot,
      payment: orderData.payMethod,
      notes: orderData.notes,
    };

    setQueue((prev) => [newOrder, ...prev]);
    setIsNewOrderModalOpen(false);
    showToast(`✓ Takeaway order ${newId} placed for ${newOrder.guest} (${money(orderData.total)})!`);
  };

  // Open Bill / Receipt Modal for an order in Queue
  const openBillModal = (order) => {
    setSelectedOrderForBill(order);
    setIsBillModalOpen(true);
  };

  // Mark ready
  const handleMarkReady = (orderId) => {
    setQueue((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Ready', eta: 'Now' } : o))
    );
    showToast(`✓ Order ${orderId} marked Ready for Pickup! Customer notified.`);
  };

  // Handover order
  const handleHandover = (order) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setQueue((prev) => prev.filter((o) => o.id !== order.id));
    setHistory((prev) => [
      {
        id: order.id,
        guest: order.guest,
        items: order.items,
        status: 'Picked up',
        total: order.total,
        time: nowTime,
        payment: order.payment || 'Paid',
      },
      ...prev,
    ]);
    showToast(`✓ Order ${order.id} handed over successfully!`);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header with Top Buttons */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingBag size={22} color="var(--primary)" /> Takeaway
          </h1>
          <p className="page-desc">
            Pickup queue, prep slots, packing charges, and customer orders
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
          {/* <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsConfigModalOpen(true)}
            title="Takeaway Configuration & Rules"
          >
            <Settings2 size={15} /> Takeaway Configuration
          </button> */}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!enabled}
            onClick={() => setIsNewOrderModalOpen(true)}
          >
            <Plus size={16} /> New Takeaway Order
          </button>
        </div>
      </div>

      {/* Enable / Toggle Banner */}
      <div className="svc-toggle-row">
        <div className="svc-toggle-meta">
          <div className="svc-toggle-title">Takeaway / pickup service</div>
          <div className="svc-toggle-desc">
            When off, customers cannot place new pickup orders. Existing queue can still be fulfilled.
          </div>
        </div>
        <button
          type="button"
          className={`svc-switch ${enabled ? 'on' : ''}`}
          aria-pressed={enabled}
          onClick={() => setEnabled((v) => !v)}
          title={enabled ? 'Takeaway Enabled' : 'Takeaway Disabled'}
        >
          <span className="svc-switch-knob" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Package size={20} />
          </div>
          <div>
            <div className="stat-label">Open Pickup</div>
            <div className="stat-value">{stats.open}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <Clock3 size={20} />
          </div>
          <div>
            <div className="stat-label">Preparing</div>
            <div className="stat-value">{stats.preparing}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-label">Ready for Pickup</div>
            <div className="stat-value">{stats.ready}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <div className="stat-label">Today Revenue</div>
            <div className="stat-value">{money(stats.revenue)}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Queue & Food Selection + Quick Order */}
      <div className="svc-section-grid">
        {/* Live Pickup Queue */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pickup Queue</h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>
                Queued {stats.queued} · Preparing {stats.preparing} · Ready {stats.ready}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: 12, padding: '5px 10px' }}
              onClick={() => setIsNewOrderModalOpen(true)}
            >
              <Plus size={13} /> New Order
            </button>
          </div>

          {/* Search & Filter */}
          <div className="form-grid" style={{ marginBottom: 18, gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Search</label>
              <div className="svc-input-with-icon">
                <Search size={16} className="svc-input-icon" />
                <input
                  className="form-control"
                  placeholder="Order ID, guest name, phone…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Queued">Queued</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
              </select>
            </div>
          </div>

          <div className="svc-queue-list">
            {filteredQueue.map((o) => {
              const colors = avatarColor(o.status);
              return (
                <div key={o.id} className="svc-queue-item">
                  <div className="svc-queue-left">
                    <div className="svc-queue-avatar" style={{ background: colors.bg, color: colors.color }}>
                      {o.guest.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 750, fontSize: 14, color: '#0f172a' }}>
                        {o.guest} · <span style={{ color: 'var(--primary)' }}>{o.id}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>
                        {o.items} items · Slot {o.slot} · ETA {o.eta} · <strong>{money(o.total)}</strong> ({o.payment})
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Phone size={12} /> {o.phone}
                      </div>
                    </div>
                  </div>

                  <div className="svc-queue-actions">
                    <span className={`badge ${statusBadge(o.status)}`}>{o.status}</span>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '6px 10px' }}
                      onClick={() => openBillModal(o)}
                      title="View & Print Bill"
                    >
                      <Printer size={13} /> Bill
                    </button>
                    {o.status !== 'Ready' && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() => handleMarkReady(o.id)}
                      >
                        <Check size={14} /> Ready
                      </button>
                    )}
                    {o.status === 'Ready' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: '6px 14px' }}
                        onClick={() => handleHandover(o)}
                      >
                        <Package size={14} /> Hand Over
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredQueue.length === 0 && (
              <div style={{ padding: 28, textAlign: 'center', color: '#64748b', fontSize: 13, background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                No takeaway orders matching your criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Counter Takeaway Order with Food Selection & Payment */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Counter Takeaway & Menu</h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>Select food items and settle payment</p>
            </div>
          </div>

          <form onSubmit={handleCreateOrder}>
            {/* Customer Details */}
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <div className="svc-input-with-icon">
                  <User size={15} className="svc-input-icon" />
                  <input
                    className="form-control"
                    placeholder="Guest name"
                    value={orderGuest}
                    onChange={(e) => setOrderGuest(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="svc-input-with-icon">
                  <Phone size={15} className="svc-input-icon" />
                  <input
                    className="form-control"
                    placeholder="+91 …"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Food Selection Header & Category Pills */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 750, color: '#1e293b' }}>
                  <Utensils size={14} style={{ verticalAlign: 'middle', marginRight: 5, color: 'var(--primary)' }} />
                  Select Food Items
                </span>
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                  {cartItems.length} items selected
                </span>
              </div>

              <div className="svc-menu-cats" style={{ marginBottom: 10 }}>
                {MENU_CATEGORIES.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`svc-menu-cat-btn ${menuCategory === c ? 'active' : ''}`}
                    onClick={() => setMenuCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Menu items list */}
              <div className="svc-menu-grid" style={{ maxHeight: 220, marginBottom: 12 }}>
                {filteredMenu.slice(0, 6).map((item) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div key={item.id} className="svc-menu-item" style={{ padding: 10 }}>
                      <div className="svc-menu-item-top">
                        <div>
                          <div className="svc-menu-item-name" style={{ fontSize: 12.5 }}>{item.name}</div>
                          <div className="svc-menu-item-cat">{item.category}</div>
                        </div>
                        <div className="svc-menu-item-price">{money(item.price)}</div>
                      </div>
                      <div className="svc-menu-item-qty">
                        {qty === 0 ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ fontSize: 11, padding: '4px 10px', width: '100%', justifyContent: 'center' }}
                            onClick={() => changeQty(item.id, 1)}
                          >
                            <Plus size={12} /> Add
                          </button>
                        ) : (
                          <div className="svc-qty-ctrl">
                            <button type="button" className="svc-qty-btn" onClick={() => changeQty(item.id, -1)}>
                              <Minus size={11} />
                            </button>
                            <span className="svc-qty-val" style={{ fontSize: 12 }}>{qty}</span>
                            <button type="button" className="svc-qty-btn add" onClick={() => changeQty(item.id, 1)}>
                              <Plus size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon & Discount Section */}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 750, color: '#334155', marginBottom: 8 }}>
                  <Tag size={14} color="var(--primary)" /> Apply Coupon / Discount
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Coupon code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase', fontSize: 12 }}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '0 12px', color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponInput('');
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: 12, padding: '0 14px' }}
                      onClick={() => handleApplyCoupon()}
                    >
                      Apply
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {AVAILABLE_COUPONS.map((cpn) => (
                    <button
                      key={cpn.code}
                      type="button"
                      onClick={() => handleApplyCoupon(cpn.code)}
                      style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: appliedCoupon?.code === cpn.code ? '1.5px solid var(--primary)' : '1px dashed #cbd5e1',
                        background: appliedCoupon?.code === cpn.code ? '#fff7ed' : '#ffffff',
                        color: appliedCoupon?.code === cpn.code ? 'var(--primary)' : '#475569',
                        fontWeight: 650,
                        cursor: 'pointer',
                      }}
                    >
                      {cpn.code} ({cpn.label})
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>
                    Custom Manual Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(e.target.value)}
                    style={{ fontSize: 12, height: 34 }}
                  />
                </div>
              </div>

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Food Subtotal:</span>
                    <strong>{money(cartSubtotal)}</strong>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#059669', fontWeight: 650 }}>
                      <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}:</span>
                      <strong>- {money(discountAmount)}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>Packing Fee:</span>
                    <strong>{money(settings.packingFee)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                    <span>Order Total:</span>
                    <strong style={{ color: 'var(--primary)' }}>{money(cartTotal)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Option Selection */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, marginBottom: 14 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                Payment Method & Settle
              </label>
              <div className="svc-checkout-tender-tabs" style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  className={`svc-checkout-tender-btn ${orderPayMethod === 'Cash' ? 'active' : ''}`}
                  onClick={() => setOrderPayMethod('Cash')}
                >
                  <Banknote size={16} /> Cash
                </button>
                <button
                  type="button"
                  className={`svc-checkout-tender-btn ${orderPayMethod === 'UPI' ? 'active' : ''}`}
                  onClick={() => setOrderPayMethod('UPI')}
                >
                  <Smartphone size={16} /> UPI
                </button>
                <button
                  type="button"
                  className={`svc-checkout-tender-btn ${orderPayMethod === 'Card' ? 'active' : ''}`}
                  onClick={() => setOrderPayMethod('Card')}
                >
                  <CreditCard size={16} /> Card
                </button>
              </div>

              {/* Dynamic tender details: Cash active */}
              {orderPayMethod === 'Cash' && (
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12 }}>Cash Tendered (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder={`e.g. ${cartTotal || 500}`}
                      value={orderCashReceived}
                      onChange={(e) => setOrderCashReceived(e.target.value)}
                    />
                  </div>
                  {orderCashReceived && Number(orderCashReceived) >= cartTotal && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                      Change to return: {money(Number(orderCashReceived) - cartTotal)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!enabled || cartItems.length === 0}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={16} /> Place Takeaway Order & Settle ({money(cartTotal)})
            </button>
          </form>
        </div>
      </div>

      {/* Recent Completions History Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Completions</h2>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>Picked up and completed orders today</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Guest</th>
                <th>Items</th>
                <th>Time</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td><strong>{h.id}</strong></td>
                  <td><strong>{h.guest}</strong></td>
                  <td>{h.items} items</td>
                  <td>{h.time}</td>
                  <td><span className="badge badge-muted">{h.payment}</span></td>
                  <td><strong>{money(h.total)}</strong></td>
                  <td><span className={`badge ${statusBadge(h.status)}`}>{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODALS (SEPARATED COMPONENTS)
      ══════════════════════════════════════════════ */}
      <TakeawayConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onSaveConfig={() => {
          setIsConfigModalOpen(false);
          showToast('✓ Takeaway configuration saved successfully!');
        }}
      />

      <TakeawayBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        order={selectedOrderForBill}
        packingFee={settings.packingFee}
        money={money}
        onPrint={() => {
          showToast('Printing takeaway invoice…');
          setTimeout(() => window.print(), 300);
        }}
      />

      <NewTakeawayOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        menuItems={MENU_ITEMS}
        menuCategories={MENU_CATEGORIES}
        availableCoupons={AVAILABLE_COUPONS}
        packingFee={settings.packingFee}
        money={money}
        onSubmitOrder={handleModalCreateOrder}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="svc-toast success">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}
    </div>
  );
}

