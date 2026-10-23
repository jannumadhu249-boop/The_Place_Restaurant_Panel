import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Clock, ArrowLeft, Save } from 'lucide-react';

export default function EditHappyHour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: 'Evening Rush Hour',
    discount: '20% OFF',
    days: 'Mon, Tue, Wed, Thu, Fri',
    startTime: '17:00',
    endTime: '19:30',
    active: true
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Happy Hour updated successfully!`);
    navigate('/happy-hours');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Clock size={22} color="var(--primary)" /> Edit Happy Hour Window #{id || 1}</h1>
          <p className="page-desc">Modify deal timing, active days, and discount benefit</p>
        </div>
        <Link to="/happy-hours" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Happy Hours
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Happy Hour Window Details</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Deal Title</label>
              <input
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount Benefit</label>
              <input
                className="form-input"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Applicable Weekdays</label>
              <input
                className="form-input"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Window Start Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Window End Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
              >
                <option value="true">Active (Applies Automatically)</option>
                <option value="false">Inactive / Paused</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Update Happy Hour
            </button>
            <Link to="/happy-hours" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
