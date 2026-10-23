import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { UserCheck, ArrowLeft, Save } from 'lucide-react';

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    name: 'Gordon Ramsay',
    email: 'gordon@spicegarden.com',
    phone: '+1 555-0101',
    role: 'Head Chef',
    salary: '4500.00',
    joiningDate: '2024-03-01',
    status: 'Active'
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Employee details updated successfully!`);
    navigate('/employee-management/employees');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><UserCheck size={22} color="var(--primary)" /> Edit Employee #{id || 1}</h1>
          <p className="page-desc">Modify staff profile information, salary details, and system credentials</p>
        </div>
        <Link to="/employee-management/employees" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Staff Directory
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Staff Profile & Login Information</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={employee.name}
                onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designated Role</label>
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
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={employee.email}
                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={employee.phone}
                onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Salary ($)</label>
              <input
                type="number"
                className="form-input"
                value={employee.salary}
                onChange={(e) => setEmployee({ ...employee, salary: e.target.value })}
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
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={employee.status}
                onChange={(e) => setEmployee({ ...employee, status: e.target.value })}
              >
                <option value="Active">Active (Permitted)</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Update Employee
            </button>
            <Link to="/employee-management/employees" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
