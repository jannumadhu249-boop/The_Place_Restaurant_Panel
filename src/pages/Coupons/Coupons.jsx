import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { URLS } from '../../url';

export default function Coupons() {
  const location = useLocation();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [actionInProgress, setActionInProgress] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  };

  // Check if router passed a toast message from create/edit page
  useEffect(() => {
    if (location.state?.toastMessage) {
      showToast(location.state.toastMessage, 'success');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    return {
      'Content-Type': 'application/json',
      ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  };

  // Fetch Coupons (GET /v1/place/admin/coupon/getAll?page=X&limit=Y&searchQuery=Z)
  const fetchCoupons = useCallback(async (searchQuery = search, targetPage = page, targetLimit = limit) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(targetPage),
        limit: String(targetLimit),
      });
      if (searchQuery.trim()) {
        queryParams.append('searchQuery', searchQuery.trim());
      }

      const res = await fetch(`${URLS.GetCoupons}?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const result = await res.json();
        const rawList = result.data?.coupons || result.coupons || result.data?.docs || result.data || (Array.isArray(result) ? result : []);
        const list = Array.isArray(rawList) ? rawList : [];

        // Determine pagination metadata from server response
        const paginationMeta = result.pagination || result.data?.pagination || result.meta || {};
        const isServerPaginated = paginationMeta.total !== undefined || paginationMeta.totalPages !== undefined;

        let totalCount = list.length;
        let calculatedPages = 1;
        let paginatedList = list;

        if (isServerPaginated) {
          totalCount = Number(paginationMeta.total ?? paginationMeta.totalDocs ?? paginationMeta.totalCount ?? list.length);
          calculatedPages = Number(paginationMeta.totalPages ?? paginationMeta.pages ?? Math.max(1, Math.ceil(totalCount / targetLimit)));
          paginatedList = list;
        } else {
          // Client-side fallback pagination if backend returned unpaginated list
          totalCount = list.length;
          calculatedPages = Math.max(1, Math.ceil(totalCount / targetLimit));
          const startIdx = (targetPage - 1) * targetLimit;
          paginatedList = list.slice(startIdx, startIdx + targetLimit);
        }

        const mapped = paginatedList.map((c, idx) => {
          const typeStr = (c.type || c.discountType || 'percentage').toLowerCase();
          const isPercentage = typeStr === 'percentage';
          const isActive = String(c.status).toLowerCase() === 'active' || Boolean(c.active);

          return {
            id: c._id || c.id || `coupon-${idx}`,
            _id: c._id || c.id,
            name: c.name || c.couponName || c.title || c.code || 'Offer',
            code: (c.code || c.couponCode || '').toUpperCase(),
            type: isPercentage ? 'Percentage' : 'Flat Amount',
            discount: Number(c.discount !== undefined ? c.discount : (c.discountValue || 0)),
            minOrder: c.minOrder !== undefined ? Number(c.minOrder) : (c.minOrderValue ? Number(c.minOrderValue) : 0),
            limit: Number(c.limit || c.usageLimit || 100),
            used: Number(c.usedCount || c.used || 0),
            fromDate: c.fromDate ? c.fromDate.split('T')[0] : '',
            validTill: c.toDate ? c.toDate.split('T')[0] : (c.validTill ? c.validTill.split('T')[0] : 'N/A'),
            description: c.description || '',
            oncePerCustomer: Boolean(c.oncePerCustomer),
            status: c.status || (isActive ? 'active' : 'inactive'),
            active: isActive,
            raw: c,
          };
        });

        setCoupons(mapped);
        setTotalCoupons(totalCount);
        setTotalPages(calculatedPages);
        setPage(targetPage);
        setLimit(targetLimit);
      } else {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.message || 'Failed to load coupons.', 'error');
      }
    } catch (err) {
      console.warn('Error fetching coupons:', err);
      showToast('Network error while fetching coupons.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchCoupons(search, page, limit);
  }, []); // Initial load

  // Handle Search Input with Debounce (resets to page 1)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCoupons(search, 1, limit);
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  // Page Navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page || isLoading) return;
    fetchCoupons(search, newPage, limit);
  };

  // Limit / Page Size Change
  const handleLimitChange = (newLimit) => {
    fetchCoupons(search, 1, newLimit);
  };

  // Toggle Coupon Active / Inactive status (PUT /v1/place/admin/coupon/edit/:id)
  const toggleStatus = async (coupon) => {
    const nextStatus = coupon.active ? 'inactive' : 'active';
    const targetId = coupon._id || coupon.id;
    setActionInProgress(targetId);

    try {
      const res = await fetch(`${URLS.UpdateCoupon}${targetId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        setCoupons((prev) =>
          prev.map((c) =>
            (c._id === targetId || c.id === targetId)
              ? { ...c, active: !c.active, status: nextStatus }
              : c
          )
        );
        showToast(`✓ Coupon "${coupon.code}" marked ${nextStatus.toUpperCase()}!`);
      } else {
        showToast(result.message || 'Failed to update coupon status.', 'error');
      }
    } catch (err) {
      console.error('Error toggling coupon status:', err);
      showToast('Network error while updating status.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete Coupon (DELETE /v1/place/admin/coupon/delete/:id)
  const deleteCoupon = async (coupon) => {
    const targetId = coupon._id || coupon.id;
    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }

    setActionInProgress(targetId);

    try {
      const res = await fetch(`${URLS.DeleteCoupon}${targetId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        showToast(`✓ Coupon "${coupon.code}" deleted successfully!`);
        fetchCoupons(search, page, limit);
      } else {
        showToast(result.message || 'Failed to delete coupon.', 'error');
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
      showToast('Network error while deleting coupon.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Calculate Page Number Pills
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const startIndex = totalCoupons === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCoupons);

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Tag size={22} color="var(--primary)" /> Coupons & Promo Codes</h1>
          <p className="page-desc">Manage discount vouchers, minimum cart thresholds, and customer savings codes</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              fetchCoupons(search, page, limit);
              showToast('Refreshed coupons list!');
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <Link to="/coupons/create" className="btn btn-primary">
            <Plus size={16} /> Create Coupon
          </Link>
        </div>
      </div>

      <div className="card" style={{ paddingBottom: 0 }}>
        {/* Search Bar & Total Count */}
        <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by promo code, title, or type..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Total: <strong>{totalCoupons}</strong> {totalCoupons === 1 ? 'coupon' : 'coupons'}
          </div>
        </div>

        {/* Coupons Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Coupon Name</th>
                <th>Discount</th>
                <th>Limit</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && coupons.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    <RefreshCw size={22} className="spin" style={{ marginBottom: 10 }} />
                    <div>Loading coupons...</div>
                  </td>
                </tr>
              )}

              {!isLoading && coupons.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>
                    {search.trim()
                      ? `No coupons matching "${search}".`
                      : 'No coupons found. Click "Create Coupon" to add one!'}
                  </td>
                </tr>
              )}

              {coupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 750,
                          padding: '3px 8px',
                          background: 'var(--primary-light, #fff7ed)',
                          color: 'var(--primary, #f97316)',
                          border: '1px dashed var(--primary-border, #fed7aa)',
                          borderRadius: 6,
                          fontSize: 13,
                          letterSpacing: '0.04em',
                        }}>
                          {c.code}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 650, color: '#1e293b', fontSize: 13 }}>
                      {c.name}
                    </div>
                    {c.description && (
                      <div style={{ fontSize: 11.5, color: '#64748b', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong style={{ fontSize: 13.5, color: '#0f172a' }}>
                      {c.type === 'Percentage' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                    </strong>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{c.type}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{c.limit}</span>
                    {c.oncePerCustomer && (
                      <div style={{ fontSize: 11, color: '#2563eb' }}>Once per user</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: '#334155' }}>
                      {c.fromDate || '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: '#334155' }}>
                      {c.validTill || '-'}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(c)}
                      disabled={actionInProgress === c._id}
                      className={`badge ${c.active ? 'badge-success' : 'badge-muted'}`}
                      style={{ border: 'none', cursor: 'pointer', padding: '5px 10px', fontSize: 12 }}
                      title={`Click to mark ${c.active ? 'Inactive' : 'Active'}`}
                    >
                      {actionInProgress === c._id ? (
                        <RefreshCw size={11} className="spin" />
                      ) : (
                        c.active ? '● Active' : '○ Inactive'
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link
                        to={`/coupons/edit/${c._id || c.id}`}
                        state={{ coupon: c }}
                        className="action-btn"
                        title="Edit Coupon"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="action-btn delete"
                        title="Delete Coupon"
                        disabled={actionInProgress === c._id}
                        onClick={() => deleteCoupon(c)}
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

        {/* ══════════════════════════════════════════════
            PAGINATION CONTROLS
        ══════════════════════════════════════════════ */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 4px',
          borderTop: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 13,
          color: '#475569',
        }}>
          {/* Left: Range and Per-page select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span>
              Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of <strong>{totalCoupons}</strong> coupons
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="form-select"
                style={{ width: 'auto', padding: '4px 8px', height: 32, fontSize: 12.5 }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right: Previous, Page Numbers, Next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '5px 12px', fontSize: 12.5, height: 32, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              disabled={page <= 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {getPageNumbers().map((p, idx) => (
              p === '...' ? (
                <span key={`dots-${idx}`} style={{ padding: '0 6px', color: '#94a3b8' }}>...</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  disabled={isLoading}
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
              )
            ))}

            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '5px 12px', fontSize: 12.5, height: 32, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              disabled={page >= totalPages || isLoading}
              onClick={() => handlePageChange(page + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toast.message && (
        <div className={`svc-toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
