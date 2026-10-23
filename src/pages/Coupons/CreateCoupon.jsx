import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tag, ArrowLeft, Save } from 'lucide-react';

export default function CreateCoupon() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    type: 'Percentage',
    discount: '',
    minOrder: '',
    maxDiscount: '',
    limit: '200',
    validTill: '2026-12-31',
    active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Coupon "${formData.code}" created successfully!`);
    navigate('/coupons');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Tag size={22} color="var(--primary)" /> Create Promo Coupon</h1>
          <p className="page-desc">Add a new discount code or promotional voucher for your restaurant customers</p>
        </div>
        <Link to="/coupons" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Coupons
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Coupon Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Coupon Code (Uppercase)</label>
              <input
                className="form-input"
                placeholder="e.g. FESTIVE30"
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
                placeholder={formData.type === 'Percentage' ? '25' : '5.00'}
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
                placeholder="20.00"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Total Redemptions</label>
              <input
                type="number"
                className="form-input"
                placeholder="500"
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
              <Save size={16} /> Save Coupon
            </button>
            <Link to="/coupons" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
