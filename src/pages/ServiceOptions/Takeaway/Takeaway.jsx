import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
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
} from 'lucide-react';
import '../ServiceOps.css';
import { URLS } from '../../../url';
// import TakeawayConfigModal from './TakeawayConfigModal';
import TakeawayBillModal from './TakeawayBillModal';
import NewTakeawayOrderModal from './NewTakeawayOrderModal';
import AddItemsModal from './AddItemsModal';

const AVAILABLE_COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, label: '10% OFF' },
  { code: 'FLAT50', type: 'flat', value: 50, label: '₹50 OFF' },
  { code: 'TAKEAWAY20', type: 'percent', value: 20, label: '20% OFF' },
];

export default function Takeaway() {
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState(['All']);
  const [enabled, setEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Modals state
  // const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
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

  // 1. Fetch Dashboard Stats (GET /v1/place/restaurant/takeaway/dashboard/summary)
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetTakeawayCards, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const sum = data?.summary || data?.data?.summary || data?.data || data;
        setDashboardStats(sum);
      }
    } catch (err) {
      console.warn('Takeaway dashboard stats warning:', err);
    }
  }, []);

  // 2. Fetch Food Menu & Active Categories (GetFoodMenu & GetActiveCategories)
  const fetchMenuAndCategories = useCallback(async () => {
    try {
      // Fetch Foods
      const foodRes = await fetch(URLS.GetFoodMenu, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      let foodsList = [];
      if (foodRes.ok) {
        const foodData = await foodRes.json();
        const list = foodData.data || foodData.menu || foodData.food || foodData.foods || (Array.isArray(foodData) ? foodData : []);
        if (Array.isArray(list)) foodsList = list;
      }

      // Fetch Categories
      let catNames = [];
      try {
        const catRes = await fetch(URLS.GetActiveCategories, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          const clist = catData.category || catData.categories || catData.data || (Array.isArray(catData) ? catData : []);
          if (Array.isArray(clist)) {
            catNames = clist.map((c) => c.name || c.categoryName || '').filter(Boolean);
          }
        }
      } catch (e) {
        try {
          const catRes2 = await fetch(URLS.GetActiveCategories, {
            method: 'GET',
            headers: getAuthHeaders(),
          });
          if (catRes2.ok) {
            const catData2 = await catRes2.json();
            const clist2 = catData2.category || catData2.categories || catData2.data || (Array.isArray(catData2) ? catData2 : []);
            if (Array.isArray(clist2)) {
              catNames = clist2.map((c) => c.name || c.categoryName || '').filter(Boolean);
            }
          }
        } catch (err2) {
          console.warn('Categories fallback warning:', err2);
        }
      }

      // Parse Menu Items: map dishName, price, category
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

      // Collect categories: Combine API category list with distinct categories from food items
      const foodCats = mappedFoods.map((m) => m.category).filter(Boolean);
      const allUniqueCats = ['All', ...new Set([...catNames, ...foodCats])];
      setMenuCategories(allUniqueCats);
    } catch (err) {
      console.warn('Failed to fetch menu items:', err);
    }
  }, []);

  // 3. Fetch Takeaway Orders (GET /v1/place/restaurant/takeaway/orders)
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(URLS.GetTakeaway, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();

      let rawOrders = [];
      if (Array.isArray(result.data)) rawOrders = result.data;
      else if (Array.isArray(result.orders)) rawOrders = result.orders;
      else if (Array.isArray(result.data?.orders)) rawOrders = result.data.orders;
      else if (Array.isArray(result.data?.docs)) rawOrders = result.data.docs;
      else if (Array.isArray(result.docs)) rawOrders = result.docs;
      else if (Array.isArray(result)) rawOrders = result;

      const mapped = rawOrders.map((o, idx) => {
        const statusRaw = String(o.status || 'queued').toLowerCase();
        let displayStatus = 'Queued';
        if (statusRaw === 'preparing') displayStatus = 'Preparing';
        else if (statusRaw === 'ready') displayStatus = 'Ready';
        else if (statusRaw === 'picked_up' || statusRaw === 'completed') displayStatus = 'Picked up';
        else if (statusRaw === 'cancelled') displayStatus = 'Cancelled';

        const itemsCount = Array.isArray(o.items)
          ? o.items.reduce((sum, it) => sum + Number(it.quantity || it.qty || 1), 0)
          : Number(o.itemsCount || o.items || 1);

        const itemsList = Array.isArray(o.items)
          ? o.items.map((it) => {
            const pName = typeof it.productId === 'object' && it.productId !== null
              ? (it.productId.dishName || it.productId.name)
              : it.name || it.productName || it.dishName || 'Dish';
            const pPrice = typeof it.productId === 'object' && it.productId !== null
              ? (it.productId.offerPrice ?? it.productId.regularPrice ?? it.productId.price ?? 0)
              : it.price || 0;
            const q = Number(it.quantity || it.qty || 1);
            return {
              name: pName,
              dishName: pName,
              productId: typeof it.productId === 'object' && it.productId !== null ? it.productId._id : it.productId,
              qty: q,
              price: Number(pPrice),
              subtotal: Number(pPrice) * q,
            };
          })
          : [];

        const payMethodStr = o.paymentMethod
          ? (String(o.paymentMethod).toLowerCase() === 'upi'
            ? 'UPI'
            : o.paymentMethod.charAt(0).toUpperCase() + o.paymentMethod.slice(1))
          : 'Cash';

        const payStatusStr = o.paymentStatus
          ? (String(o.paymentStatus).toLowerCase() === 'paid' ? 'Paid' : 'Unpaid')
          : 'Unpaid';

        // Robust time extraction: checks createdAt, logCreatedDate, orderDate, updatedAt, or MongoDB ObjectId timestamp
        const rawDate = o.createdAt || o.logCreatedDate || o.orderDate || o.created_at || o.date || o.updatedAt || o.logDate;
        let formattedTime = 'Just now';
        if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        } else if (o._id && String(o._id).length >= 8) {
          try {
            const ts = parseInt(String(o._id).substring(0, 8), 16) * 1000;
            const d = new Date(ts);
            if (!isNaN(d.getTime())) {
              formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch {
            formattedTime = 'Just now';
          }
        }

        return {
          id: o.orderId || o.orderNumber || (o._id ? `TKW-${o._id.slice(-4).toUpperCase()}` : `TKW-0${idx + 1}`),
          mongoId: o._id,
          _id: o._id,
          guest: o.customerName || 'Guest',
          phone: o.customerPhone || '',
          slot: o.pickupSlot || 'Immediate',
          status: displayStatus,
          statusRaw: statusRaw,
          items: itemsCount,
          itemsList,
          subtotal: Number(o.subtotal || o.totalAmount || 0),
          discount: Number(o.discountAmount || 0),
          coupon: o.couponCode || null,
          total: Number(o.grandTotal || o.totalAmount || o.total || 0),
          payment: payMethodStr,
          paymentStatus: payStatusStr,
          time: formattedTime,
          eta: o.etaMinutes || 20,
          raw: o,
        };
      });

      // Partition into Active Queue & History
      const activeQueue = mapped.filter((o) =>
        ['Queued', 'Preparing', 'Ready'].includes(o.status)
      );
      const pastHistory = mapped.filter((o) =>
        ['Picked up', 'Cancelled'].includes(o.status)
      );

      setQueue(activeQueue);
      setHistory(pastHistory);
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
    fetchOrders();
  }, [fetchDashboardStats, fetchMenuAndCategories, fetchOrders]);

  // Toggle Takeaway Enabled / Disabled (PUT /service-status)
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
          nextState
            ? '✓ Takeaway service is now ENABLED'
            : 'Takeaway service is now DISABLED',
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

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    return queue.filter((o) => {
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.guest.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [queue, statusFilter, search]);

  // Dynamic Dashboard Stats calculated directly from the backend summary response
  const stats = useMemo(() => {
    if (dashboardStats) {
      const orderStatus = dashboardStats.orderStatus || {};
      const openCount = dashboardStats.totalOrders !== undefined
        ? Number(dashboardStats.totalOrders)
        : ((Number(orderStatus.queued || 0) + Number(orderStatus.preparing || 0) + Number(orderStatus.ready || 0)) || queue.length);

      const prepCount = orderStatus.preparing !== undefined
        ? Number(orderStatus.preparing)
        : (dashboardStats.preparing !== undefined ? Number(dashboardStats.preparing) : queue.filter((o) => o.status === 'Preparing').length);

      const readyCount = orderStatus.ready !== undefined
        ? Number(orderStatus.ready)
        : (dashboardStats.ready !== undefined ? Number(dashboardStats.ready) : queue.filter((o) => o.status === 'Ready').length);

      const queuedCount = orderStatus.queued !== undefined
        ? Number(orderStatus.queued)
        : (dashboardStats.queued !== undefined ? Number(dashboardStats.queued) : queue.filter((o) => o.status === 'Queued').length);

      const revenue = dashboardStats.todayRevenue !== undefined
        ? Number(dashboardStats.todayRevenue)
        : (dashboardStats.revenue !== undefined ? Number(dashboardStats.revenue) : 0);

      return {
        open: openCount,
        preparing: prepCount,
        ready: readyCount,
        queued: queuedCount,
        revenue: revenue,
      };
    }

    const ready = queue.filter((o) => o.status === 'Ready').length;
    const preparing = queue.filter((o) => o.status === 'Preparing').length;
    const queued = queue.filter((o) => o.status === 'Queued').length;
    const revenue = 0;
    return { ready, preparing, queued, revenue, open: queue.length };
  }, [queue, dashboardStats]);

  const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const avatarColor = (status) => {
    if (status === 'Ready') return { bg: '#ecfdf5', color: '#059669' };
    if (status === 'Preparing') return { bg: '#fff7ed', color: '#ea580c' };
    return { bg: '#eff6ff', color: '#2563eb' };
  };

  const statusBadge = (s) => {
    if (s === 'Ready' || s === 'Picked up') return 'badge-success';
    if (s === 'Cancelled') return 'badge-danger';
    if (s === 'Preparing') return 'badge-warning';
    return 'badge-info';
  };

  // Open Bill / Receipt Modal & Fetch Live Invoice
  const openBillModal = async (order) => {
    setSelectedOrderForBill(order);
    setInvoiceData(null);
    setIsBillModalOpen(true);
    setIsLoadingInvoice(true);

    try {
      const targetId = order.mongoId || order._id || order.id;
      const res = await fetch(`${URLS.GetInvoice}${targetId}/invoice`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoiceData(data.data || data);
      } else {
        // Fallback gracefully without breaking when invoice is not generated yet (404)
        setInvoiceData(null);
      }
    } catch {
      setInvoiceData(null);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  // Handle Order Created from Modal -> auto generate bill receipt
  const handleOrderCreatedSuccess = (result, createdOrderData) => {
    fetchOrders();
    fetchDashboardStats();
    showToast(`✓ Takeaway order created successfully for ${createdOrderData.guest}!`);

    // Auto open bill receipt after payment completion
    setSelectedOrderForBill(createdOrderData);
    setInvoiceData(null);
    setIsBillModalOpen(true);
  };

  // Handle Order Updated from Add Items Modal -> auto open updated bill
  const handleOrderUpdatedSuccess = (updatedOrder) => {
    fetchOrders();
    fetchDashboardStats();
    showToast(`✓ Items added to order ${updatedOrder.id}!`);

    // Auto open updated bill
    setSelectedOrderForBill(updatedOrder);
    setInvoiceData(null);
    setIsBillModalOpen(true);
  };

  // Update Order Status (PUT /v1/place/restaurant/takeaway/orders/:id/status)
  // Handles valid lifecycle transitions: queued -> preparing -> ready -> picked_up
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
          targetStatus === 'preparing'
            ? 'Preparing'
            : targetStatus === 'ready'
              ? 'Ready for Pickup'
              : targetStatus === 'picked_up'
                ? 'Picked Up'
                : targetStatus;
        showToast(`✓ Order ${target?.id || orderId} status updated to "${label}"!`);
        fetchOrders();
        fetchDashboardStats();
      } else {
        showToast(result.message || `Failed to update status to ${targetStatus}.`, 'error');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Network error while updating status.', 'error');
    }
  };

  return (
    <div className="svc-page-shell">
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Takeaway</h1>
          <p className="page-subtitle">
            Pickup queue, order processing, and customer takeaways
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              fetchOrders();
              fetchDashboardStats();
              fetchMenuAndCategories();
              showToast('Refreshed takeaway orders & dashboard stats!');
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          {/* Configuration button commented out per request */}
          {/* <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsConfigModalOpen(true)}
            title="Takeaway Settings"
          >
            <Settings2 size={16} />
          </button> */}

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

      {/* Stats Cards (Wired directly to backend dashboard summary) */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Package size={20} />
          </div>
          <div>
            <div className="stat-label">Open Pickup</div>
            <div className="stat-value">{stats.open}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <Clock3 size={20} />
          </div>
          <div>
            <div className="stat-label">Preparing</div>
            <div className="stat-value">{stats.preparing}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-label">Ready for Pickup</div>
            <div className="stat-value">{stats.ready}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <div className="stat-label">Today Revenue</div>
            <div className="stat-value">{money(stats.revenue)}</div>
          </div>
        </div>
      </div>

      {/* Primary Pickup Queue Card (Full Width - Counter Takeaway form commented out per request) */}
      <div className="card" style={{ marginBottom: 24, width: '100%' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="card-title">Pickup Queue</h2>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>
              Queued {stats.queued} · Preparing {stats.preparing} · Ready {stats.ready}
            </p>
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

        {/* Search & Filter Controls (Compact & Clean) */}
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

          <div style={{ width: 140 }}>
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
        </div>

        {/* Orders List */}
        <div className="svc-queue-list">
          {isLoading && queue.length === 0 && (
            <div style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={22} className="spin" style={{ marginBottom: 10 }} />
              <div>Loading takeaway orders…</div>
            </div>
          )}

          {filteredQueue.map((o) => {
            const pal = avatarColor(o.status);
            return (
              <div key={o.id} className="svc-queue-card">
                {/* Left Side: Avatar + Customer Details */}
                <div className="svc-queue-left">
                  <div
                    className="svc-queue-avatar"
                    style={{ background: pal.bg, color: pal.color }}
                  >
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

                {/* Right Side: Action Buttons Aligned Right */}
                <div className="svc-queue-actions">
                  <span className={`badge ${statusBadge(o.status)}`}>{o.status}</span>

                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: 12.5, padding: '7px 12px' }}
                    onClick={() => openBillModal(o)}
                    title="View & Print Bill"
                  >
                    <Printer size={13} /> Bill
                  </button>

                  {/* Add Items Button */}
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: 12.5, padding: '7px 13px', borderColor: '#3b82f6', color: '#2563eb' }}
                    onClick={() => {
                      setSelectedOrderForAddItems(o);
                      setIsAddItemsModalOpen(true);
                    }}
                    title="Add More Items to this Order"
                  >
                    <PlusCircle size={13} /> Add Items
                  </button>

                  {/* Stepwise lifecycle action buttons matching backend state machine */}
                  {o.status === 'Queued' && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12.5, padding: '7px 16px', borderColor: '#f97316', color: '#ea580c' }}
                      onClick={() => handleUpdateOrderStatus(o.id, 'preparing')}
                      title="Start Preparing Order"
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
                      title="Mark Ready for Pickup"
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
                      title="Hand Over Order to Customer"
                    >
                      <Package size={14} /> Hand Over
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!isLoading && filteredQueue.length === 0 && (
            <div style={{ padding: 36, textAlign: 'center', color: '#64748b', fontSize: 13.5, background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
              {queue.length === 0 ? 'No active orders in the takeaway pickup queue.' : 'No takeaway orders matching your criteria.'}
            </div>
          )}
        </div>
      </div>

      {/* 
        ══════════════════════════════════════════════════════════════════
        RIGHT SIDE CARD "COUNTER TAKEAWAY & MENU" COMMENTED OUT PER REQUEST
        ══════════════════════════════════════════════════════════════════
        All new takeaway orders are handled cleanly via the "+ New Takeaway Order" modal.
      */}

      {/* Recent Completions History Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Completions</h2>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>Picked up and completed orders today</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Guest</th>
                <th>Items</th>
                <th>Time</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td><strong>{h.id}</strong></td>
                  <td><strong>{h.guest}</strong></td>
                  <td>{h.items} items</td>
                  <td>{h.time}</td>
                  <td><span className="badge badge-muted">{h.payment}</span></td>
                  <td><strong>{money(h.total)}</strong></td>
                  <td><span className={`badge ${h.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`}>{h.paymentStatus}</span></td>
                  <td><span className={`badge ${statusBadge(h.status)}`}>{h.status}</span></td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                    No completed takeaway orders yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════ */}

      {/* Configuration modal commented out per request */}
      {/* 
      <TakeawayConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onSaveConfig={() => {
          setIsConfigModalOpen(false);
          showToast('✓ Takeaway configuration saved successfully!');
        }}
      />
      */}

      {/* Takeaway Bill / Receipt Modal (Single page print) */}
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
        availableCoupons={AVAILABLE_COUPONS}
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
