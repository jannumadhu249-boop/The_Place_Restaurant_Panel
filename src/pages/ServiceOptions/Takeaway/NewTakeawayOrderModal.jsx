import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  X,
  Search,
  Utensils,
  Plus,
  Minus,
  CheckCircle2,
  Banknote,
  Globe,
  Tag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { URLS } from '../../../url';

export default function NewTakeawayOrderModal({
  isOpen,
  onClose,
  menuItems = [],
  menuCategories = [],
  packingFee = 15,
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
  onOrderSuccess,
}) {
  const [guest, setGuest] = useState('');
  const [phone, setPhone] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  // Food selection
  const [cart, setCart] = useState({});
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Coupons & Discounts
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [manualDiscount, setManualDiscount] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    return {
      'Content-Type': 'application/json',
      ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  };

  // Fetch active coupons on modal open
  const fetchActiveCoupons = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetActiveCoupons, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const list = data.coupons || data.data || data.coupon || (Array.isArray(data) ? data : []);
        if (Array.isArray(list)) {
          const mapped = list.map((c) => ({
            code: c.code || c.couponCode || '',
            type: (c.type || c.discountType || 'amount') === 'percentage' ? 'percent' : 'flat',
            value: Number(c.discount || c.value || c.discountValue || 0),
            label: (c.type === 'percentage')
              ? `${c.discount || c.value}% OFF`
              : `₹${c.discount || c.value} OFF`,
            _id: c._id,
            description: c.description || '',
          }));
          setActiveCoupons(mapped);
        }
      }
    } catch (err) {
      console.warn('Could not fetch coupons for modal:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setGuest('');
      setPhone('');
      setPayMethod('Cash');
      setNotes('');
      setCart({});
      setCategory('All');
      setSearch('');
      setCouponInput('');
      setAppliedCoupon(null);
      setManualDiscount('');
      setIsSubmitting(false);
      setSubmitError('');
      fetchActiveCoupons();
    }
  }, [isOpen, fetchActiveCoupons]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter((m) => {
      const catOk = category === 'All' || m.category === category;
      const q = search.trim().toLowerCase();
      const itemName = (m.dishName || m.name || '').toLowerCase();
      const searchOk = !q || itemName.includes(q);
      return catOk && searchOk;
    });
  }, [menuItems, category, search]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id || m._id === id);
        return {
          ...item,
          productId: item?._id || item?.id || id,
          id: item?.id || id,
          _id: item?._id || id,
          name: item?.dishName || item?.name || 'Dish',
          dishName: item?.dishName || item?.name || 'Dish',
          price: Number(item?.price || 0),
          qty,
          subtotal: Number(item?.price || 0) * qty,
        };
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
    const found = activeCoupons.find((c) => c.code === code);
    if (!found) {
      alert(`Invalid or inactive coupon "${code}".`);
      return;
    }
    setAppliedCoupon(found);
    setCouponInput(code);
  };

  // Direct backend create order API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Customer Name is optional
    const customerName = guest.trim() || 'Guest';

    // 10-digit Phone Validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setSubmitError('Please enter a valid 10-digit customer phone number.');
      return;
    }

    if (cartItems.length === 0) {
      setSubmitError('Please select at least 1 food item for the takeaway order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPayment = payMethod === 'Online' ? 'online' : 'cash';
      const payload = {
        customerName,
        customerPhone: cleanPhone,
        items: cartItems.map((item) => ({
          productId: item.productId || item._id || item.id,
          quantity: Number(item.qty || 1),
        })),
        paymentMethod: selectedPayment,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        ...(Number(manualDiscount) > 0 ? { manualDiscount: Number(manualDiscount) } : {}),
        notes: notes.trim() || (appliedCoupon ? `Coupon: ${appliedCoupon.code}` : 'Takeaway Order'),
      };

      const res = await fetch(URLS.CreateTakeaway, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        const createdOrder = result.data || result.order || {};
        const orderId = createdOrder._id || result._id;

        // Record payment transaction for Online
        if (orderId && selectedPayment === 'online') {
          try {
            await fetch(`${URLS.UpdateTakeawayPayment}${orderId}/payment`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ transactionId: `ONLINE-${Date.now()}` }),
            });
          } catch (payErr) {
            console.warn('Payment update warning:', payErr);
          }
        }

        // Build the order object for the bill receipt
        const formattedOrderForBill = {
          id: createdOrder.orderNumber || createdOrder.orderId || (orderId ? `TKW-${orderId.slice(-4).toUpperCase()}` : 'TKW-NEW'),
          mongoId: orderId,
          _id: orderId,
          guest: customerName,
          phone: cleanPhone,
          slot: 'Immediate',
          status: 'Queued',
          items: cartItems.reduce((s, it) => s + Number(it.qty || 1), 0),
          itemsList: cartItems.map((it) => ({
            name: it.dishName || it.name,
            dishName: it.dishName || it.name,
            qty: it.qty,
            price: it.price,
            subtotal: it.subtotal,
          })),
          subtotal,
          discount: discountAmount,
          coupon: appliedCoupon ? appliedCoupon.code : null,
          total,
          payment: payMethod,
          paymentStatus: 'Paid',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        // Also pass the raw result so parent can use invoice data from server
        if (onOrderSuccess) {
          onOrderSuccess(result, formattedOrderForBill);
        }

        onClose();
      } else {
        const errMsg = result.message || 'Failed to place takeaway order. Please check inputs.';
        setSubmitError(errMsg);
      }
    } catch (err) {
      console.error('Error placing modal order:', err);
      setSubmitError('Network error while placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card extra-wide" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <ShoppingBag size={20} color="var(--primary)" /> New Takeaway Order & Menu
          </div>
          <button type="button" className="svc-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            {submitError && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c',
                padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              }}>
                <AlertCircle size={16} />
                <span>{submitError}</span>
              </div>
            )}

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
                    placeholder="Search dishes by name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Category filters */}
                <div className="svc-menu-cats" style={{ flexWrap: 'wrap', gap: 6 }}>
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
                    const itemId = item._id || item.id;
                    const qty = cart[itemId] || 0;
                    const displayName = item.dishName || item.name || 'Dish';

                    return (
                      <div key={itemId} className="svc-menu-item">
                        <div className="svc-menu-item-top">
                          <div>
                            <div className="svc-menu-item-name">{displayName}</div>
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
                              onClick={() => changeQty(itemId, 1)}
                            >
                              <Plus size={13} /> Add
                            </button>
                          ) : (
                            <div className="svc-qty-ctrl">
                              <button type="button" className="svc-qty-btn" onClick={() => changeQty(itemId, -1)}>
                                <Minus size={13} />
                              </button>
                              <span className="svc-qty-val">{qty}</span>
                              <button type="button" className="svc-qty-btn add" onClick={() => changeQty(itemId, 1)}>
                                <Plus size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredMenu.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      No dishes found in category &quot;{category}&quot;.
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Customer & Checkout Info */}
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
                <div style={{ fontSize: 14, fontWeight: 750, color: '#0f172a', marginBottom: 12 }}>
                  Customer & Payment
                </div>

                {/* Optional Customer Name */}
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Customer Name <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    className="form-control"
                    placeholder="e.g. Aisha Khan (or leave blank for Guest)"
                    value={guest}
                    onChange={(e) => setGuest(e.target.value)}
                  />
                </div>

                {/* 10-Digit Mobile Phone */}
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                  {phone && phone.length !== 10 && (
                    <div style={{ fontSize: 11, color: '#ea580c', marginTop: 3 }}>
                      {10 - phone.length} more digit{10 - phone.length !== 1 ? 's' : ''} required
                    </div>
                  )}
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
                      placeholder="Coupon code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', fontSize: 12, height: 32 }}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: 11, padding: '0 10px', color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => { setAppliedCoupon(null); setCouponInput(''); }}
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

                  {/* Active Coupons from API */}
                  {activeCoupons.length > 0 ? (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                      {activeCoupons.map((cpn) => (
                        <button
                          key={cpn.code}
                          type="button"
                          onClick={() => handleApplyCoupon(cpn.code)}
                          style={{
                            fontSize: 10.5, padding: '2px 7px', borderRadius: 5,
                            border: appliedCoupon?.code === cpn.code ? '1.5px solid var(--primary)' : '1px dashed #cbd5e1',
                            background: appliedCoupon?.code === cpn.code ? '#fff7ed' : '#ffffff',
                            color: appliedCoupon?.code === cpn.code ? 'var(--primary)' : '#475569',
                            fontWeight: 650, cursor: 'pointer',
                          }}
                          title={cpn.description || cpn.label}
                        >
                          {cpn.code} ({cpn.label})
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>No active coupons available</div>
                  )}

                  {appliedCoupon && (
                    <div style={{ fontSize: 11, color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: 5, marginBottom: 6 }}>
                      ✓ Coupon <strong>{appliedCoupon.code}</strong> applied — {appliedCoupon.label}
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="Custom manual discount (₹)"
                      value={manualDiscount}
                      onChange={(e) => setManualDiscount(e.target.value)}
                      style={{ fontSize: 12, height: 30 }}
                    />
                  </div>
                </div>

                {/* Selected items summary */}
                {cartItems.length > 0 && (
                  <div style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Selected Items:</div>
                    {cartItems.map((it) => (
                      <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#334155', marginBottom: 2 }}>
                        <span>{it.qty} × {it.dishName || it.name}</span>
                        <strong>{money(it.subtotal)}</strong>
                      </div>
                    ))}
                  </div>
                )}

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
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Payment Method <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="svc-checkout-tender-tabs" style={{ marginBottom: 12 }}>
                  <button
                    type="button"
                    className={`svc-checkout-tender-btn ${payMethod === 'Cash' ? 'active' : ''}`}
                    onClick={() => setPayMethod('Cash')}
                    style={{ padding: '12px', fontSize: 13.5 }}
                  >
                    <Banknote size={18} /> Cash ({money(total)})
                  </button>
                  <button
                    type="button"
                    className={`svc-checkout-tender-btn ${payMethod === 'Online' ? 'active' : ''}`}
                    onClick={() => setPayMethod('Online')}
                    style={{ padding: '12px', fontSize: 13.5 }}
                  >
                    <Globe size={18} /> Online ({money(total)})
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Notes (e.g. Please pack carefully)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ fontSize: 12 }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={cartItems.length === 0 || isSubmitting}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={15} className="spin" /> Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Place Takeaway Order & Settle ({money(total)})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
