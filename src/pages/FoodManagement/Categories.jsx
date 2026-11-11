import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Search, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { URLS } from '../../url';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);

  const fetchCategories = useCallback(async (targetPage = 1, targetLimit = 10, searchQuery = '') => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: targetPage, limit: targetLimit, search: searchQuery });
      const response = await fetch(`${URLS.GetCatgories}?${params.toString()}`, {
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
        const pg = result.pagination || {};
        setTotalPages(pg.totalPages || 1);
        setTotalCategories(pg.totalRecords || pg.total || (Array.isArray(list) ? list.length : 0));
        setPage(pg.currentPage || pg.page || targetPage);
      } else {
        setError(result?.message || 'Failed to load categories.');
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search — reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(1, limit, search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, limit, fetchCategories]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchCategories(newPage, limit, search);
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (page >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const clean = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = URLS.Image || URLS.Base || 'http://40.192.68.118:3000/';
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${clean}`;
  };

  const getCategoryName = (c) => c.categoryName || c.name || 'Category';

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCategories);

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
            onClick={() => fetchCategories(page, limit, search)}
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
          <>
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
                  {categories.length > 0 ? (
                    categories.map((c, index) => (
                      <tr key={c._id || c.id}>
                        <td>{(page - 1) * limit + index + 1}</td>
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

            {/* Pagination */}
            {totalCategories > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', padding: '16px 4px', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                  <span>Showing {totalCategories === 0 ? 0 : startItem} to {endItem} of {totalCategories} items</span>
                  <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); fetchCategories(1, Number(e.target.value), search); }}
                    style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontSize: 13, cursor: 'pointer' }}
                  >
                    {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                  type='button'
                  className='btn btn-outline'
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    style={{ padding: '5px 12px', fontSize: 12.5, height: 32, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  {getPageNumbers().map((p, i) => (
                    <button
                      key={i}
                      onClick={() => typeof p === 'number' && handlePageChange(p)}
                      disabled={p === '...'}
                      style={{
                        minWidth: 32,
                    height: 32,
                    padding: '0 8px',
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: p === page ? 750 : 500,
                    border: p === page ? '1.5px solid var(--primary, #f97316)' : '1px solid #cbd5e1',
                    background: p === page ? 'var(--primary, #f97316)' : '#ffffff',
                    color: p === page ? '#ffffff' : '#334155',
                    cursor: p === page ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                  type='button'
                  className='btn btn-outline'
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    style={{ padding: '5px 12px', fontSize: 12.5, height: 32, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
