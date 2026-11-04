import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Download, RefreshCw, Search, Filter } from 'lucide-react';
import './Reports.css';

const SAMPLE_TXNS = [
  { id: 'TXN-9042', ref: 'ORD-8921', type: 'Credit', channel: 'Card', amount: 31.05, fee: 0.93, net: 30.12, date: '2026-10-22', status: 'Settled' },
  { id: 'TXN-9041', ref: 'PAYOUT-118', type: 'Debit', channel: 'Bank', amount: 1850.0, fee: 0, net: -1850.0, date: '2026-10-21', status: 'Settled' },
  { id: 'TXN-9040', ref: 'ORD-8920', type: 'Credit', channel: 'UPI', amount: 12.78, fee: 0.25, net: 12.53, date: '2026-10-21', status: 'Settled' },
  { id: 'TXN-9039', ref: 'FEE-COMM', type: 'Debit', channel: 'Platform', amount: 45.0, fee: 0, net: -45.0, date: '2026-10-20', status: 'Settled' },
  { id: 'TXN-9038', ref: 'ORD-8919', type: 'Credit', channel: 'Cash', amount: 20.4, fee: 0, net: 20.4, date: '2026-10-20', status: 'Settled' },
  { id: 'TXN-9037', ref: 'ORD-8918', type: 'Credit', channel: 'Card', amount: 72.9, fee: 2.18, net: 70.72, date: '2026-10-19', status: 'Pending' },
  { id: 'TXN-9036', ref: 'REF-8915', type: 'Debit', channel: 'Card', amount: 18.4, fee: 0, net: -18.4, date: '2026-10-18', status: 'Settled' },
];

export default function TransactionReport() {
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-31');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return SAMPLE_TXNS.filter((t) => {
      const inRange = t.date >= fromDate && t.date <= toDate;
      const typeOk = type === 'All' || t.type === type;
      const statusOk = status === 'All' || t.status === status;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.ref.toLowerCase().includes(q) ||
        t.channel.toLowerCase().includes(q);
      return inRange && typeOk && statusOk && searchOk;
    });
  }, [fromDate, toDate, type, status, search]);

  const totals = useMemo(() => {
    const credits = filtered.filter((t) => t.type === 'Credit').reduce((s, t) => s + t.amount, 0);
    const debits = filtered.filter((t) => t.type === 'Debit').reduce((s, t) => s + t.amount, 0);
    const fees = filtered.reduce((s, t) => s + t.fee, 0);
    const net = filtered.reduce((s, t) => s + t.net, 0);
    return { credits, debits, fees, net, count: filtered.length };
  }, [filtered]);

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ArrowLeftRight size={22} color="var(--primary)" /> Transaction Report
          </h1>
          <p className="page-desc">Payment credits, payouts, fees, and settlement status across channels</p>
        </div>
        <div className="report-actions">
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button type="button" className="btn btn-primary">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="report-summary">
        <div className="report-summary-card">
          <div className="report-summary-label">Transactions</div>
          <div className="report-summary-value">{totals.count}</div>
          <div className="report-summary-hint">In selected range</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Credits In</div>
          <div className="report-summary-value" style={{ color: 'var(--success)' }}>₹ {totals.credits.toFixed(2)}</div>
          <div className="report-summary-hint">Order payments</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Debits Out</div>
          <div className="report-summary-value" style={{ color: 'var(--danger)' }}>₹ {totals.debits.toFixed(2)}</div>
          <div className="report-summary-hint">Payouts & refunds</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Net Movement</div>
          <div className="report-summary-value">₹ {totals.net.toFixed(2)}</div>
          <div className="report-summary-hint">Fees: ₹ {totals.fees.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Transaction Ledger</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Filter by type, status, and reference</p>
          </div>
        </div>

        <div className="report-filters">
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option>All</option>
              <option>Credit</option>
              <option>Debit</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              <option>Settled</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Txn ID, ref, channel…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Channel</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Net</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                    <Filter size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.id}</strong></td>
                    <td>{t.ref}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.date}</td>
                    <td>{t.channel}</td>
                    <td>
                      <span className={`badge ${t.type === 'Credit' ? 'badge-success' : 'badge-danger'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>₹ {t.amount.toFixed(2)}</td>
                    <td>₹ {t.fee.toFixed(2)}</td>
                    <td>
                      <strong style={{ color: t.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {t.net >= 0 ? '+' : ''} ₹ {t.net.toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'Settled' ? 'badge-success' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
