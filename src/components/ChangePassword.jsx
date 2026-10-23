import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, Save, Lock } from 'lucide-react';

export default function ChangePassword() {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (passwords.newPass.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }
    setStatus({ type: 'success', message: 'Your store password has been updated successfully!' });
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setStatus(null), 3500);
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
              <input
                type="password"
                className="form-input"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Secure Password</label>
              <input
                type="password"
                className="form-input"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Re-enter new password"
                required
              />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
