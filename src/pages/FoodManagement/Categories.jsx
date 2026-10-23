import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Main Course', itemCount: 28, status: 'Active', priority: 1 },
    { id: 2, name: 'Appetizers & Starters', itemCount: 14, status: 'Active', priority: 2 },
    { id: 3, name: 'Tandoori Breads', itemCount: 8, status: 'Active', priority: 3 },
    { id: 4, name: 'Desserts & Sweets', itemCount: 6, status: 'Active', priority: 4 },
    { id: 5, name: 'Refreshing Beverages', itemCount: 9, status: 'Active', priority: 5 },
  ]);
  const [search, setSearch] = useState('');

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Layers size={22} color="var(--primary)" /> Food Categories</h1>
          <p className="page-desc">Organize menu dishes into master classifications for customer browsing</p>
        </div>
        <Link to="/food-management/create-category" className="btn btn-primary">
          <Plus size={16} /> Create Category
        </Link>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search category name..."
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
                <th>Priority</th>
                <th>Category Name</th>
                <th>Total Food Items</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><strong>#{c.priority}</strong></td>
                  <td><strong>{c.name}</strong></td>
                  <td><span className="badge badge-primary">{c.itemCount} Items</span></td>
                  <td><span className="badge badge-success">{c.status}</span></td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/food-management/edit-category/${c.id}`} className="action-btn" title="Edit Category">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="action-btn delete"
                        title="Delete Category"
                        onClick={() => setCategories(categories.filter(x => x.id !== c.id))}
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
