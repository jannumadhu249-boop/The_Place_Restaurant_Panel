import React, { useState, useEffect } from 'react';
import { Network, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { URLS } from '../../url';

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchSubCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(URLS.GetAllSubcategories, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const result = await response.json();
      if (response.ok && result) {
        const list = result.subcategory || result.subcategories || result.data || (Array.isArray(result) ? result : []);
        setSubCategories(Array.isArray(list) ? list : []);
      } else {
        setError(result?.message || 'Failed to load sub-categories.');
      }
    } catch (err) {
      console.error('Fetch subcategories error:', err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const clean = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = URLS.Image || URLS.Base || 'http://16.113.133.178:3000/';
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${clean}`;
  };

  const getSubCategoryName = (s) => s.subCategoryName || s.name || 'Sub-Category';
  const getParentCategory = (s) => {
    if (s.categoryId && typeof s.categoryId === 'object') return s.categoryId.categoryName || s.categoryId.name || '';
    return s.categoryName || s.mainCategory || '';
  };

  const filtered = subCategories.filter(s =>
    getSubCategoryName(s).toLowerCase().includes(search.toLowerCase()) ||
    getParentCategory(s).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Network size={22} color="var(--primary)" /> Sub-Categories</h1>
          <p className="page-desc">Manage nested menu classifications linked to parent categories</p>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
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
          <button
            onClick={fetchSubCategories}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="Refresh sub-categories"
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
            <div>Loading sub-categories…</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SL.NO</th>
                  <th>Sub-Category Name</th>
                  <th>Parent Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((s, index) => (
                    <tr key={s._id || s.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {s.image ? (
                            <img
                              src={getImageUrl(s.image)}
                              alt={getSubCategoryName(s)}
                              style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                              <Network size={16} color="var(--text-muted)" />
                            </div>
                          )}
                          <strong style={{ fontSize: 14 }}>{getSubCategoryName(s)}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-muted">{getParentCategory(s) || '—'}</span>
                      </td>
                      <td><span className="badge badge-muted">{s.priority || 1}</span></td>
                      <td>
                        <span className={`badge ${(s.status || '').toLowerCase() === 'active' ? 'badge-success' : 'badge-muted'}`}>
                          {s.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      No sub-categories found matching your search.
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
