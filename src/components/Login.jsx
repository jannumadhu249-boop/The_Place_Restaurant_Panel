import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, UtensilsCrossed, AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { URLS } from '../url';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(URLS.Login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        if (result.data) {
          localStorage.setItem('restaurant_user', JSON.stringify(result.data));
        }
        if (onLogin) onLogin(result.data, result.token);
        navigate('/');
      } else {
        setError(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <UtensilsCrossed size={28} color="var(--primary)" />
          </div>
          <h1 className="auth-title">Restaurant Store Panel</h1>
          <p className="auth-sub">Enter credentials to manage your store</p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid #fecaca',
              color: 'var(--danger)',
              padding: '12px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="fp-input-wrap">
              <Mail size={15} className="fp-input-icon" />
              <input
                type="email"
                className="form-input fp-icon-input"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setError('');
                }}
                placeholder="manager@restaurant.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="fp-input-wrap">
              <Lock size={15} className="fp-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input fp-icon-input fp-pr-input"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError('');
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="fp-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="fp-spinner" /> Signing In…
              </>
            ) : (
              <>
                <Lock size={16} /> Sign In to Panel
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Need access or new branch? <span>Contact Administrator</span>
        </div>
      </div>
    </div>
  );
}
