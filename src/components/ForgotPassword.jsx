import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: 12, background: 'var(--primary-light)', borderRadius: '50%', marginBottom: 12 }}>
            <KeyRound size={32} color="var(--primary)" />
          </div>
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-sub">Enter your email and we'll send you recovery steps</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle size={44} color="var(--success)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Check Your Inbox</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              We have sent a reset password link to <b>{email}</b>.
            </p>
            <Link to="/login" className="btn btn-secondary" style={{ justifyContent: 'center', width: '100%' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Registered Store Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="store@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '11px' }}>
              <Mail size={16} /> Send Reset Link
            </button>

            <Link to="/login" className="btn btn-outline" style={{ justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
