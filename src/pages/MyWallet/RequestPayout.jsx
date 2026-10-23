import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, DollarSign, Building2, CreditCard, CheckCircle } from 'lucide-react';

export default function RequestPayout() {
  const navigate = useNavigate();
  const availableBalance = 4328.50;

  const [payoutAmount, setPayoutAmount] = useState('');
  const [method, setMethod] = useState('Direct Bank Transfer');
  const [accountInfo, setAccountInfo] = useState('Chase Bank **** 4819 (Routing: 021000021)');
  const [notes, setNotes] = useState('Weekly restaurant revenue settlement');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    if (amountNum > availableBalance) {
      alert(`Withdrawal amount cannot exceed available balance of $${availableBalance.toFixed(2)}.`);
      return;
    }

    alert(`Payout request for $${amountNum.toFixed(2)} via ${method} submitted successfully!`);
    navigate('/my-wallet');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><ArrowUpRight size={22} color="var(--primary)" /> Request Revenue Payout</h1>
          <p className="page-desc">Withdraw your restaurant earnings directly to your verified commercial bank account</p>
        </div>
        <Link to="/my-wallet" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to My Wallet
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        {/* Balance Preview Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0c111d 0%, #161f30 100%)',
          color: '#fff',
          padding: '24px 28px',
          borderRadius: 14,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>
              Available Balance for Immediate Withdrawal
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4, color: '#fff' }}>
              ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-success" style={{ fontSize: 12, padding: '6px 12px' }}>
              ✓ Account Verified
            </span>
          </div>
        </div>

        <h2 className="card-title" style={{ marginBottom: 20 }}>Payout Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Withdrawal Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="20"
                max={availableBalance}
                placeholder="e.g. 1000.00"
                className="form-input"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                required
              />
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Minimum payout: $20.00 • Maximum: ${availableBalance.toFixed(2)}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Settlement Channel Method</label>
              <select
                className="form-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Direct Bank Transfer">Direct Bank Transfer (ACH / NEFT)</option>
                <option value="Stripe Connect Express">Stripe Connect Instant Payout</option>
                <option value="PayPal Business">PayPal Business Wallet</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Receiving Account / Beneficiary Details</label>
              <input
                className="form-input"
                value={accountInfo}
                onChange={(e) => setAccountInfo(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Transfer Reference / Internal Accounting Note</label>
              <input
                className="form-input"
                placeholder="e.g. October Week 4 food sales payout"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <ArrowUpRight size={16} /> Confirm & Request Payout
            </button>
            <Link to="/my-wallet" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
