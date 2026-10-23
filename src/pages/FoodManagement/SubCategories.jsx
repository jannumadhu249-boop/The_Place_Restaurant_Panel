import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Network, Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState([
    { id: 1, name: 'Paneer Gravies', mainCategory: 'Main Course', itemCount: 6 },
    { id: 2, name: 'Chicken Curries', mainCategory: 'Main Course', itemCount: 10 },
    { id: 3, name: 'Clay Oven Rotis', mainCategory: 'Tandoori Breads', itemCount: 4 },
    { id: 4, name: 'Cold Shakes & Beverages', mainCategory: 'Refreshing Beverages', itemCount: 5 },
    { id: 5, name: 'Tandoori Starters', mainCategory: 'Appetizers & Starters', itemCount: 7 },
  ]);
  const [search, setSearch] = useState('');

  const filtered = subCategories.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.mainCategory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Network size={22} color="var(--primary)" /> Sub-Categories</h1>
          <p className="page-desc">Manage nested menu classifications linked to parent categories</p>
        </div>
        <Link to="/food-management/create-sub-category" className="btn btn-primary">
          <Plus size={16} /> Create Sub-Category
        </Link>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search sub-category or parent category..."
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
                <th>Sub-Category Name</th>
                <th>Parent Category</th>
                <th>Menu Dishes Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td><span className="badge badge-muted">{s.mainCategory}</span></td>
                  <td><span className="badge badge-primary">{s.itemCount} Dishes</span></td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/food-management/edit-sub-category/${s.id}`} className="action-btn" title="Edit Sub-Category">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="action-btn delete"
                        title="Delete Sub-Category"
                        onClick={() => setSubCategories(subCategories.filter(x => x.id !== s.id))}
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
