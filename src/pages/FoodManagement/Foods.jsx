import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Plus, Edit2, Trash2, Search, RefreshCw, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { URLS } from '../../url';

export default function Foods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState('');
  const [dietFilter, setDietFilter] = useState('All');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    const clean = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = URLS.Image || URLS.Base || 'http://16.113.133.178:3000/';
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${clean}`;
  };

  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(URLS.GetFoodMenu, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      const result = await response.json();

      if (response.ok && result) {
        const list = result.data || result.menu || result.food || result.foods || (Array.isArray(result) ? result : []);
        setFoods(Array.isArray(list) ? list : []);
      } else {
        setError(result?.message || 'Failed to load food menu.');
      }
    } catch (err) {
      console.error('Fetch foods error:', err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this food item'}"?`)) return;

    setDeletingId(id);
    setError('');
    setFoods(prev => prev.filter(item => (item._id || item.id) !== id));
    setSuccessMsg(`Food dish "${name || ''}" deleted.`);
    setTimeout(() => setSuccessMsg(''), 3000);

    try {
      const token = localStorage.getItem('token');
      const deleteUrl = `${URLS.DeleteFoodMenu.endsWith('/') ? URLS.DeleteFoodMenu : `${URLS.DeleteFoodMenu}/`}${id}`;
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) console.warn('Delete failed:', result?.message);
    } catch (err) {
      console.error('Delete food error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const isVeg = (f) => {
    const type = (f.dietaryType || f.foodType || f.type || '').toLowerCase();
    return type === 'vegg' || type === 'veg' || type === 'vegetarian' || f.veg === true;
  };

  const getDishName = (f) => {
    return f.dishName || f.name || 'Dish Item';
  };

  const getRegularPrice = (f) => {
    const p = f.regularPrice ?? f.price;
    return p !== undefined && p !== null && p !== '' ? p : '0';
  };

  const getCategoryName = (f) => {
    if (typeof f.category === 'string' && f.category.trim().length > 0) {
      return f.category;
    }
    if (f.categoryId && typeof f.categoryId === 'object') {
      return f.categoryId.name || f.categoryId.categoryName || 'General';
    }
    if (f.category && typeof f.category === 'object') {
      return f.category.name || 'General';
    }
    return f.categoryName || f.categoryId || 'General';
  };

  const isInStock = (f) => {
    const status = (f.kitchenStatus || f.status || '').toLowerCase();
    if (status === 'inactive' || status === 'sold_out' || status === 'out_of_stock') {
      return false;
    }
    if (typeof f.stock === 'number' && f.stock <= 0) {
      return false;
    }
    if (status === 'active' || status === 'available') {
      return true;
    }
    return status !== 'inactive';
  };

  const filtered = foods.filter(f => {
    const nameMatch = getDishName(f).toLowerCase().includes(search.toLowerCase());
    const catName = getCategoryName(f);
    const catMatch = catName.toLowerCase().includes(search.toLowerCase());
    const descMatch = (f.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = nameMatch || catMatch || descMatch;

    const vegStatus = isVeg(f);
    const matchesDiet =
      dietFilter === 'All' ? true :
      dietFilter === 'Veg' ? vegStatus : !vegStatus;

    return matchesSearch && matchesDiet;
  });

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Utensils size={22} color="var(--primary)" /> Food Catalog & Menu</h1>
          <p className="page-desc">Manage restaurant dishes, category tags, item pricing, and live inventory availability</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchFoods}
            disabled={loading}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="Refresh menu items"
          >
            <RefreshCw size={15} className={loading ? 'fp-spinner' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/food-management/create-food" className="btn btn-primary">
            <Plus size={16} /> Create Food Dish
          </Link>
        </div>
      </div>

      {successMsg && (
        <div
          className="card"
          style={{
            background: 'var(--success-bg)',
            border: '1px solid #a7f3d0',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            marginBottom: 20
          }}
        >
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid #fecaca',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            marginBottom: 20
          }}
        >
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="card">
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search dishes..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Veg', 'Non-Veg'].map(d => (
                <button
                  key={d}
                  onClick={() => setDietFilter(d)}
                  className={`btn btn-sm ${dietFilter === d ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 999 }}
                >
                  {d === 'Veg' ? 'Veg' : d === 'Non-Veg' ? 'Non-Veg' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="fp-spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>Loading food catalog...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <Utensils size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>No Food Items Found</h3>
            <p style={{ fontSize: 13, margin: '0 0 16px' }}>
              {search || dietFilter !== 'All'
                ? 'No dishes match the selected filter criteria.'
                : 'Start building your digital restaurant menu by creating your first dish.'}
            </p>
            <Link to="/food-management/create-food" className="btn btn-primary btn-sm">
              <Plus size={14} /> Add First Food Dish
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SL.NO</th>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Offer Price</th>
                  <th>Dietary Tag</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, index) => {
                  const itemId = f._id || f.id;
                  const dishTitle = getDishName(f);
                  const itemIsVeg = isVeg(f);
                  const regularPrice = getRegularPrice(f);
                  const inStock = isInStock(f);
                  const isDeleting = deletingId === itemId;

                  return (
                    <tr key={itemId || index}>
                      <td>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {f.image ? (
                            <img
                              src={getImageUrl(f.image)}
                              alt={dishTitle}
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f1f5f9', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
                              <ImageIcon size={20} />
                            </div>
                          )}
                          <div>
                            <strong style={{ color: 'var(--text-main)', fontSize: 13.5 }}>{dishTitle}</strong>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-muted">{getCategoryName(f)}</span></td>
                      <td><strong>₹{regularPrice}</strong></td>
                      <td>
                        {f.offerPrice !== undefined && f.offerPrice !== null && f.offerPrice !== '' ? (
                          <span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{f.offerPrice}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${itemIsVeg ? 'badge-success' : 'badge-danger'}`}>
                          {itemIsVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td>
                        {inStock ? (
                          <span
                            className="badge badge-success"
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #86efac',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            ● In Stock
                          </span>
                        ) : (
                          <span
                            className="badge badge-danger"
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            ○ Sold Out
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <Link
                            to={`/food-management/edit-food/${itemId}`}
                            state={{ food: f }}
                            className="action-btn"
                            title="Edit Dish"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <button
                            className="action-btn delete"
                            title="Delete Dish"
                            disabled={isDeleting}
                            onClick={() => handleDelete(itemId, dishTitle)}
                          >
                            {isDeleting ? <RefreshCw size={14} className="fp-spinner" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
