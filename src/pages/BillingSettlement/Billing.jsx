import React, { useMemo, useState } from 'react';
import {
  Receipt,
  IndianRupee,
  FileText,
  Search,
  Plus,
  Download,
  RefreshCw,
  Printer,
  CreditCard,
  Settings2,
  Percent,
  Banknote,
  Smartphone,
  CheckCircle2,
  Copy,
  QrCode,
  Mail,
  Send,
  X,
  Phone,
  User,
  Tag,
  Check,
} from 'lucide-react';
import '../ServiceOptions/ServiceOps.css';

const INITIAL_BILLS = [
  { id: 'BILL-4412', orderId: 'DIN-1041', guest: 'Emma W.', channel: 'Dine-in', status: 'Unpaid', subtotal: 820, discount: 0, tax: 41, service: 41, total: 902, time: '12:48 PM', payment: '—' },
  { id: 'BILL-4411', orderId: 'TKW-2208', guest: 'Aisha Khan', channel: 'Takeaway', status: 'Paid', subtotal: 450, discount: 50, tax: 20, service: 20, total: 440, time: '12:42 PM', payment: 'UPI' },
  { id: 'BILL-4410', orderId: 'ORD-8924', guest: 'Sophie Taylor', channel: 'Delivery', status: 'Paid', subtotal: 2100, discount: 200, tax: 95, service: 95, total: 2090, time: '12:20 PM', payment: 'Card' },
  { id: 'BILL-4409', orderId: 'DIN-1038', guest: 'Walk-in', channel: 'Dine-in', status: 'Partial', subtotal: 1600, discount: 0, tax: 80, service: 80, total: 1760, time: '11:55 AM', payment: 'Cash' },
  { id: 'BILL-4408', orderId: 'TKW-2203', guest: 'David M.', channel: 'Takeaway', status: 'Refunded', subtotal: 1100, discount: 0, tax: 55, service: 55, total: 1210, time: '11:30 AM', payment: 'Card' },
  { id: 'BILL-4407', orderId: 'ORD-8921', guest: 'Emma Watson', channel: 'Delivery', status: 'Paid', subtotal: 1500, discount: 150, tax: 68, service: 68, total: 1486, time: '11:05 AM', payment: 'UPI' },
];

const LINE_ITEMS = [
  { name: 'Butter Chicken', qty: 1, rate: 420, amount: 420 },
  { name: 'Garlic Naan', qty: 2, rate: 80, amount: 160 },
  { name: 'Mango Lassi', qty: 2, rate: 120, amount: 240 },
];

const AVAILABLE_COUPONS = [
  { code: 'WELCOME10', type: 'pct', value: 10, label: '10% OFF' },
  { code: 'FLAT50', type: 'flat', value: 50, label: '₹50 OFF' },
  { code: 'FESTIVE20', type: 'pct', value: 20, label: '20% OFF' },
];

const UPI_ID = 'theplace@upi';

export default function Billing() {
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [payMethod, setPayMethod] = useState('Cash'); // 'Cash' | 'UPI' | 'Card'
  const [selectedBill, setSelectedBill] = useState(INITIAL_BILLS[0]);

  // Charges & Tax Rules
  const [charges, setCharges] = useState({
    gstPct: 5,
    servicePct: 5,
    packingFee: 15,
    deliveryFee: 40,
    tipDefaultPct: 10,
    roundOff: true,
    invoicePrefix: 'BILL',
  });

  // Coupons & Discounts
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [manualDiscount, setManualDiscount] = useState('');

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isTaxesModalOpen, setIsTaxesModalOpen] = useState(false);
  const [isEmailSmsModalOpen, setIsEmailSmsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Payment states
  const [cashReceived, setCashReceived] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [upiCopied, setUpiCopied] = useState(false);
  const [cardType, setCardType] = useState('Visa');
  const [cardRef, setCardRef] = useState('');

  // Email / SMS Modal states
  const [sendEmail, setSendEmail] = useState('guest@example.com');
  const [sendPhone, setSendPhone] = useState('+91 98765 43210');

  // Generate Bill Modal form state
  const [genOrderId, setGenOrderId] = useState('');
  const [genChannel, setGenChannel] = useState('Dine-in');
  const [genGuest, setGenGuest] = useState('');
  const [genCoupon, setGenCoupon] = useState('');
  const [genDiscountAmt, setGenDiscountAmt] = useState('');
  const [genApplyGst, setGenApplyGst] = useState('yes');
  const [genApplySvc, setGenApplySvc] = useState('yes');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const statusOk = statusFilter === 'All' || b.status === statusFilter;
      const channelOk = channelFilter === 'All' || b.channel === channelFilter;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.orderId.toLowerCase().includes(q) ||
        b.guest.toLowerCase().includes(q);
      return statusOk && channelOk && searchOk;
    });
  }, [bills, statusFilter, channelFilter, search]);

  const stats = useMemo(() => {
    const paid = bills.filter((b) => b.status === 'Paid');
    const unpaid = bills.filter((b) => b.status === 'Unpaid' || b.status === 'Partial');
    const refunded = bills.filter((b) => b.status === 'Refunded');
    return {
      bills: bills.length,
      collected: paid.reduce((s, b) => s + b.total, 0),
      outstanding: unpaid.reduce((s, b) => s + b.total, 0),
      refunds: refunded.reduce((s, b) => s + b.total, 0),
    };
  }, [bills]);

  const money = (n) =>
    n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const statusBadge = (s) => {
    if (s === 'Paid') return 'badge-success';
    if (s === 'Unpaid' || s === 'Partial') return 'badge-warning';
    if (s === 'Refunded') return 'badge-danger';
    return 'badge-info';
  };

  // ── DYNAMIC BILL TOTAL CALCULATION (WITH COUPON & DISCOUNT) ──────────
  const previewSub = selectedBill?.subtotal || LINE_ITEMS.reduce((s, i) => s + i.amount, 0);

  // Discount calculation
  const discountVal = useMemo(() => {
    let disc = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'pct') {
        disc += Math.round((previewSub * appliedCoupon.value) / 100);
      } else {
        disc += appliedCoupon.value;
      }
    }
    if (manualDiscount) {
      disc += Number(manualDiscount) || 0;
    }
    return Math.min(disc, previewSub);
  }, [appliedCoupon, manualDiscount, previewSub]);

  const netSubtotal = Math.max(0, previewSub - discountVal);
  const previewTax = Math.round(netSubtotal * (charges.gstPct / 100));
  const previewSvc = Math.round(netSubtotal * (charges.servicePct / 100));
  const billTotal = netSubtotal + previewTax + previewSvc;

  const updateCharge = (key, value) =>
    setCharges((prev) => ({ ...prev, [key]: value }));

  const cashChange = cashReceived ? Number(cashReceived) - billTotal : null;

  // Coupon handling
  const handleApplyCoupon = (codeToApply) => {
    const targetCode = (codeToApply || couponInput).trim().toUpperCase();
    if (!targetCode) return;
    const found = AVAILABLE_COUPONS.find((c) => c.code === targetCode);
    if (found) {
      setAppliedCoupon(found);
      setCouponInput(found.code);
      showToast(`✓ Coupon ${found.code} (${found.label}) applied successfully!`);
    } else {
      alert(`Invalid coupon code "${targetCode}". Try WELCOME10 or FLAT50.`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    showToast('Coupon removed.');
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
    showToast('✓ UPI ID copied to clipboard!');
  };

  // Generate Bill Submit
  const handleGenerateBillSubmit = (e) => {
    if (e) e.preventDefault();
    const newBillId = `BILL-${4412 + bills.length + 1}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const subtotal = 1250;
    const disc = Number(genDiscountAmt) || (genCoupon ? 100 : 0);
    const afterDisc = Math.max(0, subtotal - disc);
    const tax = genApplyGst === 'yes' ? Math.round(afterDisc * (charges.gstPct / 100)) : 0;
    const service = genApplySvc === 'yes' ? Math.round(afterDisc * (charges.servicePct / 100)) : 0;
    const total = afterDisc + tax + service;

    const newBill = {
      id: newBillId,
      orderId: genOrderId.trim() || 'DIN-1045',
      guest: genGuest.trim() || 'Walk-in Guest',
      channel: genChannel,
      status: 'Unpaid',
      subtotal,
      discount: disc,
      tax,
      service,
      total,
      time: nowTime,
      payment: '—',
    };

    setBills((prev) => [newBill, ...prev]);
    setSelectedBill(newBill);
    setIsGenerateModalOpen(false);

    // Reset form
    setGenOrderId('');
    setGenGuest('');
    setGenDiscountAmt('');
    setGenCoupon('');

    showToast(`✓ Invoice ${newBillId} created successfully (${money(total)})!`);
  };

  // Confirm Payment
  const handleConfirmPayment = () => {
    if (!selectedBill) return;
    if (selectedBill.status === 'Paid') return;

    setBills((prev) =>
      prev.map((b) =>
        b.id === selectedBill.id
          ? { ...b, status: 'Paid', payment: payMethod, total: billTotal, discount: discountVal }
          : b
      )
    );
    setSelectedBill((prev) =>
      prev
        ? { ...prev, status: 'Paid', payment: payMethod, total: billTotal, discount: discountVal }
        : prev
    );
    showToast(`✓ Payment of ${money(billTotal)} collected via ${payMethod}!`);
  };

  // Print Invoice
  const handlePrint = () => {
    showToast(`✓ Preparing print preview for ${selectedBill?.id}...`);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Email / SMS Send
  const handleSendEmailSms = (e) => {
    e.preventDefault();
    setIsEmailSmsModalOpen(false);
    showToast(`✓ Invoice ${selectedBill?.id} sent to ${sendEmail} & ${sendPhone}!`);
  };

  const handleSelectDenom = (amt) => {
    setCashReceived(String(amt));
  };

  // ── PAYMENT METHOD BODY (ONLY CASH, UPI, CARD) ──────────────────────
  const renderPaymentBody = () => {
    if (payMethod === 'Cash') {
      return (
        <div className="svc-pay-body">
          <div className="svc-pay-body-row">
            <div className="svc-pay-icon cash">
              <Banknote size={26} />
            </div>
            <div>
              <div className="svc-pay-body-label">Cash Payment</div>
              <div className="svc-pay-body-sub">Collect currency notes and return change</div>
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Total to collect</label>
              <input
                className="form-control"
                value={money(billTotal)}
                readOnly
                style={{ fontWeight: 800, background: '#f1f5f9' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cash received (₹)</label>
              <div className="svc-input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 1000"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  style={{ fontWeight: 750 }}
                />
                <span className="svc-input-addon">₹</span>
              </div>
            </div>
          </div>

          {/* Quick Denominations */}
          <div className="svc-denom-pills">
            <button
              type="button"
              className={`svc-denom-pill ${Number(cashReceived) === billTotal ? 'active' : ''}`}
              onClick={() => handleSelectDenom(billTotal)}
            >
              Exact ({money(billTotal)})
            </button>
            <button
              type="button"
              className={`svc-denom-pill ${cashReceived === '500' ? 'active' : ''}`}
              onClick={() => handleSelectDenom(500)}
            >
              ₹500
            </button>
            <button
              type="button"
              className={`svc-denom-pill ${cashReceived === '1000' ? 'active' : ''}`}
              onClick={() => handleSelectDenom(1000)}
            >
              ₹1,000
            </button>
            <button
              type="button"
              className={`svc-denom-pill ${cashReceived === '2000' ? 'active' : ''}`}
              onClick={() => handleSelectDenom(2000)}
            >
              ₹2,000
            </button>
          </div>

          {/* Change calculation */}
          {cashChange !== null && (
            <div className={`svc-change-row ${cashChange < 0 ? 'short' : ''}`}>
              {cashChange < 0 ? (
                <>
                  ⚠ Short by <strong>{money(Math.abs(cashChange))}</strong>
                </>
              ) : (
                <>
                  Change to return:{' '}
                  <strong style={{ color: '#059669', fontSize: 18, marginLeft: 'auto' }}>
                    {money(cashChange)}
                  </strong>
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    if (payMethod === 'UPI') {
      return (
        <div className="svc-pay-body">
          <div className="svc-pay-body-row">
            <div className="svc-pay-icon upi">
              <Smartphone size={26} />
            </div>
            <div>
              <div className="svc-pay-body-label">UPI Payment</div>
              <div className="svc-pay-body-sub">Scan QR with GPay, PhonePe, Paytm, BHIM</div>
            </div>
          </div>

          <div className="svc-upi-qr-wrap">
            <div className="svc-upi-qr">
              <QrCode size={70} color="#0f172a" style={{ opacity: 0.8 }} />
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Scan QR</div>
            </div>
            <div className="svc-upi-details">
              <div style={{ fontSize: 12.5, color: '#64748b' }}>Amount to collect</div>
              <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--primary)', letterSpacing: -0.5 }}>
                {money(billTotal)}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Store UPI ID</div>
              <div className="svc-upi-id-row">
                <code style={{ fontSize: 13, fontWeight: 750, background: '#ffffff', padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                  {UPI_ID}
                </code>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '4px 10px', fontSize: 11 }}
                  onClick={handleCopyUpi}
                >
                  {upiCopied ? <CheckCircle2 size={13} color="#059669" /> : <Copy size={13} />}
                  {upiCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">UPI Reference / UTR Number (Optional)</label>
            <input
              className="form-control"
              placeholder="12-digit UPI UTR / Bank reference"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (payMethod === 'Card') {
      return (
        <div className="svc-pay-body">
          <div className="svc-pay-body-row">
            <div className="svc-pay-icon card">
              <CreditCard size={26} />
            </div>
            <div>
              <div className="svc-pay-body-label">Card Payment (POS)</div>
              <div className="svc-pay-body-sub">Swipe, tap, or insert on the EDC machine</div>
            </div>
          </div>

          <div className="svc-card-steps">
            <div className="svc-card-step">
              <span className="svc-step-no">1</span> Swipe / tap customer's card on terminal
            </div>
            <div className="svc-card-step">
              <span className="svc-step-no">2</span> Customer verifies {money(billTotal)} & enters PIN
            </div>
            <div className="svc-card-step">
              <span className="svc-step-no">3</span> Confirm approval below once approved
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Card network</label>
              <select className="form-control" value={cardType} onChange={(e) => setCardType(e.target.value)}>
                <option>Visa</option>
                <option>Mastercard</option>
                <option>RuPay</option>
                <option>American Express</option>
                <option>Diners Club</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Approval / Auth Code</label>
              <input
                className="form-control"
                placeholder="e.g. 642819"
                value={cardRef}
                onChange={(e) => setCardRef(e.target.value)}
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header with Top Action Buttons */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Receipt size={22} color="var(--primary)" /> Billing
          </h1>
          <p className="page-desc">
            Generate bills, apply coupons & discounts, collect payments, and print invoices
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => showToast('✓ Bills exported to Excel / CSV')}
          >
            <Download size={15} /> Export
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsTaxesModalOpen(true)}
            title="Configure GST, Service Charge, and Defaults"
          >
            <Settings2 size={15} /> Taxes & Charges
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsGenerateModalOpen(true)}
          >
            <Plus size={16} /> Generate Bill
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <FileText size={20} />
          </div>
          <div>
            <div className="stat-label">Bills Today</div>
            <div className="stat-value">{stats.bills}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <div className="stat-label">Collected</div>
            <div className="stat-value">{money(stats.collected)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <div className="stat-label">Outstanding</div>
            <div className="stat-value">{money(stats.outstanding)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <Percent size={20} />
          </div>
          <div>
            <div className="stat-label">Refunds</div>
            <div className="stat-value">{money(stats.refunds)}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Bills List & Preview / Payment */}
      <div className="svc-section-grid">
        {/* Left: Bills List Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Bills History</h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>Select a bill to view invoice breakdown & collect payment</p>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: 16, gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Search</label>
              <div className="svc-input-with-icon">
                <Search size={16} className="svc-input-icon" />
                <input
                  className="form-control"
                  placeholder="Bill ID, order, guest…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Channel</label>
              <select className="form-control" value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
                <option value="All">All Channels</option>
                <option value="Dine-in">Dine-in</option>
                <option value="Takeaway">Takeaway</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill</th>
                  <th>Guest</th>
                  <th>Channel</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => {
                      setSelectedBill(b);
                      setAppliedCoupon(null);
                      setManualDiscount('');
                    }}
                    style={{
                      cursor: 'pointer',
                      background: selectedBill?.id === b.id ? 'var(--primary-light)' : undefined,
                    }}
                  >
                    <td>
                      <strong style={{ color: selectedBill?.id === b.id ? 'var(--primary)' : undefined }}>
                        {b.id}
                      </strong>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{b.orderId}</div>
                    </td>
                    <td>{b.guest}</td>
                    <td>{b.channel}</td>
                    <td><strong>{money(b.total)}</strong></td>
                    <td><span className={`badge ${statusBadge(b.status)}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Invoice Preview + Coupon Apply & Collect Payment */}
        <div>
          {/* Invoice Preview */}
          <div className="svc-bill-preview" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Invoice Details
                </div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{selectedBill?.id || '—'}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Order: {selectedBill?.orderId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{selectedBill?.channel}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedBill?.guest}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{selectedBill?.time}</div>
              </div>
            </div>

            {LINE_ITEMS.map((item) => (
              <div key={item.name} className="svc-bill-row">
                <span>{item.name} × {item.qty}</span>
                <strong>{money(item.amount)}</strong>
              </div>
            ))}

            <div className="svc-bill-row">
              <span>Subtotal</span>
              <strong>{money(previewSub)}</strong>
            </div>

            {discountVal > 0 && (
              <div className="svc-bill-row" style={{ color: '#34d399' }}>
                <span>
                  Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}
                </span>
                <strong style={{ color: '#34d399' }}>- {money(discountVal)}</strong>
              </div>
            )}

            <div className="svc-bill-row">
              <span>GST ({charges.gstPct}%)</span>
              <strong>{money(previewTax)}</strong>
            </div>
            <div className="svc-bill-row">
              <span>Service Charge ({charges.servicePct}%)</span>
              <strong>{money(previewSvc)}</strong>
            </div>
            <div className="svc-bill-row total">
              <span>Total Due</span>
              <strong>{money(billTotal)}</strong>
            </div>
          </div>

          {/* Collect Payment & Coupon Apply Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Collect Payment</h2>
                <p style={{ fontSize: 12.5, color: '#64748b' }}>
                  Bill Status: <span className={`badge ${statusBadge(selectedBill?.status || 'Unpaid')}`}>{selectedBill?.status || '—'}</span>
                </p>
              </div>
            </div>

            {/* ── COUPON CODE & DISCOUNT SECTION ──────────────────────── */}
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1.5px solid #e2e8f0', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 750, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={15} color="var(--primary)" /> Apply Coupon / Discount
              </div>

              <div className="svc-coupon-input-wrap">
                <input
                  className="form-control"
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  placeholder="Enter coupon code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={Boolean(appliedCoupon)}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ color: '#ef4444', borderColor: '#fecaca', whiteSpace: 'nowrap' }}
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleApplyCoupon()}
                  >
                    Apply
                  </button>
                )}
              </div>

              {/* Quick Coupon Suggestions */}
              {!appliedCoupon && (
                <div className="svc-coupon-pills">
                  {AVAILABLE_COUPONS.map((cp) => (
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

              {/* Optional Manual Manager Discount */}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Or Manager Discount (₹):</span>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  style={{ height: 32, maxWidth: 120, fontSize: 12 }}
                  placeholder="0"
                  value={manualDiscount}
                  onChange={(e) => setManualDiscount(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method Selector (Only Cash, UPI, Card) */}
            <div className="svc-pay-methods" style={{ marginBottom: 16 }}>
              {[
                { id: 'Cash', icon: <Banknote size={20} />, desc: 'Physical currency' },
                { id: 'UPI', icon: <Smartphone size={20} />, desc: 'QR code / App' },
                { id: 'Card', icon: <CreditCard size={20} />, desc: 'EDC terminal' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`svc-pay-chip ${payMethod === m.id ? 'active' : ''}`}
                  onClick={() => setPayMethod(m.id)}
                >
                  <div className="svc-pay-chip-icon">{m.icon}</div>
                  <div className="svc-pay-chip-title">{m.id}</div>
                  <div className="svc-pay-chip-desc">{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Payment method dynamic body */}
            {renderPaymentBody()}

            {/* Action buttons: Confirm, Print, Email / SMS */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={selectedBill?.status === 'Paid'}
                onClick={handleConfirmPayment}
              >
                <CheckCircle2 size={16} /> Confirm Payment ({money(billTotal)})
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handlePrint}
                title="Print Invoice Receipt"
              >
                <Printer size={15} /> Print
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsEmailSmsModalOpen(true)}
                title="Send via Email or SMS"
              >
                <Mail size={15} /> Email / SMS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 
        NOTE: "Generate Bill from Open Order" card has been removed as requested.
        New bills can be created anytime via the top "+ Generate Bill" button modal.
      */}

      {/* 
        NOTE: "Taxes & Charges Rules" card has been moved into the top "⚙️ Taxes & Charges" modal dialog.
      */}

      {/* ══════════════════════════════════════════════
          MODAL: GENERATE BILL (TOP BUTTON)
      ══════════════════════════════════════════════ */}
      {isGenerateModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsGenerateModalOpen(false)}>
          <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Receipt size={20} color="var(--primary)" /> Generate New Bill
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsGenerateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateBillSubmit}>
              <div className="svc-modal-body">
                <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Select Active Session / Order *</label>
                    <select
                      className="form-control"
                      value={genOrderId}
                      onChange={(e) => setGenOrderId(e.target.value)}
                      required
                    >
                      <option value="" disabled>Choose an order</option>
                      <option value="DIN-1042">DIN-1042 — Table T02 (Rahul S.)</option>
                      <option value="DIN-1040">DIN-1040 — Table T09 (James L.)</option>
                      <option value="DIN-1039">DIN-1039 — Table T12 (Sophie T.)</option>
                      <option value="TKW-2207">TKW-2207 — Takeaway (Rohan Mehta)</option>
                      <option value="Custom">Other / Walk-in Quick Bill</option>
                    </select>
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Channel</label>
                      <select
                        className="form-control"
                        value={genChannel}
                        onChange={(e) => setGenChannel(e.target.value)}
                      >
                        <option value="Dine-in">Dine-in</option>
                        <option value="Takeaway">Takeaway</option>
                        <option value="Delivery">Delivery</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Guest Name</label>
                      <div className="svc-input-with-icon">
                        <User size={15} className="svc-input-icon" />
                        <input
                          className="form-control"
                          placeholder="e.g. Rahul S."
                          value={genGuest}
                          onChange={(e) => setGenGuest(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Apply GST (5%)</label>
                      <select
                        className="form-control"
                        value={genApplyGst}
                        onChange={(e) => setGenApplyGst(e.target.value)}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Apply Service (5%)</label>
                      <select
                        className="form-control"
                        value={genApplySvc}
                        onChange={(e) => setGenApplySvc(e.target.value)}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Coupon Code</label>
                      <input
                        className="form-control"
                        placeholder="WELCOME10 / FLAT50"
                        value={genCoupon}
                        onChange={(e) => setGenCoupon(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Direct Discount (₹)</label>
                      <div className="svc-input-group">
                        <input
                          type="number"
                          min={0}
                          className="form-control"
                          placeholder="0"
                          value={genDiscountAmt}
                          onChange={(e) => setGenDiscountAmt(e.target.value)}
                        />
                        <span className="svc-input-addon">₹</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="svc-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsGenerateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> Generate & View Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: TAXES & CHARGES CONFIGURATION
      ══════════════════════════════════════════════ */}
      {isTaxesModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsTaxesModalOpen(false)}>
          <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Settings2 size={20} color="var(--primary)" /> Taxes & Charges Rules
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsTaxesModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="svc-modal-body">
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                Configure default tax rates, packaging charges, service charge, and invoice prefixes applied to customer bills.
              </p>

              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">GST / Tax Rate (%)</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={charges.gstPct}
                      onChange={(e) => updateCharge('gstPct', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Charge (%)</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={charges.servicePct}
                      onChange={(e) => updateCharge('servicePct', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Packing Fee (Takeaway)</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={charges.packingFee}
                      onChange={(e) => updateCharge('packingFee', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">₹</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Fee</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={charges.deliveryFee}
                      onChange={(e) => updateCharge('deliveryFee', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">₹</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Suggested Tip (%)</label>
                  <div className="svc-input-group">
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={charges.tipDefaultPct}
                      onChange={(e) => updateCharge('tipDefaultPct', Number(e.target.value))}
                    />
                    <span className="svc-input-addon">%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice Prefix</label>
                  <input
                    className="form-control"
                    value={charges.invoicePrefix}
                    onChange={(e) => updateCharge('invoicePrefix', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Round off total amounts</label>
                  <select
                    className="form-control"
                    value={charges.roundOff ? 'yes' : 'no'}
                    onChange={(e) => updateCharge('roundOff', e.target.value === 'yes')}
                  >
                    <option value="yes">Yes, round to nearest ₹</option>
                    <option value="no">No, exact decimals</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="svc-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsTaxesModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsTaxesModalOpen(false);
                  showToast('✓ Taxes & charge rules saved successfully!');
                }}
              >
                <CheckCircle2 size={16} /> Save Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: SEND INVOICE VIA EMAIL / SMS
      ══════════════════════════════════════════════ */}
      {isEmailSmsModalOpen && (
        <div className="svc-modal-overlay" onClick={() => setIsEmailSmsModalOpen(false)}>
          <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-header">
              <div className="svc-modal-title">
                <Mail size={20} color="var(--primary)" /> Send Digital Receipt
              </div>
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setIsEmailSmsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendEmailSms}>
              <div className="svc-modal-body">
                <div style={{ marginBottom: 16, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#475569', border: '1px solid #e2e8f0' }}>
                  Sending receipt for <strong>{selectedBill?.id}</strong> ({money(billTotal)})
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Customer Email</label>
                    <div className="svc-input-with-icon">
                      <Mail size={15} className="svc-input-icon" />
                      <input
                        type="email"
                        className="form-control"
                        placeholder="guest@example.com"
                        value={sendEmail}
                        onChange={(e) => setSendEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number (SMS & WhatsApp)</label>
                    <div className="svc-input-with-icon">
                      <Phone size={15} className="svc-input-icon" />
                      <input
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={sendPhone}
                        onChange={(e) => setSendPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="svc-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEmailSmsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} /> Send Invoice Now
                </button>
              </div>
            </form>
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
