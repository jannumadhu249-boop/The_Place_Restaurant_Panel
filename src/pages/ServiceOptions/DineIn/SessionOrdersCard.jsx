import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { URLS } from '../../../url';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
  return {
    'Content-Type': 'application/json',
    ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
  };
};

const defaultMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const getPageNumbers = (currentPage, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, '...', total];
  if (currentPage >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', total];
};

const pagerBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '5px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  background: '#fff',
  fontSize: 12.5,
};

// ISO string → "2026-11-19 · 10:41" without constructing a Date during render
const formatOrderTime = (value) => {
  if (!value) return '';
  const str = String(value);
  const datePart = str.slice(0, 10);
  const timePart = str.length > 15 ? str.slice(11, 16) : '';
  return timePart ? `${datePart} · ${timePart}` : datePart;
};

const extractOrders = (data) => {
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

// Backend invoice only — tolerate the few key names the API may use
const normalizeInvoice = (invoice) => {
  if (!invoice || typeof invoice !== 'object') return null;
  const pdfUrl = invoice.pdfUrl || invoice.invoicePdf || invoice.pdf || '';
  const invoiceNumber = invoice.invoiceNumber || invoice.invoiceNo || invoice.number || '';
  if (!pdfUrl && !invoiceNumber) return null;
  return {
    ...invoice,
    pdfUrl,
    invoiceNumber,
    grandTotal: Number(invoice.grandTotal ?? invoice.total ?? 0),
  };
};

const mapOrder = (o) => {
  const booking = o.booking || {};
  return {
    id: o.dineInOrderId || o._id || '',
    orderId: o.orderUniqueId || booking.orderUniqueId || '',
    sessionMongoId: o.session?._id || o.sessionId || '',
    sessionStatus: String(o.session?.status || '').toLowerCase(),
    table: o.table?.tableNumber || o.table?.tableName || '',
    guest: o.session?.customerName || o.customer?.name || booking.customerName || '',
    phone: o.session?.customerPhone || o.customer?.phone || booking.customerPhone || '',
    items: Array.isArray(booking.products) ? booking.products : [],
    status: String(booking.bookingStatus || '').toLowerCase(),
    paymentStatus: String(booking.paymentStatus || '').toLowerCase(),
    paymentMethod: String(booking.paymentMethod || '').toLowerCase(),
    total: Number(o.totalAmount ?? booking.totalAmount ?? 0),
    createdAt: booking.logCreatedDate || o.createdAt || '',
    invoice: normalizeInvoice(o.invoice || o.invoiceData || booking.invoice),
    raw: o,
  };
};

const itemCount = (items) => items.reduce((sum, p) => sum + Number(p.quantity || 0), 0);

// Stable empty reference so the fetch dependency never changes on re-render
const NO_INVOICES = {};

// Single request for all dine-in orders from GET /v1/place/restaurant/dine-in/orders
let inFlightRequest = null;

const requestAllOrders = async () => {
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = (async () => {
    const res = await fetch(URLS.GetDineInOrders, { headers: getAuthHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) return [];
    return extractOrders(data).map(mapOrder);
  })();

  try {
    return await inFlightRequest;
  } finally {
    inFlightRequest = null;
  }
};


export default function SessionOrdersCard({
  sessions = [],
  settledSessionIds = [],
  settledInvoices = NO_INVOICES,
  onSessionSummary,
  onRefresh,
  money = defaultMoney,
}) {
  // Accumulated so a just-settled session keeps its order visible after it leaves the floor list
  const [completedOrders, setCompletedOrders] = useState([]);
  // Orders still open on the floor — explains why the table below is empty
  const [openOrders, setOpenOrders] = useState(0);
  const [openTotal, setOpenTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const [syncingSessionId, setSyncingSessionId] = useState(null);
  // const [syncFeedback, setSyncFeedback] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // Guards against a slow response overwriting a newer one
  const runIdRef = useRef(0);

  const totalCompleted = completedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalCompleted / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCompleted);
  const displayedOrders = completedOrders.slice(startIdx, endIdx);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safePage) return;
    setPage(newPage);
  };

  const tableBySession = useMemo(() => {
    const map = new Map();
    (sessions || []).forEach((s) => {
      const id = s.mongoId || s._id;
      if (id) map.set(String(id), s.table);
    });
    return map;
  }, [sessions]);

  const sessionIdKey = useMemo(
    () =>
      (sessions || [])
        .map((s) => s.mongoId || s._id)
        .filter(Boolean)
        .map(String)
        .join(','),
    [sessions]
  );

  const settledKey = (settledSessionIds || []).map(String).join(',');

  // ── API: DINE-IN ORDERS ──
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');
    runIdRef.current += 1;
    const runId = runIdRef.current;
    try {
      const settledSet = new Set(settledKey ? settledKey.split(',') : []);
      const allOrders = await requestAllOrders();

      if (runId !== runIdRef.current) return;

      // Attach instant checkout invoice to recent orders if present
      allOrders.forEach((o) => {
        if (!o.invoice && o.sessionMongoId && settledInvoices?.[o.sessionMongoId]) {
          o.invoice = normalizeInvoice(settledInvoices[o.sessionMongoId]);
        }
      });

      // Give the active floor sessions the real bill amount and the latest order code
      if (onSessionSummary) {
        const summary = {};
        allOrders.forEach((o) => {
          const sId = String(o.sessionMongoId || '');
          if (!sId) return;
          if (!summary[sId]) {
            summary[sId] = {
              total: 0,
              orderCode: '',
              orderCount: 0,
              orders: [],
              newestDate: '',
            };
          }
          summary[sId].total += o.total;
          summary[sId].orderCount += 1;
          summary[sId].orders.push(o.raw || o);
          const date = String(o.createdAt || '');
          if (!summary[sId].newestDate || date > summary[sId].newestDate) {
            summary[sId].newestDate = date;
            summary[sId].orderCode = o.orderId;
          }
        });
        onSessionSummary(summary);
      }

      const finished = allOrders.filter(
        (o) =>
          Boolean(o.invoice) ||
          o.paymentStatus === 'paid' ||
          o.sessionStatus === 'completed' ||
          settledSet.has(String(o.sessionMongoId))
      );

      const finishedIds = new Set(finished.map((o) => o.id));
      const open = allOrders.filter((o) => !finishedIds.has(o.id));
      setOpenOrders(open.length);
      setOpenTotal(open.reduce((sum, o) => sum + o.total, 0));

      setCompletedOrders(
        finished.sort((a, b) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
        )
      );
    } catch (err) {
      if (runId !== runIdRef.current) return;
      console.warn('Failed to fetch completed dine-in orders:', err);
      setError('Could not load the completed orders. Check your connection and retry.');
    } finally {
      if (runId === runIdRef.current) setIsLoading(false);
    }
  }, [settledKey, settledInvoices, onSessionSummary]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Sync payment status with POST /v1/place/restaurant/dine-in/payments/sync-status
  // const syncPaymentStatus = async (sessionId) => {
  //   if (!sessionId || syncingSessionId) return;
  //   setSyncingSessionId(sessionId);
  //   setSyncFeedback(null);
  //   try {
  //     const res = await fetch(URLS.PaymentStatus, {
  //       method: 'POST',
  //       headers: getAuthHeaders(),
  //       body: JSON.stringify({ sessionId }),
  //     });
  //     const data = await res.json().catch(() => ({}));
  //     if (res.ok && data.status !== false && data.success !== false) {
  //       setSyncFeedback({
  //         sessionId,
  //         text: data.message || 'Payment status synced!',
  //         type: 'success',
  //       });
  //       await fetchOrders();
  //       if (onRefresh) onRefresh();
  //     } else {
  //       setSyncFeedback({
  //         sessionId,
  //         text: data.message || 'Payment status sync failed.',
  //         type: 'error',
  //       });
  //     }
  //   } catch (err) {
  //     console.warn('Payment status sync failed:', err);
  //     setSyncFeedback({
  //       sessionId,
  //       text: 'Network error while syncing status.',
  //       type: 'error',
  //     });
  //   } finally {
  //     setSyncingSessionId(null);
  //     setTimeout(() => setSyncFeedback(null), 4000);
  //   }
  // };

  const handleTopRefresh = async () => {
    await fetchOrders();
    if (onRefresh) onRefresh();
  };

  // Invoice PDF is access-protected — fetch it with the token before opening
  const openInvoice = async (url) => {
    if (!url) return;
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Invoice request failed (${res.status})`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (err) {
      console.warn('Failed to open invoice PDF:', err);
      window.open(url, '_blank', 'noopener');
    }
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <CheckCircle2
              size={17}
              style={{ verticalAlign: 'middle', marginRight: 6, color: '#059669' }}
            />
            Completed Dine-in Orders
          </h2>
          <p style={{ fontSize: 12.5, marginTop: 4, color: '#64748b' }}>
            {completedOrders.length > 0
              ? `${completedOrders.length} settled order${completedOrders.length > 1 ? 's' : ''} from the floor`
              : openOrders > 0
                ? `${openOrders} live order${openOrders > 1 ? 's' : ''} still open — none settled yet`
                : 'Paid & settled orders appear here'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={handleTopRefresh}
          // disabled={isLoading || Boolean(syncingSessionId)}
          title="Refresh completed dine-in orders"
        >
          <RefreshCw size={13} className={isLoading ? 'svc-spin' : ''} />
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="svc-order-state error" role="alert">
          <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>SL.NO</th>
              <th>Table</th>
              <th>Order</th>
              <th>Guest</th>
              <th>Time</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.map((order, index) => {
              const table =
                order.table || tableBySession.get(String(order.sessionMongoId)) || '—';
              // const isSyncing = syncingSessionId === order.sessionMongoId;
              // const hasFeedback = syncFeedback && syncFeedback.sessionId === order.sessionMongoId;

              return (
                <tr key={order.id}>
                  <td>{startIdx + index + 1}</td>
                  <td>
                    <span className="badge badge-primary">{table}</span>
                  </td>
                  <td>
                    <strong>{order.orderId}</strong>
                  </td>
                  <td>{order.guest || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatOrderTime(order.createdAt) || '—'}</td>
                  <td>
                    {order.items.length > 0 ? (
                      <div className="svc-session-order-items">
                        {order.items.map((product, i) => (
                          <span key={`${order.id}-${product.productId || i}`}>
                            {product.quantity} × {product.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`svc-order-status ${order.paymentStatus || 'paid'}`}>
                        {order.paymentStatus || 'paid'}
                      </span>
                      {order.paymentMethod && (
                        <span className="svc-order-status">{order.paymentMethod.toUpperCase()}</span>
                      )}
                      {/* {order.sessionMongoId && (
                        <button
                          type="button"
                          className="svc-sync-btn"
                          onClick={() => syncPaymentStatus(order.sessionMongoId)}
                          disabled={isSyncing}
                          title="Sync live payment status from server"
                        >
                          <RefreshCw size={10} className={isSyncing ? 'svc-spin' : ''} />
                          {isSyncing ? 'Syncing…' : 'Sync'}
                        </button>
                      )} */}
                    </div>
                    {/* {hasFeedback && (
                      <div
                        style={{
                          fontSize: 11,
                          marginTop: 4,
                          fontWeight: 600,
                          color: syncFeedback.type === 'error' ? '#ef4444' : '#10b981',
                        }}
                      >
                        {syncFeedback.text}
                      </div>
                    )} */}
                  </td>
                  <td>
                    <strong>{money(order.total)}</strong>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>
                      {itemCount(order.items)} items
                    </div>
                  </td>
                  <td>
                    {order.invoice ? (
                      order.invoice.pdfUrl ? (
                        <button
                          type="button"
                          className="svc-invoice-link"
                          onClick={() => openInvoice(order.invoice.pdfUrl)}
                          title="Open invoice PDF"
                        >
                          <FileText size={12} />
                          {order.invoice.invoiceNumber || 'Invoice'}
                        </button>
                      ) : (
                        <span className="svc-invoice-link">
                          <FileText size={12} />
                          {order.invoice.invoiceNumber || 'Invoice'}
                        </span>
                      )
                    ) : (
                      <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Not generated</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {completedOrders.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: 'center', padding: '22px 12px', color: '#64748b' }}
                >
                  {isLoading ? (
                    <span>
                      <Loader2
                        size={14}
                        className="svc-spin"
                        style={{ verticalAlign: 'middle', marginRight: 6 }}
                      />
                      Loading completed orders…
                    </span>
                  ) : openOrders > 0 ? (
                    `${openOrders} live order${openOrders > 1 ? 's' : ''} (${money(openTotal)}) still open in Active Floor Sessions — settled orders will be listed here.`
                  ) : (
                    'No completed payments yet — settled orders will be listed here.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCompleted > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e2e8f0',
            padding: '14px 4px',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 8,
          }}
        >
          <div style={{ fontSize: 12.5, color: '#64748b' }}>
            Showing {totalCompleted === 0 ? 0 : startIdx + 1} to {endIdx} of {totalCompleted} completed orders
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1}
              style={{
                ...pagerBtn,
                cursor: safePage === 1 ? 'not-allowed' : 'pointer',
                opacity: safePage === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            {getPageNumbers(safePage, totalPages).map((p, i) => (
              <button
                key={`${p}-${i}`}
                type="button"
                onClick={() => typeof p === 'number' && handlePageChange(p)}
                disabled={p === '...'}
                style={{
                  ...pagerBtn,
                  display: 'inline-block',
                  cursor: p === '...' ? 'default' : 'pointer',
                  background: p === safePage ? 'var(--primary)' : '#fff',
                  color: p === safePage ? '#fff' : 'inherit',
                  fontWeight: p === safePage ? 700 : 400,
                }}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage === totalPages}
              style={{
                ...pagerBtn,
                cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
                opacity: safePage === totalPages ? 0.5 : 1,
              }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
