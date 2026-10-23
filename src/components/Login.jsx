import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UtensilsCrossed } from 'lucide-react';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: 'admin@spicegarden.com', password: 'password123' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin();
    navigate('/');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: 12, background: 'var(--primary-light)', borderRadius: '50%', marginBottom: 12 }}>
            <UtensilsCrossed size={32} color="var(--primary)" />
          </div>
          <h1 className="auth-title">Restaurant Store Panel</h1>
          <p className="auth-sub">Enter credentials to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="manager@restaurant.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
            <Lock size={16} /> Sign In to Panel
          </button>
        </form>

        <div className="auth-footer">
          Need access or new branch? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Contact Administrator</span>
        </div>
      </div>
    </div>
  );
}
