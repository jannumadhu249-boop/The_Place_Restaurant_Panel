import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { URLS } from '../url';

export default function ChangePassword() {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (passwords.newPass !== passwords.confirm) {
      setStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (passwords.newPass.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus({
        type: 'error',
        message: 'Authorization token not found. Please log in again to update your password.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(URLS.ChangePassword, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
          confirmPassword: passwords.confirm
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({ type: 'success', message: result.message || 'Your store password has been updated successfully!' });
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        setStatus({ type: 'error', message: result.message || 'Failed to update password. Please verify your current password.' });
      }
    } catch (err) {
      console.error('Change password error:', err);
      setStatus({ type: 'error', message: 'Unable to connect to the server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><KeyRound size={22} color="var(--primary)" /> Change Password</h1>
          <p className="page-desc">Keep your restaurant partner account protected with an updated, secure password</p>
        </div>
      </div>

      {status && (
        <div
          className="card"
          style={{
            background: status.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${status.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: status.type === 'success' ? 'var(--success)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            marginBottom: 20,
            width: '100%'
          }}
        >
          {status.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          {status.message}
        </div>
      )}

      {/* Full Width Card */}
      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 18 }}>Update Credentials</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Current Account Password</label>
              <div className="fp-input-wrap">
                <Lock size={15} className="fp-input-icon" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="form-input fp-icon-input fp-pr-input"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  className="fp-eye-btn"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Secure Password</label>
              <div className="fp-input-wrap">
                <Lock size={15} className="fp-input-icon" />
                <input
                  type={showNew ? 'text' : 'password'}
                  className="form-input fp-icon-input fp-pr-input"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  className="fp-eye-btn"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="fp-input-wrap">
                <Lock size={15} className="fp-input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input fp-icon-input fp-pr-input"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  className="fp-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="fp-spinner" /> Updating Password…
                </>
              ) : (
                <>
                  <Save size={16} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
