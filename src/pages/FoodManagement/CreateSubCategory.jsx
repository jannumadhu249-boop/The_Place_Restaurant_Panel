import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, ArrowLeft, Save } from 'lucide-react';

export default function CreateSubCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mainCategory, setMainCategory] = useState('Main Course');
  const [priority, setPriority] = useState('1');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Sub-Category "${name}" created successfully!`);
    navigate('/food-management/sub-categories');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Network size={22} color="var(--primary)" /> Create Sub-Category</h1>
          <p className="page-desc">Nest a new sub-category under a parent category for detailed menu breakdown</p>
        </div>
        <Link to="/food-management/sub-categories" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Sub-Categories
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 18 }}>Sub-Category Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Parent Food Category</label>
              <select
                className="form-select"
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
              >
                <option value="Main Course">Main Course</option>
                <option value="Appetizers & Starters">Appetizers & Starters</option>
                <option value="Tandoori Breads">Tandoori Breads</option>
                <option value="Desserts & Sweets">Desserts & Sweets</option>
                <option value="Refreshing Beverages">Refreshing Beverages</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sub-Category Name</label>
              <input
                className="form-input"
                placeholder="e.g. Sizzler Platters & Tandoor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                min="1"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Detailed description of this sub-division"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Sub-Category
            </button>
            <Link to="/food-management/sub-categories" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
