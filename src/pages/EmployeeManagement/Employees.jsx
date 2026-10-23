import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Edit2, Trash2, Mail, Phone, Search } from 'lucide-react';

export default function Employees() {
  const [staff, setStaff] = useState([
    { id: 1, name: 'Gordon Ramsay', email: 'gordon@spicegarden.com', phone: '+1 555-0101', role: 'Head Chef', status: 'Active', salary: '$4,500' },
    { id: 2, name: 'Elena Rostova', email: 'elena@spicegarden.com', phone: '+1 555-0102', role: 'Order Manager', status: 'Active', salary: '$3,200' },
    { id: 3, name: 'Liam Davies', email: 'liam@spicegarden.com', phone: '+1 555-0103', role: 'Cashier / Accountant', status: 'On Leave', salary: '$2,800' },
    { id: 4, name: 'Rajesh Kumar', email: 'rajesh@spicegarden.com', phone: '+1 555-0104', role: 'Kitchen Helper', status: 'Active', salary: '$2,200' },
    { id: 5, name: 'Sarah Jenkins', email: 'sarah@spicegarden.com', phone: '+1 555-0105', role: 'Delivery Dispatcher', status: 'Active', salary: '$2,500' },
  ]);
  const [search, setSearch] = useState('');

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Users size={22} color="var(--primary)" /> Store Crew & Employees</h1>
          <p className="page-desc">Manage kitchen chefs, counter order operators, salary, and active staff accounts</p>
        </div>
        <Link to="/employee-management/create-employee" className="btn btn-primary">
          <Plus size={16} /> Create Employee
        </Link>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by staff name, role, email, phone..."
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
                <th>Employee Name</th>
                <th>Contact Details</th>
                <th>Assigned Role</th>
                <th>Monthly Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>ID: #EMP-{s.id.toString().padStart(3, '0')}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{s.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.phone}</div>
                  </td>
                  <td><span className="badge badge-primary">{s.role}</span></td>
                  <td><strong>{s.salary}</strong></td>
                  <td>
                    <span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/employee-management/edit-employee/${s.id}`} className="action-btn" title="Edit Staff">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="action-btn delete"
                        title="Delete Staff"
                        onClick={() => setStaff(staff.filter(x => x.id !== s.id))}
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
