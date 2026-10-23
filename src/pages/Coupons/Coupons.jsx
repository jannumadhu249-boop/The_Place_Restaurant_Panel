import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Plus, Trash2, Edit2, Search } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'WELCOME50', type: 'Percentage', discount: '50', minOrder: '25', maxDiscount: '15', used: 142, limit: 500, validTill: '2026-12-31', active: true },
    { id: 2, code: 'TASTYFOOD', type: 'Flat Amount', discount: '5', minOrder: '20', maxDiscount: '5', used: 88, limit: 200, validTill: '2026-11-15', active: true },
    { id: 3, code: 'WEEKENDTREAT', type: 'Percentage', discount: '15', minOrder: '30', maxDiscount: '10', used: 210, limit: 300, validTill: '2026-10-30', active: false },
    { id: 4, code: 'FESTIVE30', type: 'Percentage', discount: '30', minOrder: '40', maxDiscount: '20', used: 64, limit: 250, validTill: '2026-11-20', active: true },
  ]);

  const [search, setSearch] = useState('');

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const deleteCoupon = (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Tag size={22} color="var(--primary)" /> Coupons & Promo Codes</h1>
          <p className="page-desc">Manage discount vouchers, minimum cart thresholds, and customer savings codes</p>
        </div>
        <Link to="/coupons/create" className="btn btn-primary">
          <Plus size={16} /> Create Coupon
        </Link>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by promo code or discount type..."
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
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage / Limit</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: '4px 10px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px dashed var(--primary-border)',
                      borderRadius: 6
                    }}>
                      {c.code}
                    </span>
                  </td>
                  <td>
                    <strong>{c.type === 'Percentage' ? `${c.discount}% OFF` : `$${c.discount} OFF`}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.type}</div>
                  </td>
                  <td>${c.minOrder}</td>
                  <td>
                    <span>{c.used} / {c.limit}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.validTill}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(c.id)}
                      className={`badge ${c.active ? 'badge-success' : 'badge-muted'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {c.active ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/coupons/edit/${c.id}`} className="action-btn" title="Edit Coupon">
                        <Edit2 size={14} />
                      </Link>
                      <button className="action-btn delete" title="Delete Coupon" onClick={() => deleteCoupon(c.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
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
