import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  Check,
  ChefHat,
  Bike,
  RefreshCw,
  FileText,
  Phone,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { URLS } from '../../url';
import './Orders.css';

export default function ViewOrder({
  order: propOrder,
  isOpen = true,
  onClose,
  onUpdateStatus,
  updatingId,
  detailLoading = false,
  detailError = ''
}) {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(propOrder || null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState('');

  // Synchronize with propOrder when passed
  useEffect(() => {
    if (propOrder) {
      setOrder(propOrder);
    }
  }, [propOrder]);

  // If routed directly via URL (/orders/view/:id), fetch the order details
  useEffect(() => {
    if (!propOrder && routeId) {
      const fetchOrderById = async () => {
        setInternalLoading(true);
        setInternalError('');
        try {
          const token = localStorage.getItem('token');
          const getByIdUrl = `${URLS.GetByIdOrder.endsWith('/') ? URLS.GetByIdOrder : `${URLS.GetByIdOrder}/`}${routeId}`;
          const response = await fetch(getByIdUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          const result = await response.json();
          if (response.ok && (result.success || result.data || result.booking)) {
            setOrder(result.data || result.booking || result.order || result);
          } else {
            setInternalError(result.message || 'Failed to load booking details.');
          }
        } catch (err) {
          console.error('Error fetching order by ID:', err);
          setInternalError('Unable to connect to server to load order.');
        } finally {
          setInternalLoading(false);
        }
      };

      fetchOrderById();
    }
  }, [propOrder, routeId]);

  if (!isOpen && !routeId) return null;
  if (!order && !internalLoading && !detailLoading && !internalError && !detailError) {
    return null;
  }

  // Safe extraction helpers
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

  const getInvoiceUrl = (invoicePath) => {
    if (!invoicePath) return null;
    if (invoicePath.startsWith('http://') || invoicePath.startsWith('https://')) return invoicePath;
    const clean = invoicePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = URLS.Base || 'http://16.113.133.178:3000/';
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${clean}`;
  };

  const currentOrderId = order?._id || order?.id || order?.bookingId || routeId;
  const currentStatus = getOrderStatus(order);
  const isLoading = detailLoading || internalLoading;
  const errorMessage = detailError || internalError;

  const handleStatusAction = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(currentOrderId, newStatus);
    } else {
      // Internal update if used independently
      setOrder(prev => prev ? { ...prev, bookingStatus: newStatus } : prev);
      const token = localStorage.getItem('token');
      fetch(URLS.UpdateBookingStatus, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          bookingId: currentOrderId,
          bookingStatus: newStatus
        })
      }).catch(err => console.warn('Status update warning:', err));
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/orders');
    }
  };

  const modalContent = (
    <div className="modal-card view-order-card">
      {/* Header */}
      <div className="modal-header">
        <div className="view-order-header">
          <div>
            <h3 className="view-order-title">
              Order Details: {getOrderId(order)}
            </h3>
            <span className="view-order-subtitle">
              {getOrderTime(order)} • Channel: {getOrderType(order)}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="view-order-close-btn"
            title="Close view"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="modal-body">
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            <RefreshCw size={16} className="fp-spinner" style={{ display: 'inline-block', marginRight: 6 }} />
            Fetching complete booking ticket...
          </div>
        )}

        {errorMessage && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: 10, borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>
            {errorMessage}
          </div>
        )}

        {order && (
          <>
            {/* Customer & Delivery Information Card */}
            <div className="view-order-customer-box">
              <div className="view-order-customer-name">
                {getCustomerName(order)}
              </div>
              <div className="view-order-detail-row">
                <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{getCustomerAddress(order)}</span>
              </div>
              <div className="view-order-detail-row">
                <Phone size={14} />
                <span>{getCustomerPhone(order)}</span>
              </div>
              {order.notes && (
                <div className="view-order-notes-box">
                  <strong>Kitchen Special Request:</strong> {order.notes}
                </div>
              )}
            </div>

            {/* Ordered Products Itemized Bill */}
            <div className="view-order-items-header">
              <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>Itemized Food Bill</h4>
              <span className={`badge ${
                currentStatus === 'delivered' ? 'badge-success' :
                currentStatus === 'ready' ? 'badge-info' :
                currentStatus === 'preparing' ? 'badge-primary' :
                currentStatus === 'accepted' ? 'badge-info' :
                (currentStatus === 'cancelled' || currentStatus === 'rejected') ? 'badge-danger' : 'badge-warning'
              }`}>
                Status: {currentStatus.toUpperCase()}
              </span>
            </div>

            <div className="view-order-items-box">
              {getOrderProducts(order).length === 0 ? (
                <div style={{ padding: 14, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No items in this booking.
                </div>
              ) : (
                getOrderProducts(order).map((it, idx) => (
                  <div key={idx} className="view-order-item-row">
                    <div>
                      <strong>{it.qty}x {it.name}</strong>
                      {it.foodType && (
                        <span className={`view-order-item-dietary ${it.foodType.toLowerCase().includes('non') ? 'non-veg' : 'veg'}`}>
                          {it.foodType.toLowerCase().includes('non') ? '🍗 Non-Veg' : '🌱 Veg'}
                        </span>
                      )}
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        @ ₹{it.price} each
                      </div>
                    </div>
                    <strong>₹{it.total.toFixed(2)}</strong>
                  </div>
                ))
              )}
            </div>

            {/* Bill Financial Breakdown */}
            <div className="view-order-financial-box">
              <div className="view-order-financial-row">
                <span>Item Subtotal:</span>
                <span>₹{Number(order.productTotal || 0).toFixed(2)}</span>
              </div>
              {Number(order.discountAmount || 0) > 0 && (
                <div className="view-order-financial-row" style={{ color: 'var(--success)' }}>
                  <span>Discount:</span>
                  <span>-₹{Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              {Number(order.deliveryCharge || 0) > 0 && (
                <div className="view-order-financial-row">
                  <span>Delivery Charge:</span>
                  <span>₹{Number(order.deliveryCharge).toFixed(2)}</span>
                </div>
              )}
              {Number(order.taxAmount || 0) > 0 && (
                <div className="view-order-financial-row">
                  <span>Taxes:</span>
                  <span>₹{Number(order.taxAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="view-order-financial-total">
                <span>Grand Total:</span>
                <span style={{ color: 'var(--primary)' }}>{getOrderTotal(order)}</span>
              </div>
            </div>

            {/* Payment Meta Info & Tax Invoice Link */}
            <div className="view-order-meta-row">
              <span>
                Payment Mode: <strong>{getPaymentMethod(order)}</strong> ({getPaymentStatus(order)})
              </span>
              {order.invoice && (
                <a
                  href={getInvoiceUrl(order.invoice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                >
                  <FileText size={13} /> View Invoice PDF
                </a>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="modal-footer">
        <div className="view-order-footer">
          <div className="view-order-footer-actions">
            {currentStatus === 'pending' && (
              <>
                <button
                  className="btn btn-primary"
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                  disabled={updatingId === currentOrderId}
                  onClick={() => handleStatusAction('accepted')}
                >
                  <Check size={14} /> Accept Order
                </button>
                <button
                  className="btn btn-danger"
                  disabled={updatingId === currentOrderId}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reject this order?')) {
                      handleStatusAction('rejected');
                    }
                  }}
                >
                  <X size={14} /> Reject
                </button>
              </>
            )}

            {currentStatus === 'accepted' && (
              <button
                className="btn btn-primary"
                disabled={updatingId === currentOrderId}
                onClick={() => handleStatusAction('preparing')}
              >
                <ChefHat size={14} /> Start Preparing
              </button>
            )}

            {currentStatus === 'preparing' && (
              <button
                className="btn btn-primary"
                style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
                disabled={updatingId === currentOrderId}
                onClick={() => handleStatusAction('ready')}
              >
                <ChefHat size={14} /> Mark Ready & Packed
              </button>
            )}

            {currentStatus === 'ready' && (
              <button
                className="btn btn-primary"
                style={{ background: '#10b981', borderColor: '#10b981' }}
                disabled={updatingId === currentOrderId}
                onClick={() => handleStatusAction('delivered')}
              >
                <Bike size={14} /> Confirm Handover / Delivered
              </button>
            )}
          </div>

          <button className="btn btn-outline" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // If routed standalone as a page view
  if (routeId && !propOrder) {
    return (
      <div className="orders-page" style={{ maxWidth: 720, margin: '0 auto', padding: '20px 0' }}>
        <button
          onClick={handleClose}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {modalContent}
        </div>
      </div>
    );
  }

  // Modal overlay mode
  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) handleClose();
    }}>
      {modalContent}
    </div>
  );
}
