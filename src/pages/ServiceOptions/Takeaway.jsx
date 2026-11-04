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
  Bell,
  Phone,
  X,
  CreditCard,
  IndianRupee,
  Check,
  User,
  Printer,
  Banknote,
  Smartphone,
  QrCode,
  Copy,
  Minus,
  Trash2,
  Utensils,
} from 'lucide-react';
import './ServiceOps.css';

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
const UPI_ID = 'theplace@upi';

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

  // Food selection in takeaway order form
  const [cart, setCart] = useState({});
  const [menuCategory, setMenuCategory] = useState('All');
  const [menuSearch, setMenuSearch] = useState('');

  // Order Details Form state
  const [orderGuest, setOrderGuest] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderSlot, setOrderSlot] = useState('13:15');
  const [orderPayMethod, setOrderPayMethod] = useState('Cash'); // 'Cash' | 'UPI' | 'Card'
  const [orderCashReceived, setOrderCashReceived] = useState('');
  const [orderUpiRef, setOrderUpiRef] = useState('');
  const [orderCardAuth, setOrderCardAuth] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

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
      const catOk = menuCategory === 'All' || m.category === menuCategory;
      const q = menuSearch.trim().toLowerCase();
      const searchOk = !q || m.name.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [menuCategory, menuSearch]);

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

  const cartTotal = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return cartSubtotal + (settings.packingFee || 0);
  }, [cartSubtotal, cartItems.length, settings.packingFee]);

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
    n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

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

  // Create Takeaway Order with selected food & payment
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
      total: cartTotal,
      placed: nowTime,
      slot: orderSlot,
      payment: orderPayMethod,
      notes: orderNotes,
    };

    setQueue((prev) => [newOrder, ...prev]);
    setIsNewOrderModalOpen(false);

    // Reset Form
    setOrderGuest('');
    setOrderPhone('');
    setOrderNotes('');
    setCart({});
    setOrderCashReceived('');

    showToast(`✓ Takeaway order ${newId} created for ${newOrder.guest} (${money(cartTotal)})! Paid via ${orderPayMethod}.`);
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
    showToast(`✓ Order ${orderId} marked Ready for Pickup! Customer notified via SMS.`);
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
            Pickup queue, prep slots, packing charges, and customer notifications
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsConfigModalOpen(true)}
            title="Takeaway Configuration & Rules"
          >
            <Settings2 size={15} /> Takeaway Configuration
          </button>
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
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '6px 10px' }}
                      onClick={() => showToast(`✓ Notification sent to ${o.guest} (${o.phone})!`)}
                      title="Notify customer"
                    >
                      <Bell size={13} />
                    </button>
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

              {/* Menu items list (compact) */}
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

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Food Subtotal:</span>
                    <strong>{money(cartSubtotal)}</strong>
                  </div>
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

              {/* Dynamic tender details */}
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

              {orderPayMethod === 'UPI' && (
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <QrCode size={40} style={{ opacity: 0.8 }} />
                    <div style={{ fontSize: 12 }}>
                      <div>Pay via QR or ID: <strong>{UPI_ID}</strong></div>
                      <input
                        className="form-control"
                        style={{ height: 32, fontSize: 12, marginTop: 4 }}
                        placeholder="Optional UPI UTR No."
                        value={orderUpiRef}
                        onChange={(e) => setOrderUpiRef(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {orderPayMethod === 'Card' && (
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <input
                    className="form-control"
                    style={{ height: 36, fontSize: 12 }}
                    placeholder="POS Auth / Approval Code"
                    value={orderCardAuth}
                    onChange={(e) => setOrderCardAuth(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!enabled || cartItems.length === 0}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={16} /> Place Takeaway Order & Generate Bill ({money(cartTotal)})
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
          MODAL: TAKEAWAY CONFIGURATION (POPUP)
      ══════════════════════════════════════════════ */}
      {isConfigModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsConfigModalOpen(false)}>
          <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Settings2 size={20} color="var(--primary)" /> Takeaway Configuration
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsConfigModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="svc-modal-body">
              <div className="svc-settings-group">
                <div className="svc-settings-group-title">
                  <Clock3 size={15} color="var(--primary)" /> Prep Timing & Capacity
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Default preparation time</label>
                    <div className="svc-input-group">
                      <input
                        type="number"
                        min={5}
                        className="form-control"
                        value={settings.prepMins}
                        onChange={(e) => updateSetting('prepMins', Number(e.target.value))}
                      />
                      <span className="svc-input-addon">mins</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slot time interval</label>
                    <div className="svc-input-group">
                      <input
                        type="number"
                        min={5}
                        className="form-control"
                        value={settings.slotInterval}
                        onChange={(e) => updateSetting('slotInterval', Number(e.target.value))}
                      />
                      <span className="svc-input-addon">mins</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max orders per slot</label>
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      value={settings.maxOrdersPerSlot}
                      onChange={(e) => updateSetting('maxOrdersPerSlot', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="svc-settings-group">
                <div className="svc-settings-group-title">
                  <IndianRupee size={15} color="var(--primary)" /> Charges & Payment Policy
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Packaging fee</label>
                    <div className="svc-input-group">
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        value={settings.packingFee}
                        onChange={(e) => updateSetting('packingFee', Number(e.target.value))}
                      />
                      <span className="svc-input-addon">₹</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Require prepaid orders</label>
                    <select
                      className="form-control"
                      value={settings.requirePrepaid ? 'yes' : 'no'}
                      onChange={(e) => updateSetting('requirePrepaid', e.target.value === 'yes')}
                    >
                      <option value="no">No, allow pay at counter</option>
                      <option value="yes">Yes, mandatory prepaid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="svc-settings-group">
                <div className="svc-settings-group-title">
                  <Bell size={15} color="var(--primary)" /> Notifications
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Send SMS alert when ready</label>
                    <select
                      className="form-control"
                      value={settings.notifySms ? 'yes' : 'no'}
                      onChange={(e) => updateSetting('notifySms', e.target.value === 'yes')}
                    >
                      <option value="yes">Yes, send SMS</option>
                      <option value="no">Disabled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Send App push notification</label>
                    <select
                      className="form-control"
                      value={settings.notifyPush ? 'yes' : 'no'}
                      onChange={(e) => updateSetting('notifyPush', e.target.value === 'yes')}
                    >
                      <option value="yes">Yes, send Push</option>
                      <option value="no">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="svc-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsConfigModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsConfigModalOpen(false);
                  showToast('✓ Takeaway configuration saved successfully!');
                }}
              >
                <CheckCircle2 size={16} /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: NEW TAKEAWAY ORDER WITH MENU & PAYMENT
      ══════════════════════════════════════════════ */}
      {isNewOrderModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsNewOrderModalOpen(false)}>
          <div className="svc-modal-card extra-wide" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <ShoppingBag size={20} color="var(--primary)" /> New Takeaway Order & Menu
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsNewOrderModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="svc-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
                  {/* Left: Food Selection */}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 750, color: '#0f172a', marginBottom: 10 }}>
                      <Utensils size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--primary)' }} />
                      Select Dishes & Drinks
                    </div>

                    <div className="svc-input-with-icon" style={{ marginBottom: 12 }}>
                      <Search size={15} className="svc-input-icon" />
                      <input
                        className="form-control"
                        placeholder="Search menu items…"
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                      />
                    </div>

                    <div className="svc-menu-cats">
                      {MENU_CATEGORIES.map((c) => (
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

                    <div className="svc-menu-grid" style={{ maxHeight: 320 }}>
                      {filteredMenu.map((item) => {
                        const qty = cart[item.id] || 0;
                        return (
                          <div key={item.id} className="svc-menu-item">
                            <div className="svc-menu-item-top">
                              <div>
                                <div className="svc-menu-item-name">{item.name}</div>
                                <div className="svc-menu-item-cat">{item.category}</div>
                              </div>
                              <div className="svc-menu-item-price">{money(item.price)}</div>
                            </div>
                            <div className="svc-menu-item-qty">
                              {qty === 0 ? (
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  style={{ fontSize: 12, padding: '5px 12px', width: '100%', justifyContent: 'center' }}
                                  onClick={() => changeQty(item.id, 1)}
                                >
                                  <Plus size={13} /> Add
                                </button>
                              ) : (
                                <div className="svc-qty-ctrl">
                                  <button type="button" className="svc-qty-btn" onClick={() => changeQty(item.id, -1)}>
                                    <Minus size={13} />
                                  </button>
                                  <span className="svc-qty-val">{qty}</span>
                                  <button type="button" className="svc-qty-btn add" onClick={() => changeQty(item.id, 1)}>
                                    <Plus size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Customer & Checkout Info */}
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
                    <div style={{ fontSize: 14, fontWeight: 750, color: '#0f172a', marginBottom: 12 }}>
                      Customer & Payment
                    </div>

                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Customer Name *</label>
                      <input
                        className="form-control"
                        placeholder="e.g. Aisha Khan"
                        value={orderGuest}
                        onChange={(e) => setOrderGuest(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Phone Number</label>
                      <input
                        className="form-control"
                        placeholder="+91 …"
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 14 }}>
                      <label className="form-label">Pickup Slot</label>
                      <select
                        className="form-control"
                        value={orderSlot}
                        onChange={(e) => setOrderSlot(e.target.value)}
                      >
                        <option>12:45</option>
                        <option>12:55</option>
                        <option>13:05</option>
                        <option>13:15</option>
                        <option>13:30</option>
                      </select>
                    </div>

                    {/* Order summary */}
                    <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Items Subtotal:</span>
                        <strong>{money(cartSubtotal)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Packing Fee:</span>
                        <strong>{money(settings.packingFee)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                        <span>Total Due:</span>
                        <strong style={{ color: 'var(--primary)' }}>{money(cartTotal)}</strong>
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Payment Tender</label>
                    <div className="svc-checkout-tender-tabs" style={{ marginBottom: 10 }}>
                      <button
                        type="button"
                        className={`svc-checkout-tender-btn ${orderPayMethod === 'Cash' ? 'active' : ''}`}
                        onClick={() => setOrderPayMethod('Cash')}
                      >
                        <Banknote size={15} /> Cash
                      </button>
                      <button
                        type="button"
                        className={`svc-checkout-tender-btn ${orderPayMethod === 'UPI' ? 'active' : ''}`}
                        onClick={() => setOrderPayMethod('UPI')}
                      >
                        <Smartphone size={15} /> UPI
                      </button>
                      <button
                        type="button"
                        className={`svc-checkout-tender-btn ${orderPayMethod === 'Card' ? 'active' : ''}`}
                        onClick={() => setOrderPayMethod('Card')}
                      >
                        <CreditCard size={15} /> Card
                      </button>
                    </div>

                    {orderPayMethod === 'Cash' && (
                      <div className="form-group" style={{ marginBottom: 8 }}>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Cash tendered (₹)"
                          value={orderCashReceived}
                          onChange={(e) => setOrderCashReceived(e.target.value)}
                        />
                      </div>
                    )}
                    {orderPayMethod === 'UPI' && (
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        UPI ID: <strong>{UPI_ID}</strong>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={cartItems.length === 0}
                      style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                    >
                      <CheckCircle2 size={16} /> Place Order & Generate Bill ({money(cartTotal)})
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: VIEW & PRINT TAKEAWAY BILL
      ══════════════════════════════════════════════ */}
      {isBillModalOpen && selectedOrderForBill && (
        <div className="svc-modal-overlay" onClick={() => setIsBillModalOpen(false)}>
          <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Printer size={20} color="var(--primary)" /> Takeaway Receipt — {selectedOrderForBill.id}
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsBillModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="svc-modal-body">
              <div className="svc-bill-preview">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>TAKEAWAY INVOICE</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedOrderForBill.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedOrderForBill.guest}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Slot: {selectedOrderForBill.slot}</div>
                  </div>
                </div>

                <div className="svc-bill-row">
                  <span>Order Items ({selectedOrderForBill.items})</span>
                  <strong>{money(selectedOrderForBill.total - (settings.packingFee || 15))}</strong>
                </div>
                <div className="svc-bill-row">
                  <span>Packaging Charges</span>
                  <strong>{money(settings.packingFee || 15)}</strong>
                </div>
                <div className="svc-bill-row total">
                  <span>Total Paid</span>
                  <strong>{money(selectedOrderForBill.total)}</strong>
                </div>
                <div style={{ fontSize: 12, marginTop: 10, opacity: 0.85 }}>
                  Payment Method: <strong>{selectedOrderForBill.payment}</strong>
                </div>
              </div>
            </div>

            <div className="svc-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsBillModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  showToast('Printing takeaway invoice…');
                  setTimeout(() => window.print(), 300);
                }}
              >
                <Printer size={15} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="svc-toast success">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}
    </div>
  );
}
