import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layers, ArrowLeft, Save } from 'lucide-react';

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('Main Course');
  const [priority, setPriority] = useState('1');
  const [description, setDescription] = useState('Core gourmet main dishes served with rice and flatbreads.');
  const [status, setStatus] = useState('Active');

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Category updated successfully!`);
    navigate('/food-management/categories');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Layers size={22} color="var(--primary)" /> Edit Category #{id || 1}</h1>
          <p className="page-desc">Modify category label, sorting priority, and operational visibility</p>
        </div>
        <Link to="/food-management/categories" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Categories
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 18 }}>Category Details</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Display Priority Order</label>
              <input
                type="number"
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active (Visible on Menu)</option>
                <option value="Inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Update Category
            </button>
            <Link to="/food-management/categories" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
