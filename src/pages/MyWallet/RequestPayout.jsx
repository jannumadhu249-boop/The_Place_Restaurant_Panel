import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowLeft,
  Building2,
  CreditCard,
  Wallet,
  ShieldCheck,
  Info,
  CheckCircle2,
  Clock3
} from 'lucide-react';
import './Wallet.css';

const METHODS = [
  {
    id: 'bank',
    label: 'Direct Bank Transfer',
    desc: 'ACH / NEFT · usually 1–2 business days',
    icon: Building2
  },
  // {
  //   id: 'stripe',
  //   label: 'Instant Payout',
  //   desc: 'Stripe Connect · same-day with small fee',
  //   icon: CreditCard
  // },
  // {
  //   id: 'paypal',
  //   label: 'PayPal Business',
  //   desc: 'Credits your linked PayPal wallet',
  //   icon: Wallet
  // }
];

export default function RequestPayout() {
  const navigate = useNavigate();
  const availableBalance = 4328.5;

  const [payoutAmount, setPayoutAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [accountInfo, setAccountInfo] = useState('Chase Bank **** 4819 (Routing: 021000021)');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const amountNum = parseFloat(payoutAmount) || 0;
  const fee = method === 'stripe' ? Math.max(amountNum * 0.015, amountNum > 0 ? 0.5 : 0) : 0;
  const net = Math.max(amountNum - fee, 0);

  const quickAmounts = useMemo(() => {
    const caps = [100, 500, 1000, Math.floor(availableBalance)];
    return [...new Set(caps.filter((n) => n > 0 && n <= availableBalance))];
  }, [availableBalance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Enter a valid payout amount.');
      return;
    }
    if (amountNum < 20) {
      setError('Minimum payout amount is $20.00.');
      return;
    }
    if (amountNum > availableBalance) {
      setError(`Amount cannot exceed available balance of $${availableBalance.toFixed(2)}.`);
      return;
    }
    if (!accountInfo.trim()) {
      setError('Receiving account details are required.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate('/my-wallet');
    }, 700);
  };

  const money = (n) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'INR' });

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ArrowUpRight size={22} color="var(--primary)" /> Request Payout
          </h1>
          <p className="page-desc">Move available earnings to your preferred settlement account</p>
        </div>
        <Link to="/my-wallet" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Wallet
        </Link>
      </div>

      <div className="payout-shell">
        <form className="payout-form-card" onSubmit={handleSubmit}>
          <div style={{ marginBottom: 22 }}>
            <div className="wallet-eyebrow" style={{ color: 'var(--text-muted)' }}>Available to withdraw</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, marginTop: 4 }}>
              {money(availableBalance)}
            </div>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                padding: '12px 14px',
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Withdrawal Amount</label>
            <div className="payout-amount-wrap">
              <span className="payout-amount-prefix">₹</span>
              <input
                type="number"
                step="0.01"
                min="20"
                max={availableBalance}
                placeholder="0.00"
                className="form-input payout-amount-input"
                value={payoutAmount}
                onChange={(e) => {
                  setPayoutAmount(e.target.value);
                  setError('');
                }}
                required
              />
            </div>
            <div className="payout-quick-amounts">
              {quickAmounts.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`payout-chip ${amountNum === n ? 'active' : ''}`}
                  onClick={() => {
                    setPayoutAmount(String(n));
                    setError('');
                  }}
                >
                  {n === Math.floor(availableBalance) ? 'Max' : money(n)}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>
              Minimum ₹20.00 · Maximum {money(availableBalance)}
            </span>
          </div>

          <div className="form-group" style={{ marginTop: 8 }}>
            <label className="form-label">Settlement Method</label>
            <div className="payout-method-grid">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`payout-method ${method === m.id ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="payout-method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    style={{ display: 'none' }}
                  />
                  <div className="payout-method-icon">
                    <m.icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="payout-method-title">{m.label}</div>
                    <div className="payout-method-desc">{m.desc}</div>
                  </div>
                  {method === m.id && <CheckCircle2 size={18} color="var(--primary)" />}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 8 }}>
            <label className="form-label">Receiving Account</label>
            <input
              className="form-input"
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value)}
              placeholder="Bank name, account last 4, routing…"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reference Note <span style={{ fontWeight: 500, color: 'var(--text-light)' }}>(optional)</span></label>
            <input
              className="form-input"
              placeholder="e.g. October Week 4 food sales payout"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <ArrowUpRight size={16} />
              {submitting ? 'Submitting…' : 'Confirm Payout'}
            </button>
            <Link to="/my-wallet" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>

        <aside className="payout-aside">
          <div className="payout-aside-card">
            <div className="payout-aside-title">
              <Info size={16} color="var(--primary)" /> Payout Summary
            </div>
            <div className="payout-summary-row">
              <span>Requested</span>
              <strong>{money(amountNum || 0)}</strong>
            </div>
            <div className="payout-summary-row">
              <span>Processing fee</span>
              <strong>{money(fee)}</strong>
            </div>
            <div className="payout-summary-row total">
              <span>You receive</span>
              <strong>{money(net)}</strong>
            </div>
          </div>

          <div className="payout-aside-card">
            <div className="payout-aside-title">
              <ShieldCheck size={16} color="var(--success)" /> Account Status
            </div>
            <ul className="payout-aside-list">
              <li><CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /> Bank account verified</li>
              <li><CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /> KYC documents approved</li>
              <li><Clock3 size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} /> Standard transfers clear in 1–2 days</li>
            </ul>
          </div>

          <div className="payout-aside-card">
            <div className="payout-aside-title">
              <Info size={16} color="var(--info)" /> Good to know
            </div>
            <ul className="payout-aside-list">
              <li>Payouts below $20 are not supported.</li>
              <li>Instant payouts may include a small processing fee.</li>
              <li>You will see the debit in My Wallet once submitted.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
