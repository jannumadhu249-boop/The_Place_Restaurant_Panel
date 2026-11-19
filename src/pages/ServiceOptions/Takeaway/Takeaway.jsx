import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock3,
  CheckCircle2,
  Package,
  Plus,
  Search,
  RefreshCw,
  Phone,
  Printer,
  Check,
  AlertCircle,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import '../ServiceOps.css';
import { URLS } from '../../../url';
import TakeawayBillModal from './TakeawayBillModal';
import NewTakeawayOrderModal from './NewTakeawayOrderModal';
import AddItemsModal from './AddItemsModal';
import TakeawayStatsCards from './TakeawayStatsCards';
import RecentCompletionsCard from './RecentCompletionsCard';
import { mapTakeawayOrder, takeawayStatusBadge } from './takeawayOrder';

// Live statuses shown in the pickup queue
const QUEUE_STATUSES = ['queued', 'preparing', 'ready'];
const DEFAULT_PAGE_SIZE = 10;
const STATUS_FETCH_LIMIT = 100;
// Safety net while paging a single status
const STATUS_FETCH_MAX_PAGES = 5;

const extractOrders = (result) => {
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.orders)) return result.orders;
  if (Array.isArray(result.data?.orders)) return result.data.orders;
  if (Array.isArray(result.data?.docs)) return result.data.docs;
  if (Array.isArray(result.docs)) return result.docs;
  if (Array.isArray(result)) return result;
  return [];
};

export default function Takeaway() {
  const [queue, setQueue] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState(['All']);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Pagination for queue
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Bumped whenever a completion may have changed — the completions card re-fetches itself
  const [historyRevision, setHistoryRevision] = useState(0);

  // Status/search the queue was last loaded with — keeps the debounced effect from
  // repeating the initial load (the page already fetches on mount)
  const lastQueryRef = useRef({ status: 'All', search: '' });

  // Modals state
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Add Items to Order Modal State
  const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);
  const [selectedOrderForAddItems, setSelectedOrderForAddItems] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    return {
      'Content-Type': 'application/json',
      ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  };

  // 1. Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetTakeawayCards, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const sum = data?.summary || data?.data?.summary || data?.data || data;
        setDashboardStats(sum);
      }
    } catch (err) {
      console.warn('Takeaway dashboard stats warning:', err);
    }
  }, []);

  // 2. Fetch Food Menu & Active Categories
  const fetchMenuAndCategories = useCallback(async () => {
    try {
      const foodRes = await fetch(URLS.GetFoodMenu, { method: 'GET', headers: getAuthHeaders() });
      let foodsList = [];
      if (foodRes.ok) {
        const foodData = await foodRes.json();
        const list = foodData.data || foodData.menu || foodData.food || foodData.foods || (Array.isArray(foodData) ? foodData : []);
        if (Array.isArray(list)) foodsList = list;
      }

      let catNames = [];
      try {
        const catRes = await fetch(URLS.GetActiveCategories, { method: 'POST', headers: getAuthHeaders() });
        if (catRes.ok) {
          const catData = await catRes.json();
          const clist = catData.category || catData.categories || catData.data || (Array.isArray(catData) ? catData : []);
          if (Array.isArray(clist)) catNames = clist.map((c) => c.name || c.categoryName || '').filter(Boolean);
        }
      } catch {
        try {
          const catRes2 = await fetch(URLS.GetActiveCategories, { method: 'GET', headers: getAuthHeaders() });
          if (catRes2.ok) {
            const catData2 = await catRes2.json();
            const clist2 = catData2.category || catData2.categories || catData2.data || (Array.isArray(catData2) ? catData2 : []);
            if (Array.isArray(clist2)) catNames = clist2.map((c) => c.name || c.categoryName || '').filter(Boolean);
          }
        } catch (err2) {
          console.warn('Categories fallback warning:', err2);
        }
      }

      const mappedFoods = foodsList.map((f, idx) => {
        let cat = 'Biryani';
        if (typeof f.categoryId === 'object' && f.categoryId !== null) {
          cat = f.categoryId.name || f.categoryId.categoryName || 'Main Course';
        } else if (f.category) {
          cat = typeof f.category === 'object' ? (f.category.name || f.category.categoryName) : f.category;
        }
        const displayName = f.dishName || f.name || f.foodName || `Dish ${idx + 1}`;
        const price = Number(f.offerPrice ?? f.regularPrice ?? f.price ?? 0);
        const regularPrice = Number(f.regularPrice ?? f.price ?? price);
        return {
          id: f._id || `food-${idx}`,
          _id: f._id,
          name: displayName,
          dishName: displayName,
          price,
          originalPrice: regularPrice,
          category: cat,
          foodType: f.dietaryType || f.foodType || 'nonvegg',
          image: f.image || '',
          description: f.description || '',
          raw: f,
        };
      });

      setMenuItems(mappedFoods);
      const foodCats = mappedFoods.map((m) => m.category).filter(Boolean);
      const allUniqueCats = ['All', ...new Set([...catNames, ...foodCats])];
      setMenuCategories(allUniqueCats);
    } catch (err) {
      console.warn('Failed to fetch menu items:', err);
    }
  }, []);

  // 3. Fetch Active Coupons
  const fetchActiveCoupons = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetActiveCoupons, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const list = data.coupons || data.data || data.coupon || (Array.isArray(data) ? data : []);
        if (Array.isArray(list)) {
          const mapped = list.map((c) => ({
            code: c.code || c.couponCode || '',
            type: (c.type || c.discountType || 'amount') === 'percentage' ? 'percent' : 'flat',
            value: Number(c.discount || c.value || c.discountValue || 0),
            label: c.type === 'percentage'
              ? `${c.discount || c.value}% OFF`
              : `₹${c.discount || c.value} OFF`,
            _id: c._id,
            description: c.description || '',
          }));
          setActiveCoupons(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch active coupons:', err);
    }
  }, []);

  // 4. Fetch Active Queue Orders
  // The endpoint paginates mixed statuses, so a single page buries live orders behind
  // picked-up ones (page 1 of 19 rows held just 1 active order). It filters only one
  // status at a time, so query each live status, merge, then paginate client-side —
  // the queue then always shows every active order.
  const fetchOrders = useCallback(async (targetPage = 1, targetLimit = 10, statusArg = 'All', searchArg = '') => {
    setIsLoading(true);
    try {
      const statuses =
        statusArg && statusArg !== 'All' ? [statusArg.toLowerCase()] : QUEUE_STATUSES;

      const results = await Promise.all(
        statuses.map(async (status) => {
          const collected = [];
          let pageNo = 1;
          let lastPage = 1;

          do {
            const params = new URLSearchParams({
              page: pageNo,
              limit: STATUS_FETCH_LIMIT,
              status,
            });
            const res = await fetch(`${URLS.GetTakeaway}?${params.toString()}`, {
              headers: getAuthHeaders(),
            });
            if (!res.ok) break;

            const result = await res.json();
            collected.push(...extractOrders(result).map((o, idx) => mapTakeawayOrder(o, idx)));
            lastPage = Math.min(Number(result.totalPages) || 1, STATUS_FETCH_MAX_PAGES);
            pageNo += 1;
          } while (pageNo <= lastPage);

          return collected.filter((o) => o.statusRaw === status);
        })
      );

      // Merge the per-status slices and drop any duplicate order
      const byId = new Map();
      results.flat().forEach((order) => byId.set(order.id, order));
      let activeQueue = Array.from(byId.values());

      // Search runs client-side so it covers the whole queue, not one server page
      const query = searchArg.trim().toLowerCase();
      if (query) {
        activeQueue = activeQueue.filter((o) =>
          [o.id, o.orderUniqueId, o.guest, o.phone].some((value) =>
            String(value || '').toLowerCase().includes(query)
          )
        );
      }

      const total = activeQueue.length;
      const pages = Math.max(1, Math.ceil(total / targetLimit));
      const safePage = Math.min(Math.max(1, targetPage), pages);
      const start = (safePage - 1) * targetLimit;

      setQueue(activeQueue.slice(start, start + targetLimit));
      setTotalOrders(total);
      setTotalPages(pages);
      setPage(safePage);
    } catch (err) {
      console.warn('Failed to fetch takeaway orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchDashboardStats();
    fetchMenuAndCategories();
    fetchActiveCoupons();
    fetchOrders(1, DEFAULT_PAGE_SIZE, 'All', '');
  }, [fetchDashboardStats, fetchMenuAndCategories, fetchActiveCoupons, fetchOrders]);

  // Debounced search + filter: re-fetch from server when search or status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        lastQueryRef.current.status === statusFilter &&
        lastQueryRef.current.search === search
      ) {
        return;
      }
      lastQueryRef.current = { status: statusFilter, search };
      setPage(1);
      fetchOrders(1, limit, statusFilter, search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, statusFilter, limit, fetchOrders]);

  const handleQueuePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchOrders(newPage, limit, statusFilter, search);
  };

  const getPageNumbers = (currentPage, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', total];
    if (currentPage >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', total];
  };

  // Toggle Takeaway Enabled / Disabled
  const handleToggleService = async () => {
    const nextState = !enabled;
    setEnabled(nextState);
    try {
      const res = await fetch(URLS.EnableTakeaway, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isTakeawayEnabled: nextState }),
      });
      if (res.ok) {
        showToast(
          nextState ? '✓ Takeaway service is now ENABLED' : 'Takeaway service is now DISABLED',
          nextState ? 'success' : 'error'
        );
      } else {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.message || 'Failed to update service status.', 'error');
      }
    } catch (err) {
      console.error('Error toggling takeaway status:', err);
      showToast('Network error while toggling service.', 'error');
    }
  };

  // Dynamic Dashboard Stats from backend summary response
  const stats = useMemo(() => {
    if (dashboardStats) {
      const orderStatus = dashboardStats.orderStatus || {};
      const queuedCount = Number(orderStatus.queued ?? dashboardStats.queued ?? 0);
      const prepCount = Number(orderStatus.preparing ?? dashboardStats.preparing ?? 0);
      const readyCount = Number(orderStatus.ready ?? dashboardStats.ready ?? 0);
      const openCount = queuedCount + prepCount + readyCount;
      const revenue = Number(dashboardStats.todayRevenue ?? dashboardStats.revenue ?? 0);
      return { open: openCount, preparing: prepCount, ready: readyCount, queued: queuedCount, revenue };
    }
    const ready = queue.filter((o) => o.status === 'Ready').length;
    const preparing = queue.filter((o) => o.status === 'Preparing').length;
    const queued = queue.filter((o) => o.status === 'Queued').length;
    return { ready, preparing, queued, revenue: 0, open: queue.length };
  }, [queue, dashboardStats]);

  const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const avatarColor = (status) => {
    if (status === 'Ready') return { bg: '#ecfdf5', color: '#059669' };
    if (status === 'Preparing') return { bg: '#fff7ed', color: '#ea580c' };
    return { bg: '#eff6ff', color: '#2563eb' };
  };

  // Open Bill / Receipt Modal & Fetch Live Invoice
  const openBillModal = async (order) => {
    setSelectedOrderForBill(order);
    setInvoiceData(null);
    setIsBillModalOpen(true);

    // If order already contains invoice from the GET orders API
    if (order.invoicePdfPath || order.invoicePdfDownloadUrl || order.invoice) {
      setInvoiceData({
        invoicePdfPath: order.invoicePdfPath,
        invoicePdfDownloadUrl: order.invoicePdfDownloadUrl,
        invoiceNumber: order.invoiceNumber,
        invoicePath: order.invoicePdfPath || order.invoicePdfDownloadUrl || order.invoice,
        ...order.raw,
      });
      setIsLoadingInvoice(false);
      return;
    }

    setIsLoadingInvoice(true);

    try {
      const targetId = order.mongoId || order._id || order.id;
      const res = await fetch(`${URLS.GetInvoice}${targetId}/invoice`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        // data can have data, invoice, invoicePath, or be data directly
        const invPayload = data.data || data.invoice || data;
        setInvoiceData(invPayload);
      } else {
        setInvoiceData(null);
      }
    } catch {
      setInvoiceData(null);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  // Handle Order Created -> auto open bill
  const handleOrderCreatedSuccess = (result, createdOrderData) => {
    fetchOrders(1, limit, statusFilter, search);
    fetchDashboardStats();
    setHistoryRevision((n) => n + 1);
    showToast(`✓ Takeaway order created for ${createdOrderData.guest}!`);
    setSelectedOrderForBill(createdOrderData);
    // If backend already returned invoice or invoicePath in create response:
    const invoiceFromCreate = result?.invoice || result?.invoicePath || result?.data?.invoice || result?.data?.invoicePath || null;
    if (invoiceFromCreate) {
      setInvoiceData(typeof invoiceFromCreate === 'object' ? invoiceFromCreate : { invoicePath: invoiceFromCreate });
    } else {
      setInvoiceData(null);
      // Fetch invoice immediately
      if (createdOrderData.mongoId || createdOrderData._id) {
        openBillModal(createdOrderData);
        return;
      }
    }
    setIsBillModalOpen(true);
  };

  // Handle Order Updated from Add Items Modal -> auto open updated bill
  const handleOrderUpdatedSuccess = (updatedOrder) => {
    fetchOrders(page, limit, statusFilter, search);
    fetchDashboardStats();
    showToast(`✓ Items added to order ${updatedOrder.id}!`);
    setSelectedOrderForBill(updatedOrder);
    setInvoiceData(null);
    setIsBillModalOpen(true);
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, targetStatus) => {
    const target = queue.find((o) => o.id === orderId || o.mongoId === orderId);
    const targetId = target?.mongoId || target?._id || orderId;

    try {
      const res = await fetch(`${URLS.UpdateTakeawayStatus}${targetId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: targetStatus }),
      });
      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        const label =
          targetStatus === 'preparing' ? 'Preparing'
            : targetStatus === 'ready' ? 'Ready for Pickup'
              : targetStatus === 'picked_up' ? 'Picked Up'
                : targetStatus;
        showToast(`✓ Order ${target?.id || orderId} → "${label}"`);
        fetchOrders(page, limit, statusFilter, search);
        fetchDashboardStats();
        setHistoryRevision((n) => n + 1);
      } else {
        showToast(result.message || `Failed to update status.`, 'error');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Network error while updating status.', 'error');
    }
  };

  const queueStartItem = (page - 1) * limit + 1;
  const queueEndItem = Math.min(page * limit, totalOrders);

  return (
    <div className="svc-page-shell">
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Takeaway</h1>
          <p className="page-subtitle">Pickup queue, order processing, and customer takeaways</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              fetchOrders(1, limit, statusFilter, search);
              fetchDashboardStats();
              fetchMenuAndCategories();
              fetchActiveCoupons();
              setHistoryRevision((n) => n + 1);
              showToast('Refreshed takeaway data!');
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsNewOrderModalOpen(true)}
          >
            <Plus size={16} /> New Takeaway Order
          </button>
        </div>
      </div>

      {/* Enable / Toggle Banner */}
      <div className="svc-toggle-row">
        <div className="svc-toggle-meta">
          <div className="svc-toggle-title">Takeaway / pickup service</div>
          <div className="svc-toggle-desc">
            When off, customers cannot place new pickup orders. Existing queue can still be fulfilled.
          </div>
        </div>
        <button
          type="button"
          className={`svc-switch ${enabled ? 'on' : ''}`}
          aria-pressed={enabled}
          onClick={handleToggleService}
          title={enabled ? 'Takeaway Enabled' : 'Takeaway Disabled'}
        >
          <span className="svc-switch-knob" />
        </button>
      </div>

      {/* Stats Cards */}
      <TakeawayStatsCards
        summary={dashboardStats}
        loading={isLoading}
        money={money}
      />

      {/* Pickup Queue Card */}
      <div className="card" style={{ marginBottom: 24, width: '100%' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="card-title">Pickup Queue</h2>
            {/* Live status counts — click a badge to filter the queue */}
            <div className="svc-queue-filter-badges">
              {[
                { key: 'Queued', count: stats.queued },
                { key: 'Preparing', count: stats.preparing },
                { key: 'Ready', count: stats.ready },
              ].map(({ key, count }) => {
                const active = statusFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`svc-filter-badge ${key.toLowerCase()} ${active ? 'active' : ''}`}
                    onClick={() => setStatusFilter(active ? 'All' : key)}
                    title={active ? 'Show all statuses' : `Show only ${key.toLowerCase()} orders`}
                    aria-pressed={active}
                  >
                    {key}
                    <span className="svc-filter-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '7px 16px' }}
            onClick={() => setIsNewOrderModalOpen(true)}
          >
            <Plus size={15} /> New Takeaway Order
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <div className="svc-input-with-icon" style={{ width: 260, maxWidth: '100%' }}>
            <Search size={15} className="svc-input-icon" />
            <input
              className="form-control"
              placeholder="Search by order ID, name, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 12.5 }}
            />
          </div>
          <div style={{ width: 130 }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: 12.5 }}
            >
              <option value="All">All Statuses</option>
              <option value="Queued">Queued</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
            </select>
          </div>
          <div style={{ width: 70 }}>
            <select
              className="form-control"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); fetchOrders(1, Number(e.target.value), statusFilter, search); }}
              style={{ fontSize: 12.5 }}
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="svc-queue-list">
          {isLoading && queue.length === 0 && (
            <div style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={22} className="spin" style={{ marginBottom: 10 }} />
              <div>Loading takeaway orders…</div>
            </div>
          )}

          {queue.map((o) => {
            const pal = avatarColor(o.status);
            return (
              <div key={o.id} className="svc-queue-card">
                {/* Left Side: Avatar + Customer Details */}
                <div className="svc-queue-left">
                  <div className="svc-queue-avatar" style={{ background: pal.bg, color: pal.color }}>
                    {(o.guest || 'G').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="svc-queue-info">
                    <div className="svc-queue-name">
                      <span>{o.guest}</span>
                      <span className="svc-order-id-badge">{o.id}</span>
                    </div>
                    <div className="svc-queue-meta">
                      <span className="svc-meta-pill">{o.items} items</span>
                      <span className="svc-meta-pill amount">{money(o.total)}</span>
                      <span className="svc-meta-pill payment">{o.payment}</span>
                      {Array.isArray(o.itemsList) && o.itemsList.length > 0 && (
                        <span className="svc-dishes-text" title={o.itemsList.map((it) => `${it.qty}x ${it.dishName || it.name}`).join(', ')}>
                          [{o.itemsList.map((it) => `${it.qty}x ${it.dishName || it.name}`).join(', ')}]
                        </span>
                      )}
                    </div>
                    {o.phone && (
                      <div className="svc-queue-phone">
                        <Phone size={11} />
                        <span>{o.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="svc-queue-actions">
                  <span className={`badge ${takeawayStatusBadge(o.status)}`}>{o.status}</span>

                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: 12.5, padding: '7px 12px' }}
                    onClick={() => openBillModal(o)}
                    title="View & Print Bill"
                  >
                    <Printer size={13} /> Bill
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: 12.5, padding: '7px 13px', borderColor: '#3b82f6', color: '#2563eb' }}
                    onClick={() => { setSelectedOrderForAddItems(o); setIsAddItemsModalOpen(true); }}
                    title="Add More Items to this Order"
                  >
                    <PlusCircle size={13} /> Add Items
                  </button>

                  {o.status === 'Queued' && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12.5, padding: '7px 16px', borderColor: '#f97316', color: '#ea580c' }}
                      onClick={() => handleUpdateOrderStatus(o.id, 'preparing')}
                    >
                      <Clock3 size={14} /> Prepare
                    </button>
                  )}
                  {o.status === 'Preparing' && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12.5, padding: '7px 16px', borderColor: '#10b981', color: '#059669' }}
                      onClick={() => handleUpdateOrderStatus(o.id, 'ready')}
                    >
                      <Check size={14} /> Ready
                    </button>
                  )}
                  {o.status === 'Ready' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: 12.5, padding: '7px 18px' }}
                      onClick={() => handleUpdateOrderStatus(o.id, 'picked_up')}
                    >
                      <Package size={14} /> Hand Over
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!isLoading && queue.length === 0 && (
            <div style={{ padding: 36, textAlign: 'center', color: '#64748b', fontSize: 13.5, background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
              {totalOrders === 0 ? 'No active orders in the takeaway pickup queue.' : 'No takeaway orders matching your criteria.'}
            </div>
          )}
        </div>

        {/* Queue Pagination */}
        {totalOrders > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', padding: '14px 4px', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            <div style={{ fontSize: 12.5, color: '#64748b' }}>
              Showing {totalOrders === 0 ? 0 : queueStartItem} to {queueEndItem} of {totalOrders} orders
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => handleQueuePageChange(page - 1)}
                disabled={page === 1}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontSize: 12.5 }}
              >
                <ChevronLeft size={13} /> Prev
              </button>
              {getPageNumbers(page, totalPages).map((p, i) => (
                <button
                  key={i}
                  onClick={() => typeof p === 'number' && handleQueuePageChange(p)}
                  disabled={p === '...'}
                  style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12.5, cursor: p === '...' ? 'default' : 'pointer', background: p === page ? 'var(--primary)' : '#fff', color: p === page ? '#fff' : 'inherit', fontWeight: p === page ? 700 : 400 }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handleQueuePageChange(page + 1)}
                disabled={page === totalPages}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontSize: 12.5 }}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Completions — owns its own fetch, pagination and refresh */}
      <RecentCompletionsCard
        onViewBill={openBillModal}
        refreshKey={historyRevision}
        money={money}
      />

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* Takeaway Bill / Receipt Modal */}
      <TakeawayBillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setSelectedOrderForBill(null);
          setInvoiceData(null);
        }}
        order={selectedOrderForBill}
        invoiceData={invoiceData}
        isLoadingInvoice={isLoadingInvoice}
        packingFee={15}
        money={money}
        onPrint={() => {
          showToast('Printing takeaway receipt…');
          setTimeout(() => window.print(), 250);
        }}
      />

      {/* New Takeaway Order Modal */}
      <NewTakeawayOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        menuItems={menuItems}
        menuCategories={menuCategories}
        packingFee={15}
        money={money}
        onOrderSuccess={handleOrderCreatedSuccess}
      />

      {/* Add Items to Existing Order Modal */}
      <AddItemsModal
        isOpen={isAddItemsModalOpen}
        onClose={() => {
          setIsAddItemsModalOpen(false);
          setSelectedOrderForAddItems(null);
        }}
        order={selectedOrderForAddItems}
        menuItems={menuItems}
        menuCategories={menuCategories}
        money={money}
        onUpdateSuccess={handleOrderUpdatedSuccess}
      />

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
