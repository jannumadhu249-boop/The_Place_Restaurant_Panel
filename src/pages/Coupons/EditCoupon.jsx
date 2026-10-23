import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Tag, ArrowLeft, Save } from 'lucide-react';

export default function EditCoupon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: 'WELCOME50',
    type: 'Percentage',
    discount: '50',
    minOrder: '25',
    maxDiscount: '15',
    limit: '500',
    validTill: '2026-12-31',
    active: true
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Coupon "${formData.code}" updated successfully!`);
    navigate('/coupons');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Tag size={22} color="var(--primary)" /> Edit Promo Coupon #{id || 1}</h1>
          <p className="page-desc">Modify coupon restrictions, discount value, and validity period</p>
        </div>
        <Link to="/coupons" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Coupons
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Coupon Configuration</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Coupon Code</label>
              <input
                className="form-input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Percentage">Percentage Discount (%)</option>
                <option value="Flat Amount">Flat Amount ($)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Discount Value</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Order Requirement ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Redemptions Limit</label>
              <input
                type="number"
                className="form-input"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valid Until Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.validTill}
                onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Coupon Status</label>
              <select
                className="form-select"
                value={formData.active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
              >
                <option value="true">Active (Usable by Customers)</option>
                <option value="false">Inactive / Paused</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Update Coupon
            </button>
            <Link to="/coupons" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
