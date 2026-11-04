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
  MapPin,
  Utensils,
  CalendarCheck,
  ShoppingCart,
  X,
  CheckCircle2,
  Minus,
  Trash2,
  Phone,
  UserCheck,
  Printer,
  Banknote,
  Smartphone,
  CreditCard,
  QrCode,
  Copy,
  Layers,
  Calendar,
} from 'lucide-react';
import './ServiceOps.css';

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

const INITIAL_SECTIONS = ['Main Hall', 'Patio', 'Private', 'Bar'];

const INITIAL_HOURS = [
  { day: 'Monday', isOpen: true, openTime: '11:00', closeTime: '23:00', lastOrder: '22:30' },
  { day: 'Tuesday', isOpen: true, openTime: '11:00', closeTime: '23:00', lastOrder: '22:30' },
  { day: 'Wednesday', isOpen: true, openTime: '11:00', closeTime: '23:00', lastOrder: '22:30' },
  { day: 'Thursday', isOpen: true, openTime: '11:00', closeTime: '23:00', lastOrder: '22:30' },
  { day: 'Friday', isOpen: true, openTime: '11:00', closeTime: '23:30', lastOrder: '23:00' },
  { day: 'Saturday', isOpen: true, openTime: '11:00', closeTime: '23:30', lastOrder: '23:00' },
  { day: 'Sunday', isOpen: true, openTime: '11:00', closeTime: '23:00', lastOrder: '22:30' },
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

export default function DineIn() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [sectionsList, setSectionsList] = useState(INITIAL_SECTIONS);
  const [operatingHours, setOperatingHours] = useState(INITIAL_HOURS);
  const [enabled, setEnabled] = useState(true);

  // Filters
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  // Modals state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isBillCheckoutModalOpen, setIsBillCheckoutModalOpen] = useState(false);

  // Active Session for Checkout
  const [activeCheckoutSession, setActiveCheckoutSession] = useState(null);
  const [checkoutPayMethod, setCheckoutPayMethod] = useState('Cash');
  const [checkoutCashReceived, setCheckoutCashReceived] = useState('');
  const [checkoutUpiRef, setCheckoutUpiRef] = useState('');
  const [checkoutCardType, setCheckoutCardType] = useState('Visa');
  const [checkoutCardAuth, setCheckoutCardAuth] = useState('');

  // Add Table Form state
  const [newTableNo, setNewTableNo] = useState('');
  const [newTableSection, setNewTableSection] = useState('Main Hall');
  const [newTableSeats, setNewTableSeats] = useState(4);

  // Add Section state
  const [newSectionName, setNewSectionName] = useState('');

  // Table action mode (for right column: 'seat' | 'reserve' | 'order' | null)
  const [actionMode, setActionMode] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Seat Modal Form state
  const [modalTable, setModalTable] = useState('');
  const [modalGuest, setModalGuest] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalCovers, setModalCovers] = useState(2);
  const [modalServer, setModalServer] = useState('Ananya');
  const [modalNotes, setModalNotes] = useState('');

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
    tipSuggested: true,
    maxWaitMins: 15,
    reservationHoldMins: 20,
    defaultCovers: 2,
    defaultSection: 'Main Hall',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const sections = useMemo(() => ['All', ...sectionsList], [sectionsList]);

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
      const sectionOk = sectionFilter === 'All' || t.section === sectionFilter;
      const statusOk = statusFilter === 'All' || t.status === statusFilter;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.section.toLowerCase().includes(q) ||
        (t.guest || '').toLowerCase().includes(q);
      return sectionOk && statusOk && searchOk;
    });
  }, [tables, sectionFilter, statusFilter, search]);

  const filteredMenu = useMemo(() => {
    return MENU_ITEMS.filter((m) => {
      const catOk = menuCategory === 'All' || m.category === menuCategory;
      const q = menuSearch.trim().toLowerCase();
      const searchOk = !q || m.name.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [menuCategory, menuSearch]);

  const stats = useMemo(() => {
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const available = tables.filter((t) => t.status === 'available').length;
    const reserved = tables.filter((t) => t.status === 'reserved').length;
    const covers = sessions.reduce((s, x) => s + x.covers, 0);
    const revenue = sessions.reduce((s, x) => s + x.amount, 0);
    return { occupied, available, reserved, covers, revenue, active: sessions.length };
  }, [tables, sessions]);

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
    n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const sessionStatusBadge = (s) => {
    if (s === 'Serving') return 'badge-info';
    if (s === 'Billing') return 'badge-warning';
    if (s === 'Kitchen') return 'badge-primary';
    return 'badge-success';
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

  // ── TABLE MANAGEMENT: ADD TABLE ─────────────────────────────────────
  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableNo.trim()) {
      alert('Please enter a Table number or ID (e.g. T13)');
      return;
    }
    const cleanId = newTableNo.trim().toUpperCase();
    if (tables.some((t) => t.id === cleanId)) {
      alert(`Table ${cleanId} already exists!`);
      return;
    }

    const created = {
      id: cleanId,
      section: newTableSection,
      seats: Number(newTableSeats) || 4,
      status: 'available',
    };

    setTables((prev) => [...prev, created]);
    setNewTableNo('');
    setIsAddTableModalOpen(false);
    showToast(`✓ Table ${cleanId} added successfully to ${newTableSection}!`);
  };

  // ── TABLE MANAGEMENT: DELETE TABLE ──────────────────────────────────
  const handleDeleteTable = (tableId, e) => {
    if (e) e.stopPropagation();
    const tableObj = tables.find((t) => t.id === tableId);
    if (tableObj?.status === 'occupied') {
      alert(`Cannot delete Table ${tableId} while it is occupied!`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete Table ${tableId}?`)) {
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      if (selectedTable === tableId) setSelectedTable(null);
      showToast(`✓ Table ${tableId} deleted.`);
    }
  };

  // ── SECTIONS MANAGEMENT ─────────────────────────────────────────────
  const handleAddSection = (e) => {
    e.preventDefault();
    const cleanSec = newSectionName.trim();
    if (!cleanSec) return;
    if (sectionsList.includes(cleanSec)) {
      alert('Section already exists');
      return;
    }
    setSectionsList((prev) => [...prev, cleanSec]);
    setNewSectionName('');
    showToast(`✓ New section "${cleanSec}" created!`);
  };

  const handleDeleteSection = (secName) => {
    if (tables.some((t) => t.section === secName)) {
      alert(`Cannot delete section "${secName}" because tables are currently assigned to it.`);
      return;
    }
    setSectionsList((prev) => prev.filter((s) => s !== secName));
    showToast(`✓ Section "${secName}" removed.`);
  };

  // ── OPERATING HOURS TOGGLE ──────────────────────────────────────────
  const handleToggleDay = (dayIndex) => {
    setOperatingHours((prev) =>
      prev.map((item, idx) => (idx === dayIndex ? { ...item, isOpen: !item.isOpen } : item))
    );
  };

  const handleUpdateHours = (dayIndex, field, value) => {
    setOperatingHours((prev) =>
      prev.map((item, idx) => (idx === dayIndex ? { ...item, [field]: value } : item))
    );
  };

  // ── SEAT GUESTS ─────────────────────────────────────────────────────
  const openSeatModal = (preselectedTableId = '') => {
    const targetTable = preselectedTableId || (availableTables[0]?.id || '');
    setModalTable(targetTable);
    setModalGuest('');
    setModalPhone('');
    setModalCovers(settings.defaultCovers || 2);
    setModalServer('Ananya');
    setModalNotes('');
    setIsSeatModalOpen(true);
  };

  const handleConfirmSeat = (e) => {
    e.preventDefault();
    if (!modalTable) {
      alert('Please select an available table');
      return;
    }

    const guestName = modalGuest.trim() || 'Walk-in Guest';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSessionId = `DIN-${1040 + sessions.length + 1}`;

    setTables((prev) =>
      prev.map((t) =>
        t.id === modalTable
          ? {
              ...t,
              status: 'occupied',
              guest: guestName,
              covers: Number(modalCovers),
              orderId: newSessionId,
              since: nowTime,
            }
          : t
      )
    );

    setSessions((prev) => [
      {
        id: newSessionId,
        table: modalTable,
        guest: guestName,
        covers: Number(modalCovers),
        server: modalServer,
        status: 'Serving',
        amount: 850, // default initial order
        started: nowTime,
      },
      ...prev,
    ]);

    setIsSeatModalOpen(false);
    setSelectedTable(modalTable);
    showToast(`✓ Guests seated at Table ${modalTable} (${newSessionId})!`);
  };

  // ── BILLING & CHECKOUT MODAL ────────────────────────────────────────
  const openBillCheckoutModal = (sessionObj) => {
    setActiveCheckoutSession(sessionObj);
    setCheckoutPayMethod('Cash');
    setCheckoutCashReceived('');
    setCheckoutUpiRef('');
    setCheckoutCardAuth('');
    setIsBillCheckoutModalOpen(true);
  };

  const handleCompleteCheckout = () => {
    if (!activeCheckoutSession) return;
    const { table, id, amount } = activeCheckoutSession;

    // Remove session from active sessions
    setSessions((prev) => prev.filter((s) => s.id !== id));

    // Free the table
    setTables((prev) =>
      prev.map((t) =>
        t.id === table
          ? { id: t.id, section: t.section, seats: t.seats, status: 'available' }
          : t
      )
    );

    setIsBillCheckoutModalOpen(false);
    setActiveCheckoutSession(null);
    showToast(`✓ Bill settled for Table ${table}! Payment of ${money(amount)} collected via ${checkoutPayMethod}.`);
  };

  // Order Placement
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    // update session amount
    if (selectedTableData?.orderId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedTableData.orderId ? { ...s, amount: s.amount + cartTotal } : s
        )
      );
    }
    showToast(`✓ Order placed for Table ${selectedTable} (${money(cartTotal)})! Sent to Kitchen.`);
    setCart({});
    setActionMode(null);
  };

  // Update Table Status (Cleaning / Available)
  const updateTableStatus = (tableId, newStatus) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          if (newStatus === 'available') {
            return { id: t.id, section: t.section, seats: t.seats, status: 'available' };
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
    showToast(`✓ Table ${tableId} updated to ${newStatus}.`);
  };

  // ── RENDER RIGHT ACTION PANEL ───────────────────────────────────────
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
          <form onSubmit={handleConfirmSeat}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Table</label>
                <select
                  className="form-control"
                  value={modalTable}
                  onChange={(e) => setModalTable(e.target.value)}
                  required
                >
                  <option value="" disabled>Select available table</option>
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.id}>{t.id} — {t.section} ({t.seats} seats)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Guest name</label>
                <input
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={modalGuest}
                  onChange={(e) => setModalGuest(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Covers (number of guests)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="form-control"
                  value={modalCovers}
                  onChange={(e) => setModalCovers(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Server / captain</label>
                <select
                  className="form-control"
                  value={modalServer}
                  onChange={(e) => setModalServer(e.target.value)}
                >
                  <option>Ananya</option>
                  <option>Vikram</option>
                  <option>Meera</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes / Preferences</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Allergy, window seat, high chair…"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!enabled || availableTables.length === 0}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                <Plus size={16} /> Start Session
              </button>
            </div>
          </form>
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
              <div className="svc-cart-title">
                <ShoppingCart size={15} /> Order Items ({cartItems.length})
              </div>
              {cartItems.map((ci) => (
                <div key={ci.id} className="svc-cart-row">
                  <span>{ci.name} × {ci.qty}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{money(ci.subtotal)}</strong>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}
                      onClick={() => setCart((prev) => { const { [ci.id]: _, ...r } = prev; return r; })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="svc-cart-total">
                <span>Total</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                onClick={handlePlaceOrder}
              >
                <CheckCircle2 size={15} /> Confirm & Place Order
              </button>
            </div>
          )}
        </div>
      );
    }

    // RESERVATION PANEL
    if (actionMode === 'reserve') {
      return (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <CalendarCheck size={17} style={{ verticalAlign: 'middle', marginRight: 6, color: '#2563eb' }} />
                Reserve {t.id}
              </h2>
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
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center', color: '#ef4444', borderColor: '#fecaca' }}
                onClick={(e) => handleDeleteTable(t.id, e)}
              >
                <Trash2 size={14} /> Delete Table
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
                <CheckCircle2 size={15} /> Mark Cleaned & Available
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header with Top Buttons */}
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
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsConfigModalOpen(true)}
            title="Dine-in Configuration & Settings"
          >
            <Settings2 size={15} /> Dine-in Configuration
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsAddTableModalOpen(true)}
          >
            <Plus size={15} /> Add Table
          </button>
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
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <Utensils size={20} />
          </div>
          <div>
            <div className="stat-label">Active Sessions</div>
            <div className="stat-value">{stats.active}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Armchair size={20} />
          </div>
          <div>
            <div className="stat-label">Available Tables</div>
            <div className="stat-value">{stats.available}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <CalendarCheck size={20} />
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
            <div className="stat-value">{money(stats.revenue)}</div>
          </div>
        </div>
      </div>

      {/* Main Floor & Tables Grid Section */}
      <div className="svc-section-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Floor & Tables</h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>
                Occupied {stats.occupied} · Reserved {stats.reserved} · Available {stats.available}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: 12, padding: '5px 10px' }}
              onClick={() => setIsAddTableModalOpen(true)}
            >
              <Plus size={13} /> Add Table
            </button>
          </div>

          <div className="svc-legend">
            <span className="svc-legend-item"><span className="svc-dot" style={{ background: '#10b981' }} /> Available</span>
            <span className="svc-legend-item"><span className="svc-dot" style={{ background: '#f97316' }} /> Occupied</span>
            <span className="svc-legend-item"><span className="svc-dot" style={{ background: '#3b82f6' }} /> Reserved</span>
            <span className="svc-legend-item"><span className="svc-dot" style={{ background: '#94a3b8' }} /> Cleaning</span>
          </div>

          {/* Search & Filter */}
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
              <select className="form-control" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                {sections.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          </div>

          {/* Tables layout */}
          <div className="svc-table-grid">
            {filteredTables.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`svc-table-card ${t.status} ${selectedTable === t.id ? 'selected' : ''}`}
                onClick={() => handleTableClick(t.id)}
              >
                {t.status === 'available' && (
                  <span
                    className="svc-table-delete-btn"
                    title={`Delete Table ${t.id}`}
                    onClick={(e) => handleDeleteTable(t.id, e)}
                  >
                    <Trash2 size={12} />
                  </span>
                )}
                <div className="svc-table-no">{t.id}</div>
                <div className="svc-table-meta">{t.section}</div>
                <div className="svc-table-meta">{t.seats} seats</div>
                {t.guest && <div className="svc-table-meta" style={{ marginTop: 4, fontWeight: 750, color: '#0f172a' }}>{t.guest}</div>}
                {t.since && (
                  <div className="svc-table-meta" style={{ fontSize: 10.5, marginTop: 2 }}>
                    {t.status === 'reserved' ? '🕐 ' + (t.reservedFor || t.since) : '⏱ ' + t.since}
                  </div>
                )}
              </button>
            ))}
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
          MODAL: DINE-IN CONFIGURATION (POPUP)
      ══════════════════════════════════════════════ */}
      {isConfigModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsConfigModalOpen(false)}>
          <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Settings2 size={20} color="var(--primary)" /> Dine-in Configuration
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
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsSectionsModalOpen(true)}
                >
                  <Layers size={15} color="var(--primary)" /> Manage Dining Sections
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsHoursModalOpen(true)}
                >
                  <Clock3 size={15} color="var(--primary)" /> Operating & Kitchen Hours
                </button>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Cover charge (₹ / guest)</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={settings.coverCharge}
                      onChange={(e) => updateSetting('coverCharge', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">₹</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service charge (%)</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      className="form-control"
                      value={settings.serviceChargePct}
                      onChange={(e) => updateSetting('serviceChargePct', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Max wait time for table</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={settings.maxWaitMins}
                      onChange={(e) => updateSetting('maxWaitMins', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">mins</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reservation hold period</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={5}
                      className="form-control"
                      value={settings.reservationHoldMins}
                      onChange={(e) => updateSetting('reservationHoldMins', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">mins</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Default covers</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={settings.defaultCovers}
                    onChange={(e) => updateSetting('defaultCovers', Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Auto-assign table</label>
                  <select
                    className="form-control"
                    value={settings.autoAssign ? 'yes' : 'no'}
                    onChange={(e) => updateSetting('autoAssign', e.target.value === 'yes')}
                  >
                    <option value="yes">Yes, auto assign</option>
                    <option value="no">No, manual assign</option>
                  </select>
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
                  showToast('✓ Dine-in configuration saved successfully!');
                }}
              >
                <CheckCircle2 size={16} /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: MANAGE SECTIONS
      ══════════════════════════════════════════════ */}
      {isSectionsModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsSectionsModalOpen(false)}>
          <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Layers size={20} color="var(--primary)" /> Manage Dining Sections
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsSectionsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="svc-modal-body">
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                Sections categorize your floor plan (e.g. Main Hall, Patio, Bar, Rooftop) for faster guest seating.
              </p>

              <form onSubmit={handleAddSection} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <input
                  className="form-control"
                  placeholder="New section name (e.g. Rooftop Terrace)"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={15} /> Add Section
                </button>
              </form>

              <div className="svc-sec-list">
                {sectionsList.map((sec) => {
                  const tableCount = tables.filter((t) => t.section === sec).length;
                  return (
                    <div key={sec} className="svc-sec-item">
                      <div className="svc-sec-meta">
                        <MapPin size={16} color="var(--primary)" />
                        <div>
                          <div>{sec}</div>
                          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
                            {tableCount} tables assigned
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: 12, color: '#ef4444', borderColor: '#fecaca' }}
                        onClick={() => handleDeleteSection(sec)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="svc-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsSectionsModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: OPERATING HOURS
      ══════════════════════════════════════════════ */}
      {isHoursModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsHoursModalOpen(false)}>
          <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Clock3 size={20} color="var(--primary)" /> Operating & Kitchen Hours
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsHoursModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="svc-modal-body">
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                Set your restaurant operating schedule and the kitchen cutoff time for dine-in orders.
              </p>

              <div className="table-responsive">
                <table className="svc-hours-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Status</th>
                      <th>Opening Time</th>
                      <th>Closing Time</th>
                      <th>Last Order Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatingHours.map((h, idx) => (
                      <tr key={h.day}>
                        <td><strong>{h.day}</strong></td>
                        <td>
                          <button
                            type="button"
                            className={`badge ${h.isOpen ? 'badge-success' : 'badge-danger'}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                            onClick={() => handleToggleDay(idx)}
                          >
                            {h.isOpen ? 'Open' : 'Closed'}
                          </button>
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            style={{ height: 34, padding: '4px 8px', width: 110 }}
                            value={h.openTime}
                            disabled={!h.isOpen}
                            onChange={(e) => handleUpdateHours(idx, 'openTime', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            style={{ height: 34, padding: '4px 8px', width: 110 }}
                            value={h.closeTime}
                            disabled={!h.isOpen}
                            onChange={(e) => handleUpdateHours(idx, 'closeTime', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            style={{ height: 34, padding: '4px 8px', width: 110 }}
                            value={h.lastOrder}
                            disabled={!h.isOpen}
                            onChange={(e) => handleUpdateHours(idx, 'lastOrder', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="svc-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsHoursModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsHoursModalOpen(false);
                  showToast('✓ Operating schedule saved successfully!');
                }}
              >
                <CheckCircle2 size={16} /> Save Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: ADD TABLE (TABLE MANAGEMENT)
      ══════════════════════════════════════════════ */}
      {isAddTableModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsAddTableModalOpen(false)}>
          <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Armchair size={20} color="var(--primary)" /> Add Dining Table
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsAddTableModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTable}>
              <div className="svc-modal-body">
                <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Table Number / Identifier *</label>
                    <input
                      className="form-control"
                      placeholder="e.g. T13, VIP-1, P05"
                      value={newTableNo}
                      onChange={(e) => setNewTableNo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Floor Section *</label>
                    <select
                      className="form-control"
                      value={newTableSection}
                      onChange={(e) => setNewTableSection(e.target.value)}
                      required
                    >
                      {sectionsList.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Seating Capacity (Seats) *</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      className="form-control"
                      value={newTableSeats}
                      onChange={(e) => setNewTableSeats(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="svc-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsAddTableModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> Save & Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: SEAT GUESTS
      ══════════════════════════════════════════════ */}
      {isSeatModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsSeatModalOpen(false)}>
          <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Utensils size={20} color="var(--primary)" /> Seat Guests
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsSeatModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSeat}>
              <div className="svc-modal-body">
                <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Select Available Table *</label>
                    <select
                      className="form-control"
                      value={modalTable}
                      onChange={(e) => setModalTable(e.target.value)}
                      required
                    >
                      <option value="" disabled>Choose a table</option>
                      {availableTables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.id} — {t.section} ({t.seats} seats available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Guest Name</label>
                    <input
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={modalGuest}
                      onChange={(e) => setModalGuest(e.target.value)}
                    />
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Covers (Guests)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        className="form-control"
                        value={modalCovers}
                        onChange={(e) => setModalCovers(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone (Optional)</label>
                      <div className="svc-input-with-icon">
                        <Phone size={15} className="svc-input-icon" />
                        <input
                          className="form-control"
                          placeholder="+91 …"
                          value={modalPhone}
                          onChange={(e) => setModalPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Captain / Server</label>
                    <select
                      className="form-control"
                      value={modalServer}
                      onChange={(e) => setModalServer(e.target.value)}
                    >
                      <option>Ananya</option>
                      <option>Vikram</option>
                      <option>Meera</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Special Notes / Dietary Requirements</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="High chair, window preference, celebration…"
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="svc-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsSeatModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> Confirm & Seat Guests
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: BILL & PAYMENT CHECKOUT (FROM BILL BUTTON)
      ══════════════════════════════════════════════ */}
      {isBillCheckoutModalOpen && activeCheckoutSession && (
        <div className="svc-modal-overlay" onClick={() => setIsBillCheckoutModalOpen(false)}>
          <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <IndianRupee size={20} color="var(--primary)" /> Settle Bill & Checkout — Table {activeCheckoutSession.table}
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsBillCheckoutModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="svc-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: 20 }}>
                {/* Bill Summary */}
                <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>Table {activeCheckoutSession.table}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Order #{activeCheckoutSession.id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{activeCheckoutSession.guest}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{activeCheckoutSession.covers} guests · {activeCheckoutSession.server}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                    <div className="svc-bill-row" style={{ color: '#475569' }}>
                      <span>Subtotal</span>
                      <strong style={{ color: '#0f172a' }}>{money(activeCheckoutSession.amount)}</strong>
                    </div>
                    <div className="svc-bill-row" style={{ color: '#475569' }}>
                      <span>GST ({settings.gstPct}%)</span>
                      <strong style={{ color: '#0f172a' }}>
                        {money(Math.round(activeCheckoutSession.amount * (settings.gstPct / 100)))}
                      </strong>
                    </div>
                    <div className="svc-bill-row" style={{ color: '#475569' }}>
                      <span>Service Charge ({settings.serviceChargePct}%)</span>
                      <strong style={{ color: '#0f172a' }}>
                        {money(Math.round(activeCheckoutSession.amount * (settings.serviceChargePct / 100)))}
                      </strong>
                    </div>
                    <div className="svc-bill-row total" style={{ color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: 10, marginTop: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>Grand Total</span>
                      <strong style={{ color: 'var(--primary)', fontSize: 22 }}>
                        {money(
                          activeCheckoutSession.amount +
                            Math.round(activeCheckoutSession.amount * ((settings.gstPct + settings.serviceChargePct) / 100))
                        )}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
                    onClick={() => {
                      showToast('Printing customer invoice receipt…');
                      setTimeout(() => window.print(), 300);
                    }}
                  >
                    <Printer size={15} /> Print Pre-Bill
                  </button>
                </div>

                {/* Payment Option Selector & Details */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 750, color: '#1e293b', marginBottom: 10 }}>
                    Select Payment Tender
                  </div>
                  <div className="svc-checkout-tender-tabs">
                    <button
                      type="button"
                      className={`svc-checkout-tender-btn ${checkoutPayMethod === 'Cash' ? 'active' : ''}`}
                      onClick={() => setCheckoutPayMethod('Cash')}
                    >
                      <Banknote size={18} /> Cash
                    </button>
                    <button
                      type="button"
                      className={`svc-checkout-tender-btn ${checkoutPayMethod === 'UPI' ? 'active' : ''}`}
                      onClick={() => setCheckoutPayMethod('UPI')}
                    >
                      <Smartphone size={18} /> UPI / QR
                    </button>
                    <button
                      type="button"
                      className={`svc-checkout-tender-btn ${checkoutPayMethod === 'Card' ? 'active' : ''}`}
                      onClick={() => setCheckoutPayMethod('Card')}
                    >
                      <CreditCard size={18} /> Card
                    </button>
                  </div>

                  {checkoutPayMethod === 'Cash' && (
                    <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1.5px solid #e2e8f0' }}>
                      <div className="form-group">
                        <label className="form-label">Cash Received (₹)</label>
                        <div className="svc-input-group">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="e.g. 1000"
                            value={checkoutCashReceived}
                            onChange={(e) => setCheckoutCashReceived(e.target.value)}
                          />
                          <span className="svc-input-addon">₹</span>
                        </div>
                      </div>
                      {checkoutCashReceived && (
                        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: '#059669' }}>
                          Change to return: {money(Math.max(0, Number(checkoutCashReceived) - activeCheckoutSession.amount))}
                        </div>
                      )}
                    </div>
                  )}

                  {checkoutPayMethod === 'UPI' && (
                    <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1.5px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div className="svc-upi-qr" style={{ width: 90, height: 90 }}>
                          <QrCode size={56} style={{ opacity: 0.8 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Store UPI ID</div>
                          <div style={{ fontSize: 13, fontWeight: 750, color: '#0f172a' }}>{UPI_ID}</div>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '3px 8px', fontSize: 11, marginTop: 4 }}
                            onClick={() => {
                              navigator.clipboard.writeText(UPI_ID);
                              showToast('UPI ID copied!');
                            }}
                          >
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: 10 }}>
                        <label className="form-label">UPI Reference / UTR</label>
                        <input
                          className="form-control"
                          placeholder="12-digit UTR reference"
                          value={checkoutUpiRef}
                          onChange={(e) => setCheckoutUpiRef(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {checkoutPayMethod === 'Card' && (
                    <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1.5px solid #e2e8f0' }}>
                      <div className="form-group" style={{ marginBottom: 10 }}>
                        <label className="form-label">Card Network</label>
                        <select
                          className="form-control"
                          value={checkoutCardType}
                          onChange={(e) => setCheckoutCardType(e.target.value)}
                        >
                          <option>Visa</option>
                          <option>Mastercard</option>
                          <option>RuPay</option>
                          <option>American Express</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">POS Terminal Auth Code</label>
                        <input
                          className="form-control"
                          placeholder="e.g. 841920"
                          value={checkoutCardAuth}
                          onChange={(e) => setCheckoutCardAuth(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="svc-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsBillCheckoutModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                onClick={handleCompleteCheckout}
              >
                <CheckCircle2 size={16} /> Complete Payment & Vacate Table
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
