import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Save } from 'lucide-react';

export default function CreateEmployeeRole() {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState(['Orders', 'Food Menu']);

  const allPerms = [
    'Live Orders Dispatch',
    'Food Menu Management',
    'Categories & Sub-Categories',
    'Marketing Campaigns',
    'Discount Coupons',
    'Happy Hour Management',
    'Customer Reviews Response',
    'Wallet & Payout Requests',
    'Staff Management & Roles',
    'Restaurant Info & Hours'
  ];

  const togglePerm = (perm) => {
    setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const selectAll = () => setPermissions(allPerms);
  const clearAll = () => setPermissions([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Role "${roleName}" created successfully!`);
    navigate('/employee-management/roles');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Shield size={22} color="var(--primary)" /> Create Employee Role</h1>
          <p className="page-desc">Define a new operational role with granular permission control for restaurant crew</p>
        </div>
        <Link to="/employee-management/roles" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Roles
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Role Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Role Title / Designation</label>
              <input
                className="form-input"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Senior Kitchen Expeditor"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Role Responsibility Description</label>
              <input
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Manages active kitchen line, food packing, and delivery partner handovers."
              />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Assign System Access Permissions</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={selectAll}>Select All</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={clearAll}>Clear All</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 4 }}>
              {allPerms.map((p) => {
                const checked = permissions.includes(p);
                return (
                  <label
                    key={p}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 13,
                      background: checked ? 'var(--primary-light)' : '#f8fafc',
                      color: checked ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: checked ? 600 : 500,
                      padding: '10px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      border: `1px solid ${checked ? 'var(--primary-border)' : 'var(--border)'}`,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePerm(p)}
                    />
                    <span>{p}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Role
            </button>
            <Link to="/employee-management/roles" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
