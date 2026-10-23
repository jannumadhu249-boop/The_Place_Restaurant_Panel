import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

export default function Foods() {
  const [foods, setFoods] = useState([
    { id: 1, name: 'Butter Chicken Special', category: 'Main Course', price: '$16.99', veg: false, stock: true },
    { id: 2, name: 'Paneer Butter Masala', category: 'Main Course', price: '$14.50', veg: true, stock: true },
    { id: 3, name: 'Garlic Butter Naan', category: 'Breads', price: '$3.50', veg: true, stock: true },
    { id: 4, name: 'Crispy Veg Spring Rolls', category: 'Appetizers', price: '$7.99', veg: true, stock: false },
    { id: 5, name: 'Mango Lassi Drink', category: 'Beverages', price: '$4.99', veg: true, stock: true },
    { id: 6, name: 'Tandoori Chicken Tikka', category: 'Appetizers', price: '$12.99', veg: false, stock: true },
    { id: 7, name: 'Gulab Jamun with Rabri', category: 'Desserts', price: '$6.50', veg: true, stock: true },
  ]);

  const [search, setSearch] = useState('');
  const [dietFilter, setDietFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');

  const toggleStock = (id) => {
    setFoods(foods.map(f => f.id === id ? { ...f, stock: !f.stock } : f));
  };

  const categories = ['All', 'Main Course', 'Appetizers', 'Breads', 'Desserts', 'Beverages'];

  const filtered = foods.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchesDiet =
      dietFilter === 'All' ? true :
      dietFilter === 'Veg' ? f.veg : !f.veg;
    const matchesCat = catFilter === 'All' || f.category === catFilter;
    return matchesSearch && matchesDiet && matchesCat;
  });

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Utensils size={22} color="var(--primary)" /> Food Catalog & Menu</h1>
          <p className="page-desc">Manage restaurant dishes, category tags, item pricing, and live inventory availability</p>
        </div>
        <Link to="/food-management/create-food" className="btn btn-primary">
          <Plus size={16} /> Create Food Dish
        </Link>
      </div>

      <div className="card">
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search dishes by name or category..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Veg', 'Non-Veg'].map(d => (
                <button
                  key={d}
                  onClick={() => setDietFilter(d)}
                  className={`btn btn-sm ${dietFilter === d ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 999 }}
                >
                  {d === 'Veg' ? '🌱 Veg' : d === 'Non-Veg' ? '🍗 Non-Veg' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Food Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Dietary Tag</th>
                <th>Availability Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.name}</strong></td>
                  <td><span className="badge badge-muted">{f.category}</span></td>
                  <td><strong>{f.price}</strong></td>
                  <td>
                    <span className={`badge ${f.veg ? 'badge-success' : 'badge-danger'}`}>
                      {f.veg ? '🌱 Veg' : '🍗 Non-Veg'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStock(f.id)}
                      className={`badge ${f.stock ? 'badge-success' : 'badge-danger'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                      title="Click to toggle in-stock / sold-out"
                    >
                      {f.stock ? '● In Stock' : '○ Sold Out'}
                    </button>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/food-management/edit-food/${f.id}`} className="action-btn" title="Edit Dish">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="action-btn delete"
                        title="Delete Dish"
                        onClick={() => setFoods(foods.filter(x => x.id !== f.id))}
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
