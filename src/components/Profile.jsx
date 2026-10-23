import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, CheckCircle, Shield, Camera } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Marcus Vance',
    email: 'marcus@spicegarden.com',
    phone: '+1 (555) 019-2834',
    role: 'Store General Manager',
    branch: 'Downtown Flagship Bistro',
    joinedDate: 'Jan 15, 2024',
    emergencyContact: '+1 (555) 998-1122',
    shiftTiming: 'Morning & Afternoon (09:00 - 18:00)'
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><User size={22} color="var(--primary)" /> Store Manager Profile</h1>
          <p className="page-desc">Manage your account identity, security preferences, and manager contact information</p>
        </div>
        <button onClick={handleSubmit} className="btn btn-primary">
          <Save size={16} /> Save Changes
        </button>
      </div>

      {saved && (
        <div className="card" style={{ background: 'var(--success-bg)', border: '1px solid #a7f3d0', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 10, padding: 14 }}>
          <CheckCircle size={20} /> Manager profile details updated successfully!
        </div>
      )}

      {/* Full Width Card */}
      <div className="card" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 28, paddingBottom: 22, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, #db2777 100%)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
                fontWeight: 800,
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}>
                {profile.name[0]}
              </div>
              <label style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 26,
                height: 26,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <Camera size={13} color="var(--text-main)" />
                <input type="file" accept="image/*" style={{ display: 'none' }} />
              </label>
            </div>

            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>{profile.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{profile.email}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span className="badge badge-primary">{profile.role}</span>
                <span className="badge badge-muted">Member since {profile.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <h3 className="card-title" style={{ marginBottom: 18 }}>Personal & Contact Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email Address</label>
              <input
                className="form-input"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                className="form-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Phone</label>
              <input
                className="form-input"
                value={profile.emergencyContact}
                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Branch</label>
              <input
                className="form-input"
                value={profile.branch}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Daily Shift Window</label>
              <input
                className="form-input"
                value={profile.shiftTiming}
                onChange={(e) => setProfile({ ...profile, shiftTiming: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Profile Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
