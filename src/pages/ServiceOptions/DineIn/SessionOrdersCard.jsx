import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Loader2, RefreshCw } from 'lucide-react';
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
  money = defaultMoney,
}) {
  // Accumulated so a just-settled session keeps its order visible after it leaves the floor list
  const [completedOrders, setCompletedOrders] = useState([]);
  // Orders still open on the floor — explains why the table below is empty
  const [openOrders, setOpenOrders] = useState(0);
  const [openTotal, setOpenTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Guards against a slow response overwriting a newer one
  const runIdRef = useRef(0);

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

  // ── API: DINE-IN ORDERS (SINGLE GET /v1/place/restaurant/dine-in/orders) ──
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');
    runIdRef.current += 1;
    const runId = runIdRef.current;
    try {
      const settledSet = new Set(settledKey ? settledKey.split(',') : []);

      // Fetch all dine-in orders in one request
      const allOrders = await requestAllOrders();

      // A newer run already answered — drop this result
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

      // Orders with invoice or marked paid / completed
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
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={fetchOrders}
          disabled={isLoading}
        >
          <RefreshCw size={13} /> Refresh
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
            {completedOrders.map((order,index) => {
              const table =
                order.table || tableBySession.get(String(order.sessionMongoId)) || '—';
              return (
                <tr key={order.id}>
                  <td>{index+1}</td>
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
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <span className={`svc-order-status ${order.paymentStatus || 'paid'}`}>
                        {order.paymentStatus || 'paid'}
                      </span>
                      {order.paymentMethod && (
                        <span className="svc-order-status">{order.paymentMethod.toUpperCase()}</span>
                      )}
                    </div>
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
                  colSpan={8}
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
    </div>
  );
}
