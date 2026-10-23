import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, DollarSign, DownloadCloud, Search, ArrowDownLeft, Calendar } from 'lucide-react';

export default function MyWallet() {
  const [balance, setBalance] = useState(4328.50);
  const [pending, setPending] = useState(680.00);
  const [withdrawn, setWithdrawn] = useState(38240.00);
  
  const [transactions, setTransactions] = useState([
    { id: 'TXN-9042', desc: 'Order Payout #ORD-8921', date: 'Oct 22, 2026', amount: '+$31.05', type: 'credit', status: 'Completed' },
    { id: 'TXN-9041', desc: 'Weekly Bank Settlement', date: 'Oct 21, 2026', amount: '-$1,850.00', type: 'debit', status: 'Completed' },
    { id: 'TXN-9040', desc: 'Order Payout #ORD-8920', date: 'Oct 21, 2026', amount: '+$12.78', type: 'credit', status: 'Completed' },
    { id: 'TXN-9039', desc: 'Platform Commission Fee', date: 'Oct 20, 2026', amount: '-$45.00', type: 'debit', status: 'Completed' },
    { id: 'TXN-9038', desc: 'Order Payout #ORD-8919', date: 'Oct 20, 2026', amount: '+$20.40', type: 'credit', status: 'Completed' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase()) ||
    t.date.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Wallet size={22} color="var(--primary)" /> My Wallet & Earnings</h1>
          <p className="page-desc">Track restaurant revenue balances, payouts, and automated banking settlements</p>
        </div>
        <Link to="/my-wallet/request-payout" className="btn btn-primary">
          <ArrowUpRight size={16} /> Request Payout
        </Link>
      </div>

      {/* Balance Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-label">Available for Withdrawal</div>
            <div className="stat-value">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <Wallet size={24} />
          </div>
          <div>
            <div className="stat-label">Pending Clearance</div>
            <div className="stat-value">${pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
            <DownloadCloud size={24} />
          </div>
          <div>
            <div className="stat-label">Total Lifetime Withdrawn</div>
            <div className="stat-value">${withdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Transaction & Settlement History</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Detailed ledger of food order deposits and withdrawal payouts</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search reference ID or description..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Transaction Description</th>
                <th>Date / Time</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.id}</strong></td>
                  <td>{t.desc}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.date}</td>
                  <td>
                    <strong style={{ color: t.type === 'credit' ? 'var(--success)' : 'var(--danger)', fontSize: 14 }}>
                      {t.amount}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                      {t.type === 'credit' ? 'Credited' : 'Withdrawn'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success">✓ {t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
