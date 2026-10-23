import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function EmployeeRole() {
  const [roles, setRoles] = useState([
    { id: 1, name: 'Head Chef', description: 'Kitchen lead and inventory control', permissions: ['Menu Management', 'Inventory Access', 'Kitchen Orders'], members: 3 },
    { id: 2, name: 'Order Manager', description: 'Counter staff and courier expeditors', permissions: ['Order Processing', 'Customer Communication', 'Delivery Handover'], members: 5 },
    { id: 3, name: 'Store Accountant', description: 'Financial bookkeeping and payout requests', permissions: ['Wallet View', 'Payout Requests', 'Financial Reports'], members: 2 },
    { id: 4, name: 'Marketing Lead', description: 'Runs promotions, discounts, and campaigns', permissions: ['Coupons', 'Happy Hours', 'Campaigns', 'Reviews'], members: 1 },
  ]);
  const [search, setSearch] = useState('');

  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.permissions.some(p => p.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Shield size={22} color="var(--primary)" /> Employee Roles & Access Levels</h1>
          <p className="page-desc">Define store staff designations, permissions, and panel authorization policies</p>
        </div>
        <Link to="/employee-management/create-role" className="btn btn-primary">
          <Plus size={16} /> Create Employee Role
        </Link>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by role title or permissions..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Designation</th>
                <th>Responsibility Notes</th>
                <th>Access Permissions</th>
                <th>Assigned Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {r.permissions.map((p, i) => (
                        <span key={i} className="badge badge-muted">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{r.members} Staff</span></td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/employee-management/edit-role/${r.id}`} className="action-btn" title="Edit Role">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="action-btn delete"
                        title="Delete Role"
                        onClick={() => setRoles(roles.filter(x => x.id !== r.id))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
