import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { URLS } from '../../../url';
import { mapTakeawayOrder, takeawayStatusBadge } from './takeawayOrder';

const defaultMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
  return {
    'Content-Type': 'application/json',
    ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
  };
};

const ACTIVE_STATUSES = ['Queued', 'Preparing', 'Ready'];
const COMPLETED_STATUSES = ['Picked up', 'Cancelled'];

const extractOrders = (result) => {
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.orders)) return result.orders;
  if (Array.isArray(result.data?.orders)) return result.data.orders;
  if (Array.isArray(result.docs)) return result.docs;
  if (Array.isArray(result.data?.docs)) return result.data.docs;
  if (Array.isArray(result)) return result;
  return [];
};

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

export default function RecentCompletionsCard({
  onViewBill,
  onRefresh,
  refreshKey = 0,
  pageSize = 10,
  money = defaultMoney,
}) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Guards against a slow response overwriting a newer one
  const runIdRef = useRef(0);

  // ── API: COMPLETED (picked up / cancelled) TAKEAWAY ORDERS ────────
  const fetchCompletions = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setError('');
      runIdRef.current += 1;
      const runId = runIdRef.current;

      try {
        const params = new URLSearchParams({
          page: targetPage,
          limit: pageSize,
          status: 'picked_up',
          _t: Date.now(),
        });
        const res = await fetch(`${URLS.GetTakeaway}?${params.toString()}`, {
          headers: getAuthHeaders(),
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const result = await res.json();
        if (runId !== runIdRef.current) return;

        const rawOrders = extractOrders(result);
        const completed = rawOrders
          .map((o, idx) => mapTakeawayOrder(o, idx))
          .filter(
            (o) => COMPLETED_STATUSES.includes(o.status) || !ACTIVE_STATUSES.includes(o.status)
          );

        // Backend may or may not paginate / filter — handle both shapes
        const pg = result.pagination || result.meta || result.data?.pagination || {};
        const isServerPaginated =
          pg.totalRecords !== undefined ||
          pg.total !== undefined ||
          pg.totalPages !== undefined ||
          result.total !== undefined ||
          result.totalPages !== undefined;

        if (isServerPaginated && rawOrders.length === completed.length) {
          const total = Number(pg.totalRecords ?? pg.total ?? result.total ?? completed.length);
          setOrders(completed);
          setTotalOrders(total);
          setTotalPages(
            Math.max(1, Number(pg.totalPages ?? result.totalPages ?? Math.ceil(total / pageSize)))
          );
          setPage(Number(pg.currentPage ?? pg.page ?? result.currentPage ?? targetPage));
        } else {
          // Unpaginated payload — slice the requested window client-side
          const total = completed.length;
          const pages = Math.max(1, Math.ceil(total / pageSize));
          const safePage = Math.min(Math.max(1, targetPage), pages);
          const start = (safePage - 1) * pageSize;
          setOrders(completed.slice(start, start + pageSize));
          setTotalOrders(total);
          setTotalPages(pages);
          setPage(safePage);
        }
      } catch (err) {
        if (runId !== runIdRef.current) return;
        console.warn('Failed to fetch recent completions:', err);
        setError('Could not load recent completions. Check your connection and retry.');
      } finally {
        if (runId === runIdRef.current) setIsLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchCompletions(page);
  }, [fetchCompletions, page, refreshKey]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
  };

  const handleRefresh = async () => {
    await fetchCompletions(page);
    if (onRefresh) onRefresh();
  };

  const startItem = totalOrders === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalOrders);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <CheckCircle2
              size={17}
              style={{ verticalAlign: 'middle', marginRight: 6, color: '#059669' }}
            />
            Recent Completions
          </h2>
          <p style={{ fontSize: 12.5, marginTop: 4, color: '#64748b' }}>
            {totalOrders > 0
              ? `${totalOrders} picked up / completed order${totalOrders > 1 ? 's' : ''}`
              : 'Picked up and completed orders'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh recent completions"
        >
          <RefreshCw size={13} className={isLoading ? 'svc-spin' : ''} />
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: 12.5,
          }}
        >
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>SL.NO</th>
              <th>Order</th>
              <th>Guest</th>
              <th>Items</th>
              <th>Time</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th>Status</th>
              <th>Bill</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((h, index) => (
              <tr key={h.id}>
                <td>{(page - 1) * pageSize + index + 1}</td>
                <td>
                  <strong>{h.id}</strong>
                </td>
                <td>
                  <strong>{h.guest}</strong>
                </td>
                <td>{h.items} items</td>
                <td>{h.time}</td>
                <td>
                  <span className="badge badge-muted">{h.payment}</span>
                </td>
                <td>
                  <strong>{money(h.total)}</strong>
                </td>
                <td>
                  <span
                    className={`badge ${h.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`}
                  >
                    {h.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`badge ${takeawayStatusBadge(h.status)}`}>{h.status}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: 11.5, padding: '4px 10px' }}
                    onClick={() => onViewBill?.(h)}
                    title="View Receipt"
                  >
                    <Printer size={12} /> Bill
                  </button>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                  {isLoading ? (
                    <span>
                      <RefreshCw
                        size={14}
                        className="spin"
                        style={{ verticalAlign: 'middle', marginRight: 6 }}
                      />
                      Loading completed orders…
                    </span>
                  ) : (
                    'No completed takeaway orders yet.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalOrders > 0 && (
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
            Showing {startItem} to {endItem} of {totalOrders} completed orders
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={{
                ...pagerBtn,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            {getPageNumbers(page, totalPages).map((p, i) => (
              <button
                key={`${p}-${i}`}
                type="button"
                onClick={() => typeof p === 'number' && handlePageChange(p)}
                disabled={p === '...'}
                style={{
                  ...pagerBtn,
                  display: 'inline-block',
                  cursor: p === '...' ? 'default' : 'pointer',
                  background: p === page ? 'var(--primary)' : '#fff',
                  color: p === page ? '#fff' : 'inherit',
                  fontWeight: p === page ? 700 : 400,
                }}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              style={{
                ...pagerBtn,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.5 : 1,
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
