import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  IndianRupee,
  X,
  CheckCircle2,
  Printer,
  Banknote,
  Globe,
  Tag,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { URLS } from '../../../url';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
  return {
    'Content-Type': 'application/json',
    ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
  };
};

const mapCoupon = (c) => {
  const rawType = String(c.type || c.discountType || 'amount').toLowerCase();
  const isPercent = rawType === 'percentage' || rawType === 'percent';
  const value = Number(c.discount ?? c.value ?? c.discountValue ?? 0);

  return {
    code: String(c.code || c.couponCode || '').toUpperCase(),
    type: isPercent ? 'percent' : 'flat',
    value,
    label: isPercent ? `${value}% OFF` : `₹${value} OFF`,
    minOrderAmount: Number(c.minimumOrderValue ?? c.minOrderAmount ?? c.minOrderValue ?? 0),
    maxDiscount: Number(c.maximumDiscount ?? c.maxDiscount ?? 0),
    _id: c._id,
    description: c.description || '',
  };
};

const extractOrders = (data) => {
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

// Orders API → flat bill lines (qty × rate), backend discount and the order code
const buildBill = (orders) => {
  const items = [];
  let discount = 0;

  orders.forEach((o, idx) => {
    const booking = o.booking || {};
    discount += Number(booking.discountAmount || 0);

    const products = Array.isArray(booking.products) ? booking.products : [];
    products.forEach((p, i) => {
      const qty = Number(p.quantity || 0);
      const rate = Number(p.unitPrice ?? p.price ?? 0);
      items.push({
        id: `${o.dineInOrderId || o._id || idx}-${p.productId || i}`,
        name: p.name || p.dishName || 'Item',
        qty,
        rate,
        amount: Number(p.productTotal ?? qty * rate),
      });
    });
  });

  let orderCode = '';
  if (orders.length > 0) {
    const newest = orders.reduce((a, b) =>
      String(b.booking?.logCreatedDate || b.createdAt || '') >
      String(a.booking?.logCreatedDate || a.createdAt || '')
        ? b
        : a
    );
    orderCode = newest.orderUniqueId || newest.booking?.orderUniqueId || '';
  }

  return { items, discount, orderCode };
};

export default function CheckoutPaymentModal({
  isOpen,
  onClose,
  session,
  onCompleteCheckout,
  settings = { gstPct: 5, serviceChargePct: 5 },
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
  onShowToast = () => {},
}) {
  const [payMethod, setPayMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [manualDiscount, setManualDiscount] = useState('');
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  // Itemized bill pulled from the session's orders
  const [billItems, setBillItems] = useState([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [billOrderCode, setBillOrderCode] = useState('');
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState('');

  // The checkout endpoint needs the session's Mongo id (not the display code)
  const sessionId = session?.mongoId || session?._id || '';

  // ── API: ACTIVE COUPONS ─────────────────────────────────────────
  const fetchActiveCoupons = useCallback(async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch(URLS.GetActiveCoupons, { headers: getAuthHeaders() });
      if (!res.ok) return;

      const data = await res.json();
      const list = data.coupons || data.data || data.coupon || (Array.isArray(data) ? data : []);
      if (Array.isArray(list)) setActiveCoupons(list.map(mapCoupon).filter((c) => c.code));
    } catch (err) {
      console.warn('Failed to fetch active coupons:', err);
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  // ── API: SESSION ORDERS → ITEMIZED BILL ────────────────────────────
  const fetchBill = useCallback(async (id) => {
    if (!id) {
      setBillItems([]);
      setBillDiscount(0);
      return;
    }

    // If session already holds its orders, build bill immediately
    if (Array.isArray(session?.orders) && session.orders.length > 0) {
      const bill = buildBill(session.orders);
      setBillItems(bill.items);
      setBillDiscount(bill.discount);
      setBillOrderCode(bill.orderCode || '');
      return;
    }

    setBillLoading(true);
    setBillError('');
    try {
      const res = await fetch(URLS.GetDineInOrders, {
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        setBillError(data.message || `Could not load the bill (${res.status}).`);
        return;
      }

      const allOrders = extractOrders(data);
      // Filter for this session ID or table
      const sessionOrders = allOrders.filter(
        (o) =>
          String(o.session?._id || o.sessionId || '') === String(id) ||
          (session?.table && (o.table?.tableNumber === session.table || o.table?.tableName === session.table))
      );

      const bill = buildBill(sessionOrders);
      setBillItems(bill.items);
      setBillDiscount(bill.discount);
      setBillOrderCode(bill.orderCode || '');
    } catch (err) {
      console.warn('Failed to fetch dine-in bill details:', err);
      setBillError('Could not load the bill details. Check your connection and retry.');
    } finally {
      setBillLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!isOpen) return;
    setPayMethod('Cash');
    setCashReceived('');
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    setManualDiscount('');
    setIsSubmitting(false);
    setCheckoutError('');
    setBillItems([]);
    setBillDiscount(0);
    setBillOrderCode('');
    setBillError('');
    fetchActiveCoupons();
    fetchBill(sessionId);
  }, [isOpen, fetchActiveCoupons, fetchBill, sessionId]);

  const billSubtotal = useMemo(
    () => billItems.reduce((sum, item) => sum + item.amount, 0),
    [billItems]
  );
  // Prefer the itemized bill; fall back to the session amount when no orders are loaded
  const subtotal = billSubtotal > 0 ? billSubtotal : Number(session?.amount || 0);

  const discountAmt = useMemo(() => {
    let d = 0;
    if (appliedCoupon) {
      d += appliedCoupon.type === 'percent'
        ? Math.round((subtotal * appliedCoupon.value) / 100)
        : appliedCoupon.value;
      if (appliedCoupon.maxDiscount > 0) d = Math.min(d, appliedCoupon.maxDiscount);
    }
    if (manualDiscount) {
      d += Number(manualDiscount) || 0;
    }
    return Math.min(d, subtotal);
  }, [appliedCoupon, manualDiscount, subtotal]);

  const netSubtotal = Math.max(0, subtotal - Math.min(billDiscount, subtotal) - discountAmt);
  const gst = Math.round(netSubtotal * ((settings.gstPct || 5) / 100));
  const serviceCharge = Math.round(netSubtotal * ((settings.serviceChargePct || 5) / 100));
  const grandTotal = netSubtotal + gst + serviceCharge;

  if (!isOpen || !session) return null;

  const handleApplyCoupon = (code) => {
    const clean = String(code || couponCode).trim().toUpperCase();
    if (!clean) {
      setCouponError('Enter a coupon code.');
      return;
    }

    const found = activeCoupons.find((c) => c.code === clean);
    if (!found) {
      setCouponError(
        activeCoupons.length
          ? `Invalid coupon code "${clean}".`
          : 'No active coupons available right now.'
      );
      return;
    }

    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      setCouponError(`Coupon ${found.code} needs a minimum bill of ${money(found.minOrderAmount)}.`);
      return;
    }

    setAppliedCoupon(found);
    setCouponCode(found.code);
    setCouponError('');
    onShowToast(`✓ Coupon ${found.code} applied!`);
  };

  // ── API: CHECKOUT / SETTLE THE BILL ────────────────────────────────
  const handleFinish = async () => {
    setCheckoutError('');

    if (!sessionId) {
      setCheckoutError('Missing session id — cannot settle this bill.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(URLS.CheckoutDineIn, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sessionId,
          paymentStatus: 'paid',
          paymentMethod: payMethod.toLowerCase(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      const apiError =
        data.message ||
        data.error ||
        (Array.isArray(data.errors)
          ? data.errors.map((item) => item?.message || item).join(', ')
          : '');

      if (!res.ok || data.success === false || data.status === false) {
        setCheckoutError(apiError || 'Failed to settle the bill. Please try again.');
        return;
      }

      onCompleteCheckout({
        sessionId,
        table: session.table,
        payMethod,
        grandTotal,
        cashReceived: Number(cashReceived) || grandTotal,
        invoice: data.invoice || data.data?.invoice || null,
      });
    } catch (err) {
      console.warn('Failed to checkout dine-in session:', err);
      setCheckoutError('Network error while settling the bill. Check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <IndianRupee size={20} color="var(--primary)" /> Settle Bill & Checkout — Table {session.table}
          </div>
          <button type="button" className="svc-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="svc-modal-body">
          {checkoutError && (
            <div className="svc-order-state error" role="alert" style={{ marginBottom: 14 }}>
              <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {checkoutError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: 20 }}>
            {/* Bill Summary */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Table {session.table}</div>
                  {(billOrderCode || session.orderCode) && (
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                      Order {billOrderCode || session.orderCode}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{session.guest}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {session.covers} guests · {session.server}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                {billLoading && (
                  <div className="svc-order-state" style={{ marginBottom: 10 }}>
                    <Loader2 size={14} className="svc-spin" style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Loading bill details…
                  </div>
                )}

                {!billLoading && billError && (
                  <div className="svc-order-state error" role="alert" style={{ marginBottom: 10 }}>
                    <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    {billError}
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ marginLeft: 8, fontSize: 11, padding: '3px 9px' }}
                      onClick={() => fetchBill(sessionId)}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!billLoading && !billError && billItems.length > 0 && (
                  <div className="svc-bill-items">
                    {billItems.map((item) => (
                      <div key={item.id} className="svc-bill-item">
                        <span className="svc-bill-item-name">{item.name}</span>
                        <span className="svc-bill-item-qty">
                          {item.qty} × {money(item.rate)}
                        </span>
                        <strong className="svc-bill-item-amt">{money(item.amount)}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {!billLoading && !billError && billItems.length === 0 && (
                  <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 10 }}>
                    No items ordered on this session yet.
                  </div>
                )}

                <div className="svc-bill-row" style={{ color: '#475569' }}>
                  <span>Subtotal</span>
                  <strong style={{ color: '#0f172a' }}>{money(subtotal)}</strong>
                </div>

                {billDiscount > 0 && (
                  <div className="svc-bill-row" style={{ color: '#10b981' }}>
                    <span>Order Discount</span>
                    <strong style={{ color: '#10b981' }}>- {money(Math.min(billDiscount, subtotal))}</strong>
                  </div>
                )}

                {discountAmt > 0 && (
                  <div className="svc-bill-row" style={{ color: '#10b981' }}>
                    <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                    <strong style={{ color: '#10b981' }}>- {money(discountAmt)}</strong>
                  </div>
                )}

                <div className="svc-bill-row" style={{ color: '#475569' }}>
                  <span>GST ({settings.gstPct || 5}%)</span>
                  <strong style={{ color: '#0f172a' }}>{money(gst)}</strong>
                </div>
                <div className="svc-bill-row" style={{ color: '#475569' }}>
                  <span>Service Charge ({settings.serviceChargePct || 5}%)</span>
                  <strong style={{ color: '#0f172a' }}>{money(serviceCharge)}</strong>
                </div>
                <div
                  className="svc-bill-row total"
                  style={{ color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: 10, marginTop: 8 }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800 }}>Grand Total</span>
                  <strong style={{ color: 'var(--primary)', fontSize: 22 }}>
                    {money(grandTotal)}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
                onClick={() => {
                  onShowToast('Printing customer invoice receipt…');
                  setTimeout(() => window.print(), 300);
                }}
              >
                <Printer size={15} /> Print Pre-Bill
              </button>
            </div>

            {/* Payment Option Selector & Details */}
            <div>
              {/* Coupon & Discount Section */}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1.5px solid #e2e8f0', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 750, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={14} color="var(--primary)" /> Apply Coupon / Discount
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="form-control"
                    style={{ height: 36, fontSize: 12.5, textTransform: 'uppercase', fontWeight: 700 }}
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    disabled={Boolean(appliedCoupon)}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: 11, color: '#ef4444', borderColor: '#fecaca', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setCouponError('');
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '4px 12px', fontSize: 12, whiteSpace: 'nowrap' }}
                      onClick={() => handleApplyCoupon()}
                    >
                      Apply
                    </button>
                  )}
                </div>
                {!appliedCoupon && (
                  <div className="svc-coupon-pills" style={{ marginTop: 6 }}>
                    {couponsLoading && (
                      <span style={{ fontSize: 12, color: '#64748b' }}>Loading active coupons…</span>
                    )}
                    {!couponsLoading && activeCoupons.length === 0 && (
                      <span style={{ fontSize: 12, color: '#64748b' }}>No active coupons available.</span>
                    )}
                    {activeCoupons.map((cp) => (
                      <button
                        key={cp._id || cp.code}
                        type="button"
                        className="svc-coupon-chip"
                        onClick={() => handleApplyCoupon(cp.code)}
                      >
                        {cp.code} · {cp.label}
                      </button>
                    ))}
                  </div>
                )}
                {couponError && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{couponError}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Custom Discount (₹):</span>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    style={{ height: 30, width: 90, fontSize: 12 }}
                    placeholder="0"
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ fontSize: 13.5, fontWeight: 750, color: '#1e293b', marginBottom: 8 }}>
                Select Payment Tender
              </div>

              {/* Cash / Online Tenders */}
              <div className="svc-checkout-tender-tabs">
                <button
                  type="button"
                  className={`svc-checkout-tender-btn ${payMethod === 'Cash' ? 'active' : ''}`}
                  onClick={() => setPayMethod('Cash')}
                >
                  <Banknote size={18} /> Cash
                </button>
                <button
                  type="button"
                  className={`svc-checkout-tender-btn ${payMethod === 'Online' ? 'active' : ''}`}
                  onClick={() => setPayMethod('Online')}
                >
                  <Globe size={18} /> Online
                </button>
              </div>

              {/* Cash field is active */}
              {payMethod === 'Cash' && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1.5px solid #e2e8f0' }}>
                  <div className="form-group">
                    <label className="form-label">Cash Received (₹)</label>
                    <div className="svc-input-group">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 1000"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                      />
                      <span className="svc-input-addon">₹</span>
                    </div>
                  </div>
                  {cashReceived && (
                    <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: '#059669' }}>
                      Change to return: {money(Math.max(0, Number(cashReceived) - grandTotal))}
                    </div>
                  )}
                </div>
              )}

              {/* Online payment confirmation */}
              {payMethod === 'Online' && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1.5px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                  <span>✓ Online payment of {money(grandTotal)} collected via payment gateway / UPI terminal</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="svc-modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            onClick={handleFinish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="svc-spin" /> Settling…
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Complete Payment & Vacate Table
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

