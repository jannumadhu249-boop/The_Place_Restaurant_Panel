import React, { useState, useEffect } from 'react';
import { Layers, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { URLS } from '../../url';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(URLS.GetCatgories, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const result = await response.json();
      if (response.ok && result) {
        const list = result.category || result.categories || result.data || (Array.isArray(result) ? result : []);
        setCategories(Array.isArray(list) ? list : []);
      } else {
        setError(result?.message || 'Failed to load categories.');
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const clean = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = URLS.Image || URLS.Base || 'http://16.113.133.178:3000/';
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${clean}`;
  };

  const getCategoryName = (c) => c.categoryName || c.name || 'Category';

  const filtered = categories.filter(c =>
    getCategoryName(c).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Layers size={22} color="var(--primary)" /> Food Categories</h1>
          <p className="page-desc">Organize menu dishes into master classifications for customer browsing</p>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
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
          <button
            onClick={fetchCategories}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="Refresh categories"
          >
            <RefreshCw size={14} className={loading ? 'fp-spinner' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid #fecaca', color: 'var(--danger)', padding: '12px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, fontSize: 13 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="fp-spinner" style={{ width: 24, height: 24, borderColor: 'var(--primary)', borderTopColor: 'transparent', marginBottom: 12 }} />
            <div>Loading categories…</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SL.NO</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((c, index) => (
                    <tr key={c._id || c.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {c.image ? (
                            <img
                              src={getImageUrl(c.image)}
                              alt={getCategoryName(c)}
                              style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                              <Layers size={18} color="var(--text-muted)" />
                            </div>
                          )}
                          <strong style={{ fontSize: 14 }}>{getCategoryName(c)}</strong>
                        </div>
                      </td>
                      <td><span className="badge badge-muted">{c.priority || 1}</span></td>
                      <td>
                        <span className={`badge ${(c.status || '').toLowerCase() === 'active' ? 'badge-success' : 'badge-muted'}`}>
                          {c.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      No categories found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
