import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tag, ArrowLeft, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { URLS } from '../../url';

export default function CreateCoupon() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage', // 'percentage' | 'amount'
    discount: '',
    minOrder: '',
    limit: '100',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: '2026-12-31',
    description: '',
    oncePerCustomer: false,
    status: 'active',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    return {
      'Content-Type': 'application/json',
      ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.code.trim()) {
      setErrorMsg('Please enter a coupon code.');
      return;
    }

    if (!formData.discount || Number(formData.discount) <= 0) {
      setErrorMsg('Please enter a valid discount value greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim() || formData.code.trim().toUpperCase(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type.toLowerCase(),
        discountType: formData.type.toLowerCase(),
        discount: Number(formData.discount),
        limit: Number(formData.limit || 100),
        fromDate: formData.fromDate || new Date().toISOString().split('T')[0],
        toDate: formData.toDate,
        description: formData.description.trim() || `${formData.discount}${formData.type === 'percentage' ? '%' : '₹'} off your order`,
        oncePerCustomer: Boolean(formData.oncePerCustomer),
        status: formData.status || 'active',
      };

      if (formData.minOrder) {
        payload.minOrder = Number(formData.minOrder);
      }

      const res = await fetch(URLS.CreateCoupon, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        navigate('/coupons', { state: { toastMessage: `✓ Coupon "${payload.code}" created successfully!` } });
      } else {
        setErrorMsg(result.message || 'Failed to create coupon. Please check inputs.');
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
      setErrorMsg('Network error while creating coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13.5,
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Coupon Name / Offer Title */}
            <div className="form-group">
              <label className="form-label">Coupon Name</label>
              <input
                className="form-input"
                placeholder="e.g. Welcome Offer / Festive Deal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Coupon Code */}
            <div className="form-group">
              <label className="form-label">Coupon Code (Uppercase) *</label>
              <input
                className="form-input"
                placeholder="e.g. WELCOME2026"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>

            {/* Discount Type */}
            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="amount">Flat Amount (₹)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="form-group">
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder={formData.type === 'percentage' ? 'e.g. 10 (for 10%)' : 'e.g. 50 (for ₹50)'}
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                required
              />
            </div>

            {/* Minimum Order Requirement */}
            {/* <div className="form-group">
              <label className="form-label">Minimum Order Requirement (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="e.g. 199.00"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
              />
            </div> */}

            {/* Total Redemptions Limit */}
            <div className="form-group">
              <label className="form-label">Max Total Redemptions Limit *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="100"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                required
              />
            </div>

            {/* From Date */}
            <div className="form-group">
              <label className="form-label">Valid From Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                required
              />
            </div>

            {/* To Date */}
            <div className="form-group">
              <label className="form-label">Valid Until Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                required
              />
            </div>

            {/* Once Per Customer */}
            <div className="form-group">
              <label className="form-label">One Time Per Customer?</label>
              <select
                className="form-select"
                value={formData.oncePerCustomer ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, oncePerCustomer: e.target.value === 'true' })}
              >
                <option value="false">No (Multiple Uses Allowed)</option>
                <option value="true">Yes (Once Per Customer)</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Coupon Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description / Offer Details</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. 10 percent off your entire food order"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="spin" /> Creating Coupon...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Coupon
                </>
              )}
            </button>
            <Link to="/coupons" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
