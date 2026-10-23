import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save } from 'lucide-react';

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Head Chef',
    password: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Employee "${employee.name}" created successfully!`);
    navigate('/employee-management/employees');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><UserPlus size={22} color="var(--primary)" /> Create Staff Member</h1>
          <p className="page-desc">Add a new staff member, configure dashboard credentials, and assign role duties</p>
        </div>
        <Link to="/employee-management/employees" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Staff Directory
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Staff Profile & Login Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="e.g. Liam Christopher"
                value={employee.name}
                onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designated Staff Role</label>
              <select
                className="form-select"
                value={employee.role}
                onChange={(e) => setEmployee({ ...employee, role: e.target.value })}
              >
                <option value="Head Chef">Head Chef</option>
                <option value="Order Manager">Order Manager</option>
                <option value="Kitchen Helper">Kitchen Helper</option>
                <option value="Cashier / Accountant">Cashier / Accountant</option>
                <option value="Delivery Dispatcher">Delivery Dispatcher</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Login Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="staff@spicegarden.com"
                value={employee.email}
                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input
                className="form-input"
                placeholder="+1 555-0199"
                value={employee.phone}
                onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temporary Account Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Create secure password"
                value={employee.password}
                onChange={(e) => setEmployee({ ...employee, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input
                type="date"
                className="form-input"
                value={employee.joiningDate}
                onChange={(e) => setEmployee({ ...employee, joiningDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Compensation / Salary ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="2800.00"
                value={employee.salary}
                onChange={(e) => setEmployee({ ...employee, salary: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-select"
                value={employee.status}
                onChange={(e) => setEmployee({ ...employee, status: e.target.value })}
              >
                <option value="Active">Active (Permitted)</option>
                <option value="Inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Staff Member
            </button>
            <Link to="/employee-management/employees" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
