import React, { useState, useMemo, useEffect } from 'react';
import {
  IndianRupee,
  X,
  CheckCircle2,
  Printer,
  Banknote,
  Smartphone,
  CreditCard,
  Tag,
} from 'lucide-react';

export default function CheckoutPaymentModal({
  isOpen,
  onClose,
  session,
  onCompleteCheckout,
  settings = { gstPct: 5, serviceChargePct: 5 },
  availableCoupons = [
    { code: 'WELCOME10', type: 'pct', value: 10, label: '10% OFF' },
    { code: 'FLAT50', type: 'flat', value: 50, label: '₹50 OFF' },
  ],
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
  onShowToast = () => {},
}) {
  const [payMethod, setPayMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [manualDiscount, setManualDiscount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPayMethod('Cash');
      setCashReceived('');
      setCouponCode('');
      setAppliedCoupon(null);
      setManualDiscount('');
    }
  }, [isOpen, session]);

  const subtotal = session?.amount || 0;

  const discountAmt = useMemo(() => {
    let d = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'pct') {
        d += Math.round((subtotal * appliedCoupon.value) / 100);
      } else {
        d += appliedCoupon.value;
      }
    }
    if (manualDiscount) {
      d += Number(manualDiscount) || 0;
    }
    return Math.min(d, subtotal);
  }, [appliedCoupon, manualDiscount, subtotal]);

  const netSubtotal = Math.max(0, subtotal - discountAmt);
  const gst = Math.round(netSubtotal * ((settings.gstPct || 5) / 100));
  const serviceCharge = Math.round(netSubtotal * ((settings.serviceChargePct || 5) / 100));
  const grandTotal = netSubtotal + gst + serviceCharge;

  if (!isOpen || !session) return null;

  const handleApplyCoupon = (code) => {
    const clean = (code || couponCode).trim().toUpperCase();
    const found = availableCoupons.find((c) => c.code === clean);
    if (found) {
      setAppliedCoupon(found);
      setCouponCode(found.code);
      onShowToast(`✓ Coupon ${found.code} applied!`);
    } else {
      alert(`Invalid coupon code "${clean}". Try WELCOME10 or FLAT50.`);
    }
  };

  const handleFinish = () => {
    onCompleteCheckout({
      sessionId: session.id,
      table: session.table,
      payMethod,
      grandTotal,
      cashReceived: Number(cashReceived) || grandTotal,
    });
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: 20 }}>
            {/* Bill Summary */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Table {session.table}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Session #{session.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{session.guest}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {session.covers} guests · {session.server}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                <div className="svc-bill-row" style={{ color: '#475569' }}>
                  <span>Subtotal</span>
                  <strong style={{ color: '#0f172a' }}>{money(subtotal)}</strong>
                </div>

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
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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
                    {availableCoupons.map((cp) => (
                      <button
                        key={cp.code}
                        type="button"
                        className="svc-coupon-chip"
                        onClick={() => handleApplyCoupon(cp.code)}
                      >
                        {cp.code} · {cp.label}
                      </button>
                    ))}
                  </div>
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

              {/* All 3 Tender Tabs */}
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
                  className={`svc-checkout-tender-btn ${payMethod === 'UPI' ? 'active' : ''}`}
                  onClick={() => setPayMethod('UPI')}
                >
                  <Smartphone size={18} /> UPI / QR
                </button>
                <button
                  type="button"
                  className={`svc-checkout-tender-btn ${payMethod === 'Card' ? 'active' : ''}`}
                  onClick={() => setPayMethod('Card')}
                >
                  <CreditCard size={18} /> Card
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

              {/* UPI fields commented out per instruction */}
              {payMethod === 'UPI' && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1.5px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                  <span>✓ Customer payment scanned via UPI terminal ({money(grandTotal)})</span>
                </div>
              )}

              {/* Card fields commented out per instruction */}
              {payMethod === 'Card' && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1.5px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                  <span>✓ POS Card Terminal swipe/tap confirmed ({money(grandTotal)})</span>
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
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            onClick={handleFinish}
          >
            <CheckCircle2 size={16} /> Complete Payment & Vacate Table
          </button>
        </div>
      </div>
    </div>
  );
}

