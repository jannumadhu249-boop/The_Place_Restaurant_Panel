import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Eye,
  Search,
  Printer,
  X,
  Check,
  ChefHat,
  Bike,
  Clock,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { URLS } from '../../url';
import ViewOrder from './ViewOrder';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async (targetPage = page, targetLimit = limit) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: String(targetPage),
        limit: String(targetLimit),
      });
      const url = `${URLS.GetOrders}${URLS.GetOrders.includes('?') ? '&' : '?'}${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      const result = await response.json();

      if (response.ok && result) {
        const list = result.data || result.bookings || result.orders || (Array.isArray(result) ? result : []);
        const paginationMeta = result.pagination || {};
        const isServerPaginated = paginationMeta.totalRecords !== undefined || paginationMeta.totalPages !== undefined;

        let total = list.length;
        let pages = 1;
        let displayList = list;

        if (isServerPaginated) {
          total = Number(paginationMeta.totalRecords ?? paginationMeta.total ?? list.length);
          pages = Number(paginationMeta.totalPages ?? Math.max(1, Math.ceil(total / targetLimit)));
          displayList = list;
        } else {
          total = list.length;
          pages = Math.max(1, Math.ceil(total / targetLimit));
          const start = (targetPage - 1) * targetLimit;
          displayList = list.slice(start, start + targetLimit);
        }

        setOrders(Array.isArray(displayList) ? displayList : []);
        setTotalRecords(total);
        setTotalPages(pages);
        setPage(targetPage);
        setLimit(targetLimit);
      } else {
        setError(result?.message || 'Failed to load bookings.');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchOrders(page, limit);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page || loading) return;
    fetchOrders(newPage, limit);
  };

  const handleLimitChange = (newLimit) => {
    fetchOrders(1, newLimit);
  };

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

  const handleViewOrder = async (order) => {
    const mongoId = order._id || order.id || order.bookingId;
    setSelectedOrder(order);
    setDetailError('');

    try {
      const token = localStorage.getItem('token');
      const getByIdUrl = `${URLS.GetOrderById.endsWith('/') ? URLS.GetOrderById : `${URLS.GetOrderById}/`}${mongoId}`;
      const response = await fetch(getByIdUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      const result = await response.json();
      if (response.ok && result) {
        const fullData = result.data || result.booking || result.order || result;
        setSelectedOrder(fullData);
      }
    } catch (err) {
      console.error('Fetch order detail error:', err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!orderId) return;
    setUpdatingId(orderId);

    // Optimistic update
    setOrders(prev => {
      const updated = prev.map(o => {
        const id = o._id || o.id || o.bookingId;
        if (id === orderId) return { ...o, bookingStatus: newStatus };
        return o;
      });
      return updated;
    });

    if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId || selectedOrder.bookingId === orderId)) {
      setSelectedOrder(prev => ({ ...prev, bookingStatus: newStatus }));
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(URLS.UpdateBookingStatus, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ bookingId: orderId, bookingStatus: newStatus })
      });
      const result = await response.json();
      if (!response.ok) console.warn('Status update failed:', result?.message);
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Safe helper extraction functions matching the API schema
  const getOrderId = (o) => {
    if (!o) return 'N/A';
    return o.orderUniqueId || o.bookingId || o.orderId || (o._id ? `#${o._id.slice(-6)}` : 'N/A');
  };

  const getCustomerName = (o) => {
    if (!o) return 'Customer';
    const name = o.deliveryAddress?.name || o.customerName || o.customer?.name || o.userId?.name || o.user?.name || o.name;
    if (!name) return 'Customer';
    if (typeof name === 'string') return name;
    if (typeof name === 'object') return String(name.name || 'Customer');
    return String(name);
  };

  const getCustomerPhone = (o) => {
    if (!o) return 'N/A';
    const phone = o.deliveryAddress?.phone || o.customerPhone || o.customer?.phone || o.userId?.phone || o.user?.phone || o.phone;
    if (!phone) return 'N/A';
    if (typeof phone === 'string' || typeof phone === 'number') return String(phone);
    if (typeof phone === 'object') return String(phone.phone || phone.number || 'N/A');
    return String(phone);
  };

  const getCustomerAddress = (o) => {
    if (!o) return 'Self Pickup / In-Store';
    const addr = o.deliveryAddress ?? o.address ?? o.customer?.address ?? o.userId?.address;
    if (!addr) return 'Self Pickup / In-Store';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
      const parts = [
        addr.address,
        addr.landmark,
        addr.city,
        addr.state,
        addr.postalCode
      ].filter(p => typeof p === 'string' && p.trim().length > 0);
      if (parts.length > 0) return parts.join(', ');
      return String(addr.name || addr.phone || 'Address Details');
    }
    return String(addr);
  };

  const getOrderTotal = (o) => {
    if (!o) return '₹0.00';
    const val = o.totalAmount ?? o.grandTotal ?? o.totalPrice ?? o.productTotal ?? o.total ?? 0;
    const num = Number(val) || 0;
    return `₹${num.toFixed(2)}`;
  };

  const getPaymentMethod = (o) => {
    if (!o) return 'CASH';
    const m = o.paymentMethod || o.paymentMode || 'cash';
    return typeof m === 'string' ? m.toUpperCase() : 'CASH';
  };

  const getPaymentStatus = (o) => {
    if (!o) return 'Pending';
    const s = o.paymentStatus || 'pending';
    return typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : String(s);
  };

  const getOrderStatus = (o) => {
    if (!o) return 'pending';
    const s = o.bookingStatus || o.orderStatus || o.status || 'pending';
    const lower = typeof s === 'string' ? s.toLowerCase() : 'pending';
    if (lower === 'cooking' || lower === 'confirmed') return 'preparing';
    return lower;
  };

  const getOrderType = (o) => {
    if (!o) return 'Delivery';
    const t = o.orderType || o.bookingType || o.type || 'delivery';
    if (typeof t === 'string') {
      return t.charAt(0).toUpperCase() + t.slice(1);
    }
    return 'Delivery';
  };

  const getOrderTime = (o) => {
    if (!o) return 'Recent';
    if (o.date && o.time) return `${o.date} • ${o.time}`;
    if (o.logCreatedDate || o.createdAt) {
      try {
        const d = new Date(o.logCreatedDate || o.createdAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString() + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch {}
    }
    return o.time || o.date || 'Recent';
  };

  const getOrderProducts = (o) => {
    if (!o) return [];
    const raw = o.products || o.items || o.orderItems || o.foodItems || o.cart || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((it) => {
      if (!it) return { name: 'Item', qty: 1, price: 0, total: 0, foodType: '' };
      const name = typeof it === 'string'
        ? it
        : (typeof it.name === 'string' ? it.name : it.foodName || it.title || 'Food Item');
      const qty = Number(it.quantity || it.qty || 1);
      const price = Number(it.offerPrice || it.price || 0);
      const total = it.productTotal !== undefined ? Number(it.productTotal) : (qty * price);
      const foodType = it.foodType || '';
      return {
        name: typeof name === 'object' ? String(name.name || 'Food Item') : String(name),
        qty,
        price,
        total,
        foodType
      };
    });
  };

  // Determine overall dietary classification for the order
  const getOrderDietaryType = (o) => {
    const products = getOrderProducts(o);
    if (products.length === 0) return { label: 'General', isVeg: null };

    const hasVeg = products.some(p => (p.foodType || '').toLowerCase().includes('veg') && !(p.foodType || '').toLowerCase().includes('non'));
    const hasNonVeg = products.some(p => (p.foodType || '').toLowerCase().includes('non'));

    if (hasVeg && hasNonVeg) {
      return { label: 'Mixed', isVeg: 'mixed' };
    }
    if (hasNonVeg) {
      return { label: 'Non-Veg', isVeg: false };
    }
    if (hasVeg) {
      return { label: 'Veg', isVeg: true };
    }
    return { label: 'General', isVeg: null };
  };

  const getInvoiceUrl = (invoicePath) => {
    if (!invoicePath) return null;
    if (invoicePath.startsWith('http://') || invoicePath.startsWith('https://')) return invoicePath;
    const clean = invoicePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = URLS.Base || 'http://16.113.133.178:3000/';
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${clean}`;
  };

  // Status Filter Tabs with Accepted, Preparing & Ready added
  const statusTabs = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

  // Filtering
  const filtered = orders.filter(o => {
    const s = getOrderStatus(o);
    const matchesStatus =
      filter === 'All' ||
      (filter === 'Cancelled' ? (s === 'cancelled' || s === 'rejected') : s === filter.toLowerCase());

    const searchLower = search.toLowerCase();
    const idStr = String(getOrderId(o)).toLowerCase();
    const custStr = String(getCustomerName(o)).toLowerCase();
    const phoneStr = String(getCustomerPhone(o)).toLowerCase();
    const addrStr = String(getCustomerAddress(o)).toLowerCase();

    const matchesSearch =
      idStr.includes(searchLower) ||
      custStr.includes(searchLower) ||
      phoneStr.includes(searchLower) ||
      addrStr.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title"><ShoppingCart size={22} color="var(--primary)" /> Real-Time Order Management</h1>
          <p className="page-desc">Process live incoming food bookings, kitchen cooking queues, and courier pickups</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="Refresh bookings"
          >
            <RefreshCw size={15} className={loading ? 'fp-spinner' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

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

      {/* Top Search Bar & Status Filter in Same Line */}
      <div className="card orders-filter-bar">
        <div className="orders-filter-row">
          {/* Search bar on the left */}
          <div className="orders-search-box">
            <Search size={16} className="orders-search-icon" />
            <input
              type="text"
              placeholder="Search by ID, Name, Phone..."
              className="form-input orders-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Tabs on the right in the same line */}
          <div className="orders-tabs-group">
            {statusTabs.map(s => {
              const count = s === 'All'
                ? orders.length
                : orders.filter(x => {
                    const st = getOrderStatus(x);
                    return s === 'Cancelled' ? (st === 'cancelled' || st === 'rejected') : st === s.toLowerCase();
                  }).length;
              const active = filter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`btn btn-sm orders-tab-btn ${active ? 'btn-primary' : 'btn-outline'}`}
                >
                  {s} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="fp-spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>Loading bookings and orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <ShoppingCart size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>No Orders Found</h3>
            <p style={{ fontSize: 13, margin: 0 }}>
              {search || filter !== 'All'
                ? 'No orders match the selected filters.'
                : 'There are no active bookings for your restaurant at the moment.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Ticket</th>
                  <th>Customer & Location</th>
                  <th>Ordered Items</th>
                  <th>Dietary Type</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const orderId = getOrderId(o);
                  const custName = getCustomerName(o);
                  const custPhone = getCustomerPhone(o);
                  const custAddr = getCustomerAddress(o);
                  const total = getOrderTotal(o);
                  const payMethod = getPaymentMethod(o);
                  const payStatus = getPaymentStatus(o);
                  const status = getOrderStatus(o);
                  const time = getOrderTime(o);
                  const products = getOrderProducts(o);
                  const dietary = getOrderDietaryType(o);
                  const invoiceLink = getInvoiceUrl(o.invoice);
                  const mongoId = o._id || o.id || o.bookingId;

                  return (
                    <tr key={mongoId || orderId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <strong style={{ fontSize: 13.5, color: 'var(--primary)' }}>
                            {orderId}
                          </strong>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={11} /> {time}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{custName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{custAddr}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-light)' }}>{custPhone}</div>
                      </td>

                      <td style={{ maxWidth: 260 }}>
                        {products.length === 0 ? (
                          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>-</span>
                        ) : (
                          <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4 }}>
                            {products.slice(0, 3).map((it, i) => (
                              <div key={i}>
                                • {it.qty}x <strong>{it.name}</strong>
                              </div>
                            ))}
                            {products.length > 3 && (
                              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>+{products.length - 3} more items</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Separate Dietary Type Column */}
                      <td>
                        {dietary.isVeg === true && (
                          <span className="badge badge-success">Veg</span>
                        )}
                        {dietary.isVeg === false && (
                          <span className="badge badge-danger">Non-Veg</span>
                        )}
                        {dietary.isVeg === 'mixed' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span className="badge badge-success" style={{ fontSize: 10 }}>Veg</span>
                            <span className="badge badge-danger" style={{ fontSize: 10 }}>Non-Veg</span>
                          </div>
                        )}
                        {dietary.isVeg === null && (
                          <span className="badge badge-muted">-</span>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>{total}</div>
                        <span className="badge badge-info" style={{ fontSize: 10, marginTop: 3 }}>
                          {payMethod} ({payStatus})
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${
                          status === 'pending' ? 'badge-warning' :
                          status === 'accepted' ? 'badge-info' :
                          status === 'preparing' ? 'badge-primary' :
                          status === 'ready' ? 'badge-info' :
                          status === 'delivered' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {status === 'pending' ? '⏳ Pending' :
                           status === 'accepted' ? '🤝 Accepted' :
                           status === 'preparing' ? '🔥 Preparing' :
                           status === 'ready' ? '📦 Ready' :
                           status === 'delivered' ? '✓ Delivered' :
                           status === 'rejected' ? '✕ Rejected' :
                           status === 'cancelled' ? '✕ Cancelled' : status}
                        </span>
                      </td>

                      {/* Actions Column with Equal Length Buttons */}
                      <td>
                        <div className="orders-action-cell">
                          {status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm orders-action-btn orders-btn-icon-only orders-btn-accept"
                                disabled={updatingId === mongoId}
                                title="Accept Incoming Order"
                                onClick={() => handleUpdateStatus(mongoId, 'accepted')}
                              >
                                <Check size={13} />
                              </button>
                              <button
                                className="btn btn-sm btn-danger orders-action-btn orders-btn-icon-only"
                                disabled={updatingId === mongoId}
                                title="Reject Incoming Order"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to reject order ${orderId}?`)) {
                                    handleUpdateStatus(mongoId, 'rejected');
                                  }
                                }}
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}

                          {status === 'accepted' && (
                            <button
                              className="btn btn-sm btn-primary orders-action-btn orders-btn-labeled"
                              disabled={updatingId === mongoId}
                              title="Start Cooking / Preparing in Kitchen"
                              onClick={() => handleUpdateStatus(mongoId, 'preparing')}
                            >
                              <ChefHat size={12} />
                              <span>Prepare</span>
                            </button>
                          )}

                          {status === 'preparing' && (
                            <button
                              className="btn btn-sm btn-primary orders-action-btn orders-btn-labeled orders-btn-ready"
                              disabled={updatingId === mongoId}
                              title="Mark Food Ready for Courier Pickup"
                              onClick={() => handleUpdateStatus(mongoId, 'ready')}
                            >
                              <ChefHat size={12} />
                              <span>Ready</span>
                            </button>
                          )}

                          {status === 'ready' && (
                            <button
                              className="btn btn-sm btn-primary orders-action-btn orders-btn-labeled orders-btn-deliver"
                              disabled={updatingId === mongoId}
                              title="Hand Over Order / Mark Delivered"
                              onClick={() => handleUpdateStatus(mongoId, 'delivered')}
                            >
                              <Bike size={12} />
                              <span>Deliver</span>
                            </button>
                          )}

                          <button
                            className="btn btn-outline btn-sm orders-action-btn orders-btn-icon-only"
                            title="View Full Booking Ticket"
                            onClick={() => handleViewOrder(o)}
                          >
                            <Eye size={13} />
                          </button>

                          {invoiceLink && (
                            <a
                              href={invoiceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm orders-action-btn orders-btn-icon-only"
                              style={{ textDecoration: 'none' }}
                              title="Download Tax Invoice PDF"
                            >
                              <FileText size={12} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            PAGINATION CONTROLS
        ══════════════════════════════════════════════ */}
        {!loading && orders.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderTop: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 13,
            color: '#475569',
          }}>
            {/* Left: Range and Per-page select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span>
                Showing <strong>{totalRecords === 0 ? 0 : (page - 1) * limit + 1}</strong> to <strong>{Math.min(page * limit, totalRecords)}</strong> of <strong>{totalRecords}</strong> orders
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
                disabled={page <= 1 || loading}
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
                    disabled={loading}
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
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Separated View Order Modal Component */}
      <ViewOrder
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        updatingId={updatingId}
        detailLoading={detailLoading}
        detailError={detailError}
      />
    </div>
  );
}
