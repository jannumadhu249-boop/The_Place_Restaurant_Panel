import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  X,
  Search,
  Utensils,
  Plus,
  Minus,
  CheckCircle2,
  Banknote,
  Smartphone,
  CreditCard,
  Tag,
} from 'lucide-react';

export default function NewTakeawayOrderModal({
  isOpen,
  onClose,
  menuItems = [],
  menuCategories = [],
  availableCoupons = [],
  packingFee = 15,
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
  onSubmitOrder,
}) {
  const [guest, setGuest] = useState('');
  const [phone, setPhone] = useState('');
  const [slot, setSlot] = useState('12:55');
  const [payMethod, setPayMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [notes, setNotes] = useState('');

  // Food selection
  const [cart, setCart] = useState({});
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Coupons & Discounts
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [manualDiscount, setManualDiscount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGuest('');
      setPhone('');
      setSlot('12:55');
      setPayMethod('Cash');
      setCashReceived('');
      setNotes('');
      setCart({});
      setCategory('All');
      setSearch('');
      setCouponInput('');
      setAppliedCoupon(null);
      setManualDiscount('');
    }
  }, [isOpen]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter((m) => {
      const catOk = category === 'All' || m.category === category;
      const q = search.trim().toLowerCase();
      const searchOk = !q || m.name.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [menuItems, category, search]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id);
        return { ...item, qty, subtotal: item.price * qty };
      });
  }, [cart, menuItems]);

  const subtotal = useMemo(
    () => cartItems.reduce((s, i) => s + i.subtotal, 0),
    [cartItems]
  );

  const discountAmount = useMemo(() => {
    let disc = Number(manualDiscount) || 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        disc += Math.round((subtotal * appliedCoupon.value) / 100);
      } else {
        disc += appliedCoupon.value;
      }
    }
    return Math.min(disc, subtotal);
  }, [appliedCoupon, manualDiscount, subtotal]);

  const total = useMemo(() => {
    if (cartItems.length === 0) return 0;
    const base = Math.max(0, subtotal - discountAmount);
    return base + (packingFee || 0);
  }, [subtotal, discountAmount, cartItems.length, packingFee]);

  if (!isOpen) return null;

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
    const found = availableCoupons.find((c) => c.code === code);
    if (!found) {
      alert(`Invalid coupon "${code}".`);
      return;
    }
    setAppliedCoupon(found);
    setCouponInput(code);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guest.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (cartItems.length === 0) {
      alert('Please select at least 1 food item for the takeaway order.');
      return;
    }

    onSubmitOrder({
      guest: guest.trim(),
      phone: phone.trim() || '+91 98xxx 00000',
      slot,
      payMethod,
      cartItems,
      subtotal,
      discountAmount,
      coupon: appliedCoupon ? appliedCoupon.code : null,
      total,
      notes,
    });
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card extra-wide" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <ShoppingBag size={20} color="var(--primary)" /> New Takeaway Order & Menu
          </div>
          <button
            type="button"
            className="svc-modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="svc-menu-cats">
                  {menuCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`svc-menu-cat-btn ${category === c ? 'active' : ''}`}
                      onClick={() => setCategory(c)}
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
                  <label className="form-label">Customer Name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Aisha Khan"
                    value={guest}
                    onChange={(e) => setGuest(e.target.value)}
                    // required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-control"
                    placeholder="+91 …"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Pickup Slot</label>
                  <select
                    className="form-control"
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                  >
                    <option>12:45</option>
                    <option>12:55</option>
                    <option>13:05</option>
                    <option>13:15</option>
                    <option>13:30</option>
                  </select>
                </div>

                {/* Coupon & Discount Section */}
                <div style={{ background: '#ffffff', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    <Tag size={13} color="var(--primary)" /> Apply Coupon / Discount
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Coupon (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', fontSize: 12, height: 32 }}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: 11, padding: '0 10px', color: '#ef4444', borderColor: '#fca5a5' }}
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
                        style={{ fontSize: 11, padding: '0 12px' }}
                        onClick={() => handleApplyCoupon()}
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                    {availableCoupons.map((cpn) => (
                      <button
                        key={cpn.code}
                        type="button"
                        onClick={() => handleApplyCoupon(cpn.code)}
                        style={{
                          fontSize: 10.5,
                          padding: '2px 6px',
                          borderRadius: 5,
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
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="Manual discount (₹)"
                      value={manualDiscount}
                      onChange={(e) => setManualDiscount(e.target.value)}
                      style={{ fontSize: 12, height: 30 }}
                    />
                  </div>
                </div>

                {/* Order summary */}
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Items Subtotal:</span>
                    <strong>{money(subtotal)}</strong>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#059669', fontWeight: 650 }}>
                      <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}:</span>
                      <strong>- {money(discountAmount)}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>Packing Fee:</span>
                    <strong>{money(packingFee)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                    <span>Total Due:</span>
                    <strong style={{ color: 'var(--primary)' }}>{money(total)}</strong>
                  </div>
                </div>

                {/* Payment Mode */}
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Payment Tender</label>
                <div className="svc-checkout-tender-tabs" style={{ marginBottom: 10 }}>
                  <button
                    type="button"
                    className={`svc-checkout-tender-btn ${payMethod === 'Cash' ? 'active' : ''}`}
                    onClick={() => setPayMethod('Cash')}
                  >
                    <Banknote size={15} /> Cash
                  </button>
                  <button
                    type="button"
                    className={`svc-checkout-tender-btn ${payMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPayMethod('UPI')}
                  >
                    <Smartphone size={15} /> UPI
                  </button>
                  <button
                    type="button"
                    className={`svc-checkout-tender-btn ${payMethod === 'Card' ? 'active' : ''}`}
                    onClick={() => setPayMethod('Card')}
                  >
                    <CreditCard size={15} /> Card
                  </button>
                </div>

                {/* Dynamic tender details: Cash active, UPI & Card commented out */}
                {payMethod === 'Cash' && (
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Cash tendered (₹)"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />
                  </div>
                )}

                {/* UPI & Card payment option fields commented out per instruction */}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={cartItems.length === 0}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                >
                  <CheckCircle2 size={16} /> Place Order & Generate Bill ({money(total)})
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

