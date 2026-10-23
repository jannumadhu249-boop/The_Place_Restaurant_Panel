import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Megaphone, ArrowLeft, Save } from 'lucide-react';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    budget: '150',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-11-30',
    targetAudience: 'Radius 8km Nearby',
    description: '',
    status: 'Upcoming'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Campaign "${formData.title}" launched successfully!`);
    navigate('/campaigns');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Megaphone size={22} color="var(--primary)" /> Launch Marketing Campaign</h1>
          <p className="page-desc">Create targeted app banners and seasonal promotions to attract more orders</p>
        </div>
        <Link to="/campaigns" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Campaign Strategy & Budget</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Campaign Title / Theme</label>
              <input
                className="form-input"
                placeholder="e.g. Winter Warmers Weekend Feast"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Promotional Budget ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="150.00"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience Radius</label>
              <input
                className="form-input"
                placeholder="e.g. 5km Local Area"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campaign Start Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campaign End Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Upcoming">Upcoming (Scheduled)</option>
                <option value="Running">Running Now</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Campaign Objective / Terms</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Outline festival goals, free delivery terms, or featured signature combo details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Launch Campaign
            </button>
            <Link to="/campaigns" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
