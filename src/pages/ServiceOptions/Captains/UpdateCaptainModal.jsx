import React, { useState, useEffect } from 'react';
import { Edit2, X, CheckCircle2 } from 'lucide-react';

const ROLES = ['Floor Captain', 'Senior Server', 'Table Server', 'Trainee'];
const SECTIONS = ['Main Hall', 'Patio', 'Private', 'Bar', 'All Sections'];
const SHIFTS = [
  'Lunch (11:00 AM - 4:30 PM)',
  'Dinner (5:00 PM - 11:30 PM)',
  'Full Day (11:00 AM - 10:00 PM)',
];

export default function UpdateCaptainModal({ isOpen, onClose, captain, onSaveCaptain }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Floor Captain');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [section, setSection] = useState('Main Hall');
  const [shift, setShift] = useState(SHIFTS[0]);
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (captain) {
      setName(captain.name || '');
      setRole(captain.role || 'Floor Captain');
      setPhone(captain.phone || '');
      setEmail(captain.email || '');
      setSection(captain.section || 'Main Hall');
      setShift(captain.shift || SHIFTS[0]);
      setStatus(captain.status || 'Active');
    }
  }, [captain]);

  if (!isOpen || !captain) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveCaptain({
      ...captain,
      name: name.trim(),
      role,
      phone: phone.trim(),
      email: email.trim(),
      section,
      shift,
      status,
    });
    onClose();
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <Edit2 size={18} color="var(--primary)" /> Edit Staff — {captain.name}
          </div>
          <button type="button" className="svc-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Role & Section */}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Section</label>
                  <select className="form-control" value={section} onChange={(e) => setSection(e.target.value)}>
                    {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    placeholder="+91 98xxx 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="staff@theplace.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Shift & Status */}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Shift</label>
                  <select className="form-control" value={shift} onChange={(e) => setShift(e.target.value)}>
                    {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duty Status</label>
                  <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="On Break">On Break</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="svc-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Update Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
