import React, { useMemo, useState } from 'react';
import {
  Armchair,
  Users,
  Clock3,
  IndianRupee,
  Plus,
  Search,
  Settings2,
  RefreshCw,
  Utensils,
  CalendarCheck,
  ShoppingCart,
  X,
  CheckCircle2,
  Minus,
  Phone,
  UserCheck,
} from 'lucide-react';
import '../ServiceOps.css';
import SeatGuestsModal from './SeatGuestsModal';
import CheckoutPaymentModal from './CheckoutPaymentModal';
import DineInConfigModal from './DineInConfigModal';

const INITIAL_TABLES = [
  { id: 'T01', section: 'Main Hall', seats: 2, status: 'available' },
  { id: 'T02', section: 'Main Hall', seats: 4, status: 'occupied', guest: 'Rahul S.', covers: 3, orderId: 'DIN-1042', since: '12:18' },
  { id: 'T03', section: 'Main Hall', seats: 4, status: 'reserved', guest: 'Priya P.', covers: 4, reservedFor: '1:00 PM', since: '13:00' },
  { id: 'T04', section: 'Main Hall', seats: 6, status: 'cleaning' },
  { id: 'T05', section: 'Patio', seats: 2, status: 'available' },
  { id: 'T06', section: 'Patio', seats: 4, status: 'occupied', guest: 'Emma W.', covers: 2, orderId: 'DIN-1041', since: '11:52' },
  { id: 'T07', section: 'Patio', seats: 4, status: 'available' },
  { id: 'T08', section: 'Private', seats: 8, status: 'reserved', guest: 'Corp Dinner', covers: 8, reservedFor: '7:30 PM', since: '19:30' },
  { id: 'T09', section: 'Bar', seats: 2, status: 'occupied', guest: 'James L.', covers: 1, orderId: 'DIN-1040', since: '12:05' },
  { id: 'T10', section: 'Bar', seats: 2, status: 'available' },
  { id: 'T11', section: 'Main Hall', seats: 4, status: 'available' },
  { id: 'T12', section: 'Main Hall', seats: 6, status: 'occupied', guest: 'Sophie T.', covers: 5, orderId: 'DIN-1039', since: '11:40' },
];

const INITIAL_SESSIONS = [
  { id: 'DIN-1042', table: 'T02', guest: 'Rahul S.', covers: 3, server: 'Ananya', status: 'Serving', amount: 1240, started: '12:18 PM' },
  { id: 'DIN-1041', table: 'T06', guest: 'Emma W.', covers: 2, server: 'Vikram', status: 'Billing', amount: 890, started: '11:52 AM' },
  { id: 'DIN-1040', table: 'T09', guest: 'James L.', covers: 1, server: 'Ananya', status: 'Serving', amount: 320, started: '12:05 PM' },
  { id: 'DIN-1039', table: 'T12', guest: 'Sophie T.', covers: 5, server: 'Meera', status: 'Kitchen', amount: 2180, started: '11:40 AM' },
];

const SECTIONS_LIST = ['Main Hall', 'Patio', 'Private', 'Bar'];

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
  { code: 'WELCOME10', type: 'pct', value: 10, label: '10% OFF' },
  { code: 'FLAT50', type: 'flat', value: 50, label: '₹50 OFF' },
];

function DineIn() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [enabled, setEnabled] = useState(true);

  // Filters
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  // Modals state (Separated Components)
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isBillCheckoutModalOpen, setIsBillCheckoutModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [preselectedSeatTable, setPreselectedSeatTable] = useState('');

  // Active Session for Checkout
  const [activeCheckoutSession, setActiveCheckoutSession] = useState(null);

  // Table action mode (for right column: 'seat' | 'reserve' | 'order' | null)
  const [actionMode, setActionMode] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Menu / Order state
  const [menuCategory, setMenuCategory] = useState('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [cart, setCart] = useState({});

  // Configuration settings
  const [settings, setSettings] = useState({
    autoAssign: true,
    coverCharge: 0,
    serviceChargePct: 5,
    gstPct: 5,
    maxWaitMins: 15,
    reservationHoldMins: 20,
    defaultCovers: 2,
    defaultSection: 'Main Hall',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const sections = useMemo(() => ['All', ...SECTIONS_LIST], []);

  const selectedTableData = useMemo(
    () => tables.find((t) => t.id === selectedTable),
    [tables, selectedTable]
  );

  const availableTables = useMemo(
    () => tables.filter((t) => t.status === 'available'),
    [tables]
  );

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchSection = sectionFilter === 'All' || t.section === sectionFilter;
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.section.toLowerCase().includes(q) ||
        (t.guest && t.guest.toLowerCase().includes(q));
      return matchSection && matchStatus && matchSearch;
    });
  }, [tables, sectionFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const reserved = tables.filter((t) => t.status === 'reserved').length;
    const available = tables.filter((t) => t.status === 'available').length;
    const totalAmount = sessions.reduce((s, it) => s + (it.amount || 0), 0);
    return { occupied, reserved, available, totalAmount, activeSessions: sessions.length };
  }, [tables, sessions]);

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

  const cartTotal = useMemo(
    () => cartItems.reduce((s, i) => s + i.subtotal, 0),
    [cartItems]
  );

  const money = (n) =>
    `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const sessionStatusBadge = (s) => {
    if (s === 'Serving') return 'badge-info';
    if (s === 'Billing') return 'badge-warning';
    if (s === 'Kitchen') return 'badge-primary';
    return 'badge-success';
  };

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

  const handleTableClick = (tableId) => {
    if (selectedTable === tableId) {
      setSelectedTable(null);
      setActionMode(null);
    } else {
      setSelectedTable(tableId);
      setActionMode(null);
      setCart({});
    }
  };

  // ── SEAT GUESTS ─────────────────────────────────────────────────────
  const openSeatModal = (preselectedTableId = '') => {
    setPreselectedSeatTable(preselectedTableId || (availableTables[0]?.id || ''));
    setIsSeatModalOpen(true);
  };

  const handleConfirmSeat = ({ table, guest, phone, covers, server, notes }) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSessionId = `DIN-${1040 + sessions.length + 1}`;

    setTables((prev) =>
      prev.map((t) =>
        t.id === table
          ? {
              ...t,
              status: 'occupied',
              guest,
              covers,
              orderId: newSessionId,
              since: nowTime,
            }
          : t
      )
    );

    setSessions((prev) => [
      {
        id: newSessionId,
        table,
        guest,
        covers,
        server,
        status: 'Serving',
        amount: 850,
        started: nowTime,
      },
      ...prev,
    ]);

    setIsSeatModalOpen(false);
    setSelectedTable(table);
    showToast(`✓ Guests seated at Table ${table} (${newSessionId})!`);
  };

  // ── BILLING & CHECKOUT MODAL ────────────────────────────────────────
  const openBillCheckoutModal = (sessionObj) => {
    setActiveCheckoutSession(sessionObj);
    setIsBillCheckoutModalOpen(true);
  };

  const handleCompleteCheckout = ({ table, sessionId, grandTotal, payMethod }) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setTables((prev) =>
      prev.map((t) =>
        t.id === table
          ? { id: t.id, section: t.section, seats: t.seats, status: 'available' }
          : t
      )
    );

    setIsBillCheckoutModalOpen(false);
    setActiveCheckoutSession(null);
    showToast(`✓ Bill settled for Table ${table}! Payment of ${money(grandTotal)} collected via ${payMethod}.`);
  };

  // Order Placement
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    const t = selectedTableData;
    if (!t) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.table === t.id
          ? { ...s, amount: (s.amount || 0) + cartTotal, status: 'Serving' }
          : s
      )
    );

    showToast(`✓ Added ${cartItems.length} items (${money(cartTotal)}) to Table ${t.id}!`);
    setCart({});
    setActionMode(null);
  };

  const updateTableStatus = (tableId, nextStatus) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          if (nextStatus === 'available') {
            return { id: t.id, section: t.section, seats: t.seats, status: 'available' };
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    showToast(`✓ Table ${tableId} marked as ${nextStatus}.`);
  };

  // ── RIGHT COLUMN ACTION PANEL RENDERER ───────────────────────────────
  const renderActionPanel = () => {
    if (!selectedTableData) {
      return (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Quick Seat</h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>Open a new dine-in session</p>
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
              Select an available table from the floor plan to seat walk-in guests or manage active tables.
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!enabled || availableTables.length === 0}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => openSeatModal()}
            >
              <Plus size={16} /> Open Seat Guests Form
            </button>
          </div>
        </div>
      );
    }

    const t = selectedTableData;

    // ORDER FOOD PANEL
    if (actionMode === 'order') {
      return (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <ShoppingCart size={17} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--primary)' }} />
                Menu Order — {t.id} ({t.guest || 'Guest'})
              </h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>Select dishes & drinks</p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => { setActionMode(null); setCart({}); }}
            >
              <X size={14} /> Close
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div className="svc-input-with-icon" style={{ flex: 1 }}>
              <Search size={15} className="svc-input-icon" />
              <input
                className="form-control"
                placeholder="Search food item…"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
              />
            </div>
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

          <div className="svc-menu-grid">
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
                        style={{ fontSize: 12, padding: '6px 14px', width: '100%', justifyContent: 'center' }}
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

          {cartItems.length > 0 && (
            <div className="svc-cart-summary">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Items ({cartItems.reduce((s, i) => s + i.qty, 0)})</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                onClick={handlePlaceOrder}
              >
                <Plus size={16} /> Send to Kitchen ({money(cartTotal)})
              </button>
            </div>
          )}
        </div>
      );
    }

    // RESERVE TABLE PANEL
    if (actionMode === 'reserve') {
      return (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Reserve Table {t.id}</h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>{t.section} · {t.seats} seats</p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => setActionMode(null)}
            >
              <X size={14} /> Close
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setTables((prev) =>
                prev.map((tab) =>
                  tab.id === t.id
                    ? { ...tab, status: 'reserved', guest: 'Reserved Guest', reservedFor: '7:30 PM' }
                    : tab
                )
              );
              setActionMode(null);
              showToast(`✓ Table ${t.id} reserved successfully!`);
            }}
          >
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Guest name</label>
                <input className="form-control" placeholder="Reservation guest name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone number</label>
                <input className="form-control" placeholder="+91 98765 43210" required />
              </div>
              <div className="form-group">
                <label className="form-label">Covers</label>
                <input type="number" min={1} max={t.seats} className="form-control" defaultValue={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Reservation time</label>
                <input type="time" className="form-control" defaultValue="19:30" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <CalendarCheck size={15} /> Confirm Reservation
              </button>
            </div>
          </form>
        </div>
      );
    }

    // DEFAULT TABLE DETAILS PANEL
    const statusBadges = {
      available: { label: 'Available', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
      occupied: { label: 'Occupied', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
      reserved: { label: 'Reserved', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
      cleaning: { label: 'Cleaning', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
    };
    const sb = statusBadges[t.status] || statusBadges.available;
    const sessionObj = sessions.find((s) => s.table === t.id);

    return (
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Table {t.id}</h2>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>{t.section} · {t.seats} seats</p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 999,
              background: sb.bg,
              color: sb.color,
              border: `1.5px solid ${sb.border}`,
            }}
          >
            {sb.label}
          </span>
        </div>

        {/* Informative Box */}
        {t.status === 'available' ? (
          <div
            style={{
              padding: '12px 14px',
              background: '#f0fdf4',
              borderRadius: 12,
              border: '1.5px solid #a7f3d0',
              marginBottom: 16,
              fontSize: 13,
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} color="#10b981" />
            <span>Table {t.id} is clean, available, and ready for seating.</span>
          </div>
        ) : (t.guest || t.covers || t.orderId || t.since) ? (
          <div style={{ padding: '14px 16px', background: sb.bg, borderRadius: 12, border: `1.5px solid ${sb.border}`, marginBottom: 18 }}>
            {t.guest && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Guest</span>
                <strong style={{ color: '#0f172a' }}>{t.guest}</strong>
              </div>
            )}
            {t.covers && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Covers</span>
                <strong style={{ color: '#0f172a' }}>{t.covers} persons</strong>
              </div>
            )}
            {t.orderId && t.orderId !== '—' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Session</span>
                <strong style={{ color: '#0f172a' }}>{t.orderId}</strong>
              </div>
            )}
            {t.since && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{t.status === 'reserved' ? 'Reserved for' : 'Seated since'}</span>
                <strong style={{ color: '#0f172a' }}>{t.reservedFor || t.since}</strong>
              </div>
            )}
          </div>
        ) : null}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {t.status === 'available' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                disabled={!enabled}
                onClick={() => openSeatModal(t.id)}
              >
                <Utensils size={15} /> Seat Guests Now
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center' }}
                onClick={() => setActionMode('reserve')}
              >
                <CalendarCheck size={15} /> Reserve Table
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center', color: '#64748b' }}
                onClick={() => updateTableStatus(t.id, 'cleaning')}
              >
                Mark as Cleaning
              </button>
            </>
          )}

          {t.status === 'occupied' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => { setActionMode('order'); setMenuCategory('All'); setMenuSearch(''); }}
              >
                <ShoppingCart size={15} /> Add Food / Drinks
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                onClick={() => {
                  if (sessionObj) openBillCheckoutModal(sessionObj);
                  else showToast('No active session found for this table.');
                }}
              >
                <IndianRupee size={15} /> Bill & Settle Payment
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center', color: '#059669' }}
                onClick={() => updateTableStatus(t.id, 'available')}
              >
                <CheckCircle2 size={15} /> Vacate Table
              </button>
            </>
          )}

          {t.status === 'reserved' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => openSeatModal(t.id)}
              >
                <UserCheck size={15} /> Seat Reserved Guest
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center', color: '#ef4444', borderColor: '#fecaca' }}
                onClick={() => updateTableStatus(t.id, 'available')}
              >
                Cancel Reservation
              </button>
            </>
          )}

          {t.status === 'cleaning' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => updateTableStatus(t.id, 'available')}
              >
                <CheckCircle2 size={15} /> Mark Table Ready
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Armchair size={22} color="var(--primary)" /> Dine-in
          </h1>
          <p className="page-desc">
            Floor plan, table sessions, covers, and in-house service management
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
            title="Dine-in Configuration & Settings"
          >
            <Settings2 size={15} /> Dine-in Configuration
          </button> */}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!enabled}
            onClick={() => openSeatModal()}
          >
            <Plus size={16} /> Seat Guests
          </button>
        </div>
      </div>

      {/* Enable / Toggle Row */}
      <div className="svc-toggle-row">
        <div className="svc-toggle-meta">
          <div className="svc-toggle-title">Dine-in service status</div>
          <div className="svc-toggle-desc">
            When off, guests cannot be seated and walk-in/reservation intake is paused.
          </div>
        </div>
        <button
          type="button"
          className={`svc-switch ${enabled ? 'on' : ''}`}
          aria-pressed={enabled}
          onClick={() => setEnabled((v) => !v)}
          title={enabled ? 'Dine-in Enabled' : 'Dine-in Disabled'}
        >
          <span className="svc-switch-knob" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <Utensils size={20} />
          </div>
          <div>
            <div className="stat-label">Active Sessions</div>
            <div className="stat-value">{stats.activeSessions}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Armchair size={20} />
          </div>
          <div>
            <div className="stat-label">Available Tables</div>
            <div className="stat-value">{stats.available}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Clock3 size={20} />
          </div>
          <div>
            <div className="stat-label">Reserved</div>
            <div className="stat-value">{stats.reserved}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <div className="stat-label">Open Checks</div>
            <div className="stat-value">{money(stats.totalAmount)}</div>
          </div>
        </div>
      </div>

      {/* Main Floor & Right Action Column Grid */}
      <div className="svc-section-grid">
        {/* Left Card: Floor & Tables Plan */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Floor & Tables</h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>
                Occupied {stats.occupied} · Reserved {stats.reserved} · Available {stats.available}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="svc-legend">
            <span className="svc-legend-item">
              <span className="svc-legend-dot available" /> Available
            </span>
            <span className="svc-legend-item">
              <span className="svc-legend-dot occupied" /> Occupied
            </span>
            <span className="svc-legend-item">
              <span className="svc-legend-dot reserved" /> Reserved
            </span>
            <span className="svc-legend-item">
              <span className="svc-legend-dot cleaning" /> Cleaning
            </span>
          </div>

          {/* Search & Filters */}
          <div className="form-grid" style={{ marginBottom: 18, gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Search</label>
              <div className="svc-input-with-icon">
                <Search size={16} className="svc-input-icon" />
                <input
                  className="form-control"
                  placeholder="Table, section, guest…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <select
                className="form-control"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                {sections.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          </div>

          {/* Tables Interactive Grid */}
          <div className="svc-table-grid">
            {filteredTables.map((t) => {
              const isSel = selectedTable === t.id;
              return (
                <div
                  key={t.id}
                  className={`svc-table-card ${t.status} ${isSel ? 'selected' : ''}`}
                  onClick={() => handleTableClick(t.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="svc-table-no">{t.id}</div>
                  <div className="svc-table-sec">{t.section}</div>
                  <div className="svc-table-seats">{t.seats} seats</div>

                  {t.guest && (
                    <div className="svc-table-guest">
                      {t.guest}
                    </div>
                  )}

                  {t.since && (
                    <div className="svc-table-time">
                      <Clock3 size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {t.reservedFor || t.since}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!selectedTable && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#64748b', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              Click any table on the floor to seat guests, take orders, or view bill & payment options
            </div>
          )}
        </div>

        {/* Dynamic Right Action Panel */}
        {renderActionPanel()}
      </div>

      {/* Active Floor Sessions Table with BILL & PAYMENT BUTTON */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Active Floor Sessions</h2>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>Live orders and ongoing customer dining</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Table</th>
                <th>Guest</th>
                <th>Covers</th>
                <th>Server</th>
                <th>Started</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.id}</strong></td>
                  <td><span className="badge badge-primary">{s.table}</span></td>
                  <td><strong>{s.guest}</strong></td>
                  <td>{s.covers}</td>
                  <td>{s.server}</td>
                  <td>{s.started}</td>
                  <td><span className={`badge ${sessionStatusBadge(s.status)}`}>{s.status}</span></td>
                  <td><strong>{money(s.amount)}</strong></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: 12, padding: '5px 10px' }}
                        onClick={() => {
                          setSelectedTable(s.table);
                          setActionMode('order');
                          setMenuCategory('All');
                          setMenuSearch('');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                      >
                        <ShoppingCart size={13} /> Add items
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: '5px 12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        onClick={() => openBillCheckoutModal(s)}
                      >
                        <IndianRupee size={13} /> Bill & Pay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODALS (SEPARATED COMPONENTS)
      ══════════════════════════════════════════════ */}
      <SeatGuestsModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        onConfirmSeat={handleConfirmSeat}
        availableTables={availableTables}
        preselectedTable={preselectedSeatTable}
        defaultCovers={settings.defaultCovers}
      />

      <CheckoutPaymentModal
        isOpen={isBillCheckoutModalOpen}
        onClose={() => setIsBillCheckoutModalOpen(false)}
        session={activeCheckoutSession}
        onCompleteCheckout={handleCompleteCheckout}
        settings={settings}
        availableCoupons={AVAILABLE_COUPONS}
        money={money}
        onShowToast={showToast}
      />

      <DineInConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('✓ Dine-in configuration saved successfully!');
        }}
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

export { DineIn };
export default DineIn;

