import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  DollarSign,
  DownloadCloud,
  Search,
  ArrowDownLeft,
  Clock3,
  CheckCircle2
} from 'lucide-react';
import './Wallet.css';

export default function MyWallet() {
  const [balance] = useState(4328.5);
  const [pending] = useState(680.0);
  const [withdrawn] = useState(38240.0);

  const [transactions] = useState([
    { id: 'TXN-9042', desc: 'Order Payout #ORD-8921', date: 'Oct 22, 2026', amount: 31.05, type: 'credit', status: 'Completed' },
    { id: 'TXN-9041', desc: 'Weekly Bank Settlement', date: 'Oct 21, 2026', amount: 1850.0, type: 'debit', status: 'Completed' },
    { id: 'TXN-9040', desc: 'Order Payout #ORD-8920', date: 'Oct 21, 2026', amount: 12.78, type: 'credit', status: 'Completed' },
    { id: 'TXN-9039', desc: 'Platform Commission Fee', date: 'Oct 20, 2026', amount: 45.0, type: 'debit', status: 'Completed' },
    { id: 'TXN-9038', desc: 'Order Payout #ORD-8919', date: 'Oct 20, 2026', amount: 20.4, type: 'credit', status: 'Completed' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.date.toLowerCase().includes(search.toLowerCase())
  );

  const money = (n) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'INR' });

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Wallet size={22} color="var(--primary)" /> My Wallet
          </h1>
          <p className="page-desc">Balances, settlements, and payout history for your restaurant</p>
        </div>
      </div>

      <div className="wallet-hero">
        <div className="wallet-balance-card">
          <div>
            <div className="wallet-eyebrow">Available Balance</div>
            <div className="wallet-balance-amount">{money(balance)}</div>
            <div className="wallet-balance-sub">Ready for withdrawal to your verified bank account</div>
          </div>
          <div className="wallet-hero-actions">
            <Link to="/my-wallet/request-payout" className="wallet-hero-btn primary">
              <ArrowUpRight size={16} /> Request Payout
            </Link>
            <button type="button" className="wallet-hero-btn ghost">
              <DownloadCloud size={16} /> Download Statement
            </button>
          </div>
        </div>

        <div className="wallet-side-stack">
          <div className="wallet-metric">
            <div className="wallet-metric-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
              <Clock3 size={22} />
            </div>
            <div>
              <div className="wallet-metric-label">Pending Clearance</div>
              <div className="wallet-metric-value">{money(pending)}</div>
            </div>
          </div>
          <div className="wallet-metric">
            <div className="wallet-metric-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <div className="wallet-metric-label">Lifetime Withdrawn</div>
              <div className="wallet-metric-value">{money(withdrawn)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Transaction History</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Order deposits, fees, and bank settlements</p>
          </div>
        </div>

        <div style={{ marginBottom: 18, maxWidth: 360, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search reference or description…"
            className="form-input"
            style={{ paddingLeft: 38 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="wallet-txn-meta">
                      <div
                        className="wallet-txn-row-icon"
                        style={{
                          background: t.type === 'credit' ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: t.type === 'credit' ? 'var(--success)' : 'var(--danger)'
                        }}
                      >
                        {t.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{t.desc}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.date}</td>
                  <td>
                    <strong style={{ color: t.type === 'credit' ? 'var(--success)' : 'var(--danger)', fontSize: 14 }}>
                      {t.type === 'credit' ? '+' : '-'}
                      {money(t.amount)}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                      {t.type === 'credit' ? 'Credited' : 'Withdrawn'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
