import React, { useMemo, useState } from 'react';
import { Receipt, Download, RefreshCw, Filter } from 'lucide-react';
import './Reports.css';

const SAMPLE_TAX = [
  { period: '2026-10-27', orders: 42, taxableSales: 1280.4, taxRate: 8.5, taxCollected: 108.83, taxRemitted: 108.83 },
  { period: '2026-10-28', orders: 38, taxableSales: 1142.6, taxRate: 8.5, taxCollected: 97.12, taxRemitted: 97.12 },
  { period: '2026-10-29', orders: 51, taxableSales: 1568.9, taxRate: 8.5, taxCollected: 133.36, taxRemitted: 120.0 },
  { period: '2026-10-30', orders: 47, taxableSales: 1422.3, taxRate: 8.5, taxCollected: 120.9, taxRemitted: 0 },
  { period: '2026-10-31', orders: 29, taxableSales: 892.1, taxRate: 8.5, taxCollected: 75.83, taxRemitted: 0 },
];

export default function TaxReport() {
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-31');
  const [remittance, setRemittance] = useState('All');

  const filtered = useMemo(() => {
    return SAMPLE_TAX.filter((row) => {
      const inRange = row.period >= fromDate && row.period <= toDate;
      const remitted = row.taxRemitted >= row.taxCollected;
      const remOk =
        remittance === 'All' ||
        (remittance === 'Remitted' && remitted) ||
        (remittance === 'Pending' && !remitted);
      return inRange && remOk;
    });
  }, [fromDate, toDate, remittance]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        sales: acc.sales + r.taxableSales,
        collected: acc.collected + r.taxCollected,
        remitted: acc.remitted + r.taxRemitted,
        orders: acc.orders + r.orders
      }),
      { sales: 0, collected: 0, remitted: 0, orders: 0 }
    );
  }, [filtered]);

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Receipt size={22} color="var(--primary)" /> Tax Report
          </h1>
          <p className="page-desc">Track taxable sales, collected tax, and remittance status by day</p>
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
          <div className="report-summary-label">Taxable Sales</div>
          <div className="report-summary-value">₹ {totals.sales.toFixed(2)}</div>
          <div className="report-summary-hint">{totals.orders} orders</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Tax Collected</div>
          <div className="report-summary-value">₹ {totals.collected.toFixed(2)}</div>
          <div className="report-summary-hint">From customers</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Tax Remitted</div>
          <div className="report-summary-value" style={{ color: 'var(--success)' }}>₹ {totals.remitted.toFixed(2)}</div>
          <div className="report-summary-hint">Already filed</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Pending Remittance</div>
          <div className="report-summary-value" style={{ color: 'var(--warning)' }}>
            ₹ {(totals.collected - totals.remitted).toFixed(2)}
          </div>
          <div className="report-summary-hint">Still due</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Daily Tax Ledger</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sales tax breakdown for compliance reporting</p>
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
            <label className="form-label">Remittance</label>
            <select className="form-select" value={remittance} onChange={(e) => setRemittance(e.target.value)}>
              <option>All</option>
              <option>Remitted</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Taxable Sales</th>
                <th>Tax Rate</th>
                <th>Tax Collected</th>
                <th>Tax Remitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                    <Filter size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    No tax rows match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const done = r.taxRemitted >= r.taxCollected;
                  return (
                    <tr key={r.period}>
                      <td><strong>{r.period}</strong></td>
                      <td>{r.orders}</td>
                      <td>₹ {r.taxableSales.toFixed(2)}</td>
                      <td>{r.taxRate}%</td>
                      <td>₹ {r.taxCollected.toFixed(2)}</td>
                      <td>₹ {r.taxRemitted.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${done ? 'badge-success' : 'badge-warning'}`}>
                          {done ? 'Remitted' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
