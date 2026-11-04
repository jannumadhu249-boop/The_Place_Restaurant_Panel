import React, { useMemo, useState } from 'react';
import {
  FileBarChart,
  Download,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import './Reports.css';

const SAMPLE_ORDERS = [
  { id: 'ORD-8924', customer: 'Sophie Taylor', items: 6, type: 'Delivery', status: 'Completed', amount: 48.5, date: '2026-10-30' },
  { id: 'ORD-8923', customer: 'Rahul Sharma', items: 3, type: 'Takeaway', status: 'Completed', amount: 21.2, date: '2026-10-30' },
  { id: 'ORD-8922', customer: 'David Miller', items: 2, type: 'Delivery', status: 'Cancelled', amount: 32.0, date: '2026-10-29' },
  { id: 'ORD-8921', customer: 'Emma Watson', items: 4, type: 'Delivery', status: 'Completed', amount: 36.8, date: '2026-10-29' },
  { id: 'ORD-8920', customer: 'James Lee', items: 5, type: 'Dine-in', status: 'Completed', amount: 54.1, date: '2026-10-28' },
  { id: 'ORD-8919', customer: 'Priya Patel', items: 2, type: 'Takeaway', status: 'Refunded', amount: 18.4, date: '2026-10-28' },
  { id: 'ORD-8918', customer: 'Chris Evans', items: 7, type: 'Delivery', status: 'Completed', amount: 72.9, date: '2026-10-27' },
];

export default function OrderReport() {
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-31');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return SAMPLE_ORDERS.filter((o) => {
      const inRange = o.date >= fromDate && o.date <= toDate;
      const statusOk = status === 'All' || o.status === status;
      const typeOk = type === 'All' || o.type === type;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q);
      return inRange && statusOk && typeOk && searchOk;
    });
  }, [fromDate, toDate, status, type, search]);

  const totals = useMemo(() => {
    const completed = filtered.filter((o) => o.status === 'Completed');
    const revenue = completed.reduce((s, o) => s + o.amount, 0);
    return {
      count: filtered.length,
      completed: completed.length,
      cancelled: filtered.filter((o) => o.status === 'Cancelled' || o.status === 'Refunded').length,
      revenue
    };
  }, [filtered]);

  const statusBadge = (s) => {
    if (s === 'Completed') return 'badge-success';
    if (s === 'Cancelled' || s === 'Refunded') return 'badge-danger';
    return 'badge-warning';
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileBarChart size={22} color="var(--primary)" /> Order Report
          </h1>
          <p className="page-desc">Review order volume, fulfillment status, and revenue for a selected period</p>
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
          <div className="report-summary-label">Total Orders</div>
          <div className="report-summary-value">{totals.count}</div>
          <div className="report-summary-hint">In selected range</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Completed</div>
          <div className="report-summary-value" style={{ color: 'var(--success)' }}>{totals.completed}</div>
          <div className="report-summary-hint">Successfully fulfilled</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Cancelled / Refunded</div>
          <div className="report-summary-value" style={{ color: 'var(--danger)' }}>{totals.cancelled}</div>
          <div className="report-summary-hint">Lost or reversed</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Gross Revenue</div>
          <div className="report-summary-value">₹ {totals.revenue.toFixed(2)}</div>
          <div className="report-summary-hint">From completed orders</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Order Details</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Filter by date, status, and channel</p>
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
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              <option>Completed</option>
              <option>Cancelled</option>
              <option>Refunded</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Order Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option>All</option>
              <option>Delivery</option>
              <option>Takeaway</option>
              <option>Dine-in</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Order ID or customer…"
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
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                    <Filter size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.id}</strong></td>
                    <td>{o.customer}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{o.date}</td>
                    <td>{o.items}</td>
                    <td>{o.type}</td>
                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td><strong>₹ {o.amount.toFixed(2)}</strong></td>
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
