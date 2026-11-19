import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Armchair,
  Clock3,
  IndianRupee,
  Plus,
  Search,
  RefreshCw,
  Utensils,
  CalendarCheck,
  ShoppingCart,
  CheckCircle2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import '../ServiceOps.css';
import './DineIn.css';
import SeatGuestsModal from './SeatGuestsModal';
import CheckoutPaymentModal from './CheckoutPaymentModal';
import DineInConfigModal from './DineInConfigModal';
import DineInStatsCards from './DineInStatsCards';
import ReserveTablePanel from './ReserveTablePanel';
import OrderFoodPanel from './OrderFoodPanel';
import SessionOrdersCard from './SessionOrdersCard';
import { URLS } from '../../../url';

// ── BACKEND ENUMS (dine-in tables) ──────────────────────────────
const SECTION_LABELS = {
  main_dining: 'Main Dining',
  patio: 'Patio',
  bar_lounge: 'Bar Lounge',
  private_dining: 'Private Dining',
  other: 'Other',
};

const SECTION_OPTIONS = Object.keys(SECTION_LABELS);

const STATUS_LABELS = {
  available: 'Available',
  occupied: 'Occupied',
  // maintenance: 'Maintenance',
  // inactive: 'Inactive',
  reserved: 'Reserved',
  cleaning: 'Cleaning',
};

const titleCase = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const formatSection = (section) => SECTION_LABELS[section] || titleCase(section) || 'Other';

// Section can arrive as an enum string or as a populated object
const normalizeSection = (section) => {
  if (section && typeof section === 'object') {
    return String(section.value || section.name || 'other');
  }
  return String(section || 'other');
};

const formatStatus = (status) =>
  STATUS_LABELS[String(status || '').toLowerCase()] || titleCase(status) || 'Unknown';

const formatTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ── API RESPONSE MAPPERS ─────────────────────────────────────────
const mapTable = (t, idx) => {
  const status = String(t.status || 'available').toLowerCase();
  return {
    id: t.tableNumber || t.tableName || `T${String(idx + 1).padStart(2, '0')}`,
    mongoId: t._id,
    name: t.tableName || t.tableNumber || '',
    section: normalizeSection(t.section),
    sectionLabel: formatSection(normalizeSection(t.section)),
    seats: Number(t.seatingCapacity || t.capacity || t.seats || 0),
    status,
    statusLabel: formatStatus(status),
    isActive: t.isActive !== false,
    reservationId:
      t.reservationId ||
      t.reservation?._id ||
      t.currentReservation?._id ||
      t.activeReservation?._id ||
      null,
    raw: t,
  };
};

const SESSION_STATUS_MAP = {
  active: 'Serving',
  billing: 'Billing',
  kitchen: 'Kitchen',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const mapSession = (s) => {
  const tableObj = s.tableId && typeof s.tableId === 'object' ? s.tableId : {};
  const staffObj =
    s.assignedStaffId && typeof s.assignedStaffId === 'object' ? s.assignedStaffId : null;
  const statusRaw = String(s.status || 'active').toLowerCase();

  // The sessions API returns no order code — it comes from the orders API
  const sessionCode = s.orderUniqueId || s.sessionCode || s.sessionNo || '';
  const mongoId = s._id ? String(s._id) : '';

  return {
    id: mongoId || sessionCode,
    sessionCode,
    // orderUniqueId of the newest order on this session (filled from the orders API)
    orderCode: sessionCode,
    mongoId,
    sessionType: s.sessionType || '',
    tableId: tableObj._id || (typeof s.tableId === 'string' ? s.tableId : ''),
    table: tableObj.tableNumber || tableObj.tableName || s.tableNumber || '—',
    section: tableObj.section || tableObj.sectionName || s.section || '',
    sectionLabel: formatSection(tableObj.section || tableObj.sectionName || s.section || ''),
    guest: s.customerName || s.customer?.name || '',
    phone: s.customerPhone || s.customer?.phone || '',
    covers: Number(s.guestCount || 0),
    server: staffObj?.name || s.server || 'Floor Staff',
    staffCode: staffObj?.staffCode || '',
    serverId: staffObj?._id || null,
    status: SESSION_STATUS_MAP[statusRaw] || formatStatus(statusRaw),
    statusRaw,
    amount: s.totalAmount || 0,
    orderCount: 0,
    orders: [],
    paymentStatus: s.paymentStatus || '',
    paymentMethod: s.paymentMethod || '',
    notes: s.specialNotes || '',
    started: formatTime(s.seatedAt || s.logCreatedDate || s.createdAt),
    seatedAt: s.seatedAt || s.logCreatedDate || s.createdAt || null,
    raw: s,
  };
};

// Page size requested from GET /dine-in/sessions/active
const SESSION_PAGE_SIZE = 10;

// Overlay the bill, order code and order count reported from the orders API
const applySummary = (s, meta) => {
  if (!meta) return s;
  const amount = typeof meta.total === 'number' && meta.total > 0 ? meta.total : s.amount;
  const orderCode = meta.orderCode || s.orderCode;
  const orderCount = Number(meta.orderCount || s.orderCount || 0);
  const orders = Array.isArray(meta.orders) && meta.orders.length > 0 ? meta.orders : (s.orders || []);
  if (amount === s.amount && orderCode === s.orderCode && orderCount === s.orderCount && orders === s.orders) {
    return s;
  }
  return { ...s, amount, orderCode, orderCount, orders };
};

function DineIn() {
  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [serversList, setServersList] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);

  // Active Floor Sessions pagination
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionTotalPages, setSessionTotalPages] = useState(1);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionCache, setSessionCache] = useState({});

  // Filters
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  // Modals state (Separated Components)
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isBillCheckoutModalOpen, setIsBillCheckoutModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [preselectedSeatTable, setPreselectedSeatTable] = useState('');

  // Active Session for Checkout
  const [activeCheckoutSession, setActiveCheckoutSession] = useState(null);
  // Sessions settled in this visit — keeps their orders visible in the completed-orders card
  const [settledSessionIds, setSettledSessionIds] = useState([]);
  // Invoices returned by the checkout API, keyed by session id
  const [settledInvoices, setSettledInvoices] = useState({});
  // Bill, order code and order count derived from the orders API, keyed by session
  // mongo id — the sessions payload always reports totalAmount: 0, so this is
  // re-applied after every refresh instead of re-querying the orders endpoint
  const sessionSummaryRef = useRef({});

  // Table action mode (for right column: 'seat' | 'reserve' | 'order' | null)
  const [actionMode, setActionMode] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Configuration settings
  const [settings, setSettings] = useState({
    autoAssign: true,
    coverCharge: 0,
    serviceChargePct: 5,
    gstPct: 5,
    maxWaitMins: 15,
    reservationHoldMins: 20,
    defaultCovers: 2,
    defaultSection: 'Main Hall',
  });

  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    return {
      'Content-Type': 'application/json',
      ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  };

  // ── API: AVAILABLE / ALL DINE-IN TABLES ───────────────────────────
  const fetchTables = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: 1, limit: 100 });
      const res = await fetch(`${URLS.GetAvailableTables}?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();

      let rawTables = [];
      if (Array.isArray(result.tables)) rawTables = result.tables;
      else if (Array.isArray(result.data)) rawTables = result.data;
      else if (Array.isArray(result.data?.tables)) rawTables = result.data.tables;
      else if (Array.isArray(result.data?.docs)) rawTables = result.data.docs;
      else if (Array.isArray(result)) rawTables = result;

      const mappedTables = rawTables.map(mapTable);
      setTables(mappedTables);

      // Drop cached sessions whose table is no longer occupied
      // (skipped when the backend does not expose table ids)
      if (mappedTables.some((t) => t.mongoId)) {
        const occupiedTableIds = new Set(
          mappedTables.filter((t) => t.status === 'occupied').map((t) => t.mongoId)
        );
        setSessionCache((prev) =>
          Object.fromEntries(
            Object.entries(prev).filter(([, s]) => !s.tableId || occupiedTableIds.has(s.tableId))
          )
        );
      }
    } catch (err) {
      console.warn('Failed to fetch dine-in tables:', err);
    }
  }, []);

  // ── API: ACTIVE DINE-IN SESSIONS & DINE-IN ORDERS ──────────────────
  const fetchSessions = useCallback(async (targetPage = 1, targetLimit = SESSION_PAGE_SIZE) => {
    setIsSessionsLoading(true);
    try {
      const params = new URLSearchParams({ page: targetPage, limit: targetLimit });
      const [sessionsRes, ordersRes] = await Promise.all([
        fetch(`${URLS.GetDineIn}?${params.toString()}`, { headers: getAuthHeaders() }),
        fetch(URLS.GetDineInOrders, { headers: getAuthHeaders() }).catch(() => null),
      ]);

      const result = await sessionsRes.json();

      let rawSessions = [];
      if (Array.isArray(result.sessions)) rawSessions = result.sessions;
      else if (Array.isArray(result.data)) rawSessions = result.data;
      else if (Array.isArray(result.data?.sessions)) rawSessions = result.data.sessions;
      else if (Array.isArray(result.data?.docs)) rawSessions = result.data.docs;
      else if (Array.isArray(result)) rawSessions = result;

      // Extract all dine-in orders from GET /v1/place/restaurant/dine-in/orders
      let allOrders = [];
      if (ordersRes && ordersRes.ok) {
        const ordersData = await ordersRes.json().catch(() => ({}));
        if (Array.isArray(ordersData.orders)) allOrders = ordersData.orders;
        else if (Array.isArray(ordersData.data?.orders)) allOrders = ordersData.data.orders;
        else if (Array.isArray(ordersData.data)) allOrders = ordersData.data;
        else if (Array.isArray(ordersData)) allOrders = ordersData;
      }

      // Build session-to-order map and calculate bill / latest order codes
      const orderSummaryBySession = {};
      allOrders.forEach((o) => {
        const sId = String(o.session?._id || o.sessionId || '');
        const tableNum = o.table?.tableNumber || o.table?.tableName || '';
        const orderAmount = Number(o.totalAmount ?? o.booking?.totalAmount ?? 0);
        const orderCode = o.orderUniqueId || o.booking?.orderUniqueId || '';
        const created = o.booking?.logCreatedDate || o.createdAt || '';

        const keys = [sId, tableNum].filter(Boolean);
        keys.forEach((key) => {
          if (!orderSummaryBySession[key]) {
            orderSummaryBySession[key] = {
              total: 0,
              orderCode: '',
              newestDate: '',
              orderCount: 0,
              orders: [],
            };
          }
          orderSummaryBySession[key].total += orderAmount;
          orderSummaryBySession[key].orderCount += 1;
          orderSummaryBySession[key].orders.push(o);
          if (!orderSummaryBySession[key].newestDate || created > orderSummaryBySession[key].newestDate) {
            orderSummaryBySession[key].newestDate = created;
            orderSummaryBySession[key].orderCode = orderCode;
          }
        });
      });

      // Update session summary cache
      sessionSummaryRef.current = {
        ...sessionSummaryRef.current,
        ...orderSummaryBySession,
      };

      const mapped = rawSessions.map(mapSession);
      // Re-apply the order-derived bill and order code
      const enriched = mapped.map((s) => {
        const summary =
          orderSummaryBySession[s.mongoId] ||
          orderSummaryBySession[s.table] ||
          sessionSummaryRef.current[s.mongoId] ||
          sessionSummaryRef.current[s.table];
        return applySummary(s, summary);
      });

      // Backend may or may not paginate — handle both shapes
      const pg = result.pagination || result.meta || result.data?.pagination || {};
      const isServerPaginated =
        pg.totalRecords !== undefined ||
        pg.total !== undefined ||
        pg.totalPages !== undefined ||
        result.total !== undefined ||
        result.totalPages !== undefined;

      if (isServerPaginated) {
        const total = Number(pg.totalRecords ?? pg.total ?? result.total ?? enriched.length);
        const pages = Number(
          pg.totalPages ?? result.totalPages ?? Math.max(1, Math.ceil(total / targetLimit))
        );
        setSessions(enriched);
        setSessionTotal(total);
        setSessionTotalPages(Math.max(1, pages));
        setSessionPage(Number(pg.currentPage ?? pg.page ?? result.currentPage ?? targetPage));
      } else {
        // Unpaginated payload — slice the requested window client-side
        const total = enriched.length;
        const pages = Math.max(1, Math.ceil(total / targetLimit));
        const safePage = Math.min(Math.max(1, targetPage), pages);
        const start = (safePage - 1) * targetLimit;
        setSessions(enriched.slice(start, start + targetLimit));
        setSessionTotal(total);
        setSessionTotalPages(pages);
        setSessionPage(safePage);
      }

      // Remember every session fetched so off-page tables still resolve their details
      setSessionCache((prev) => {
        const next = { ...prev };
        enriched.forEach((s) => {
          next[s.mongoId || s.id] = s;
        });
        return next;
      });
    } catch (err) {
      console.warn('Failed to fetch active dine-in sessions:', err);
    } finally {
      setIsSessionsLoading(false);
    }
  }, []);

  // ── API: ACTIVE CAPTAINS / SERVERS ──────────────────────────
  const fetchServers = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetActiveServers, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const result = await res.json();

      let rawStaff = [];
      if (Array.isArray(result.captains)) rawStaff = result.captains;
      else if (Array.isArray(result.data)) rawStaff = result.data;
      else if (Array.isArray(result.staff)) rawStaff = result.staff;
      else if (Array.isArray(result.data?.captains)) rawStaff = result.data.captains;
      else if (Array.isArray(result)) rawStaff = result;

      setServersList(
        rawStaff.map((c) => ({
          id: c._id,
          name: c.name || c.staffCode || 'Captain',
          staffCode: c.staffCode || '',
          role: c.role || '',
          phone: c.phone || '',
        }))
      );
    } catch (err) {
      console.warn('Failed to fetch active servers:', err);
    }
  }, []);

  // ── DASHBOARD CARDS LIFTED UP FROM <DineInStatsCards /> ──────────
  const handleDashboardLoaded = useCallback((dashboard) => {
    setDashboardStats(dashboard);
    if (typeof dashboard?.dineInEnabled === 'boolean') setEnabled(dashboard.dineInEnabled);
  }, []);

  // Re-fetch floor plan + sessions (back to page 1), then ask the stats cards to refresh
  const refreshDineIn = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTables(), fetchSessions(1, SESSION_PAGE_SIZE)]);
    setSessionPage(1);
    setStatsRefreshKey((k) => k + 1);
    setIsLoading(false);
  }, [fetchTables, fetchSessions]);

  // Initial load (dashboard cards fetch themselves inside <DineInStatsCards />)
  useEffect(() => {
    fetchTables();
    fetchSessions(1, SESSION_PAGE_SIZE);
    fetchServers();
  }, [fetchTables, fetchSessions, fetchServers]);

  // Always expose every known section so the filter is never limited to
  // whatever sections happen to have tables at the moment
  const sections = useMemo(() => {
    const present = new Set(tables.map((t) => t.section).filter(Boolean));
    const extras = Array.from(present).filter((s) => !SECTION_OPTIONS.includes(s));
    return ['All', ...SECTION_OPTIONS, ...extras];
  }, [tables]);

  // Sessions seen across pages, joined onto the floor plan / action panel
  const knownSessions = useMemo(() => {
    const merged = new Map();
    Object.values(sessionCache).forEach((s) => merged.set(s.mongoId || s.id, s));
    sessions.forEach((s) => merged.set(s.mongoId || s.id, s));
    return Array.from(merged.values());
  }, [sessionCache, sessions]);

  // Join active sessions onto their tables so the floor plan shows guest / covers / session
  const tablesWithSessions = useMemo(() => {
    return tables.map((t) => {
      const s = knownSessions.find((x) => x.tableId === t.mongoId || x.table === t.id);
      if (!s) return t;
      return {
        ...t,
        guest: s.guest,
        covers: s.covers,
        orderId: s.orderCode || '',
        since: s.started,
        session: s,
      };
    });
  }, [tables, knownSessions]);

  const selectedTableData = useMemo(
    () => tablesWithSessions.find((t) => t.id === selectedTable),
    [tablesWithSessions, selectedTable]
  );

  const availableTables = useMemo(
    () => tables.filter((t) => t.status === 'available'),
    [tables]
  );

  const filteredTables = useMemo(() => {
    return tablesWithSessions.filter((t) => {
      const matchSection = sectionFilter === 'All' || t.section === sectionFilter;
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        String(t.id || '').toLowerCase().includes(q) ||
        String(t.sectionLabel || '').toLowerCase().includes(q) ||
        (t.guest && t.guest.toLowerCase().includes(q));
      return matchSection && matchStatus && matchSearch;
    });
  }, [tablesWithSessions, sectionFilter, statusFilter, search]);

  // Cards come from the dine-in dashboard API, with a floor-plan fallback
  const stats = useMemo(() => {
    const d = dashboardStats || {};
    const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
    const availableCount = tables.filter((t) => t.status === 'available').length;
    const totalAmount = sessions.reduce((s, it) => s + (it.amount || 0), 0);

    return {
      activeSessions: Number(d.activeSessions ?? sessions.length),
      available: Number(d.availableTables ?? availableCount),
      reserved: Number(d.reserved ?? 0),
      occupied: Number(d.occupiedTables ?? occupiedCount),
      openChecks: Number(d.openChecks ?? sessions.length),
      totalAmount: Number(d.openChecksAmount ?? totalAmount),
      totalTables: Number(d.totalTables ?? tables.length),
    };
  }, [tables, sessions, dashboardStats]);

  const money = (n) =>
    `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const sessionStatusBadge = (s) => {
    if (s === 'Serving') return 'badge-info';
    if (s === 'Billing') return 'badge-warning';
    if (s === 'Kitchen') return 'badge-primary';
    return 'badge-success';
  };

  const handleTableClick = (tableId) => {
    if (selectedTable === tableId) {
      setSelectedTable(null);
      setActionMode(null);
    } else {
      setSelectedTable(tableId);
      setActionMode(null);
    }
  };

  // ── SEAT GUESTS ─────────────────────────────────────────────────────
  const openSeatModal = (preselectedTableId = '') => {
    setPreselectedSeatTable(preselectedTableId || (availableTables[0]?.id || ''));
    setIsSeatModalOpen(true);
  };

  // Called by <SeatGuestsModal /> after it successfully creates the session
  const handleSeated = async ({ table, covers, guest }) => {
    setIsSeatModalOpen(false);
    if (table) setSelectedTable(table);
    setActionMode(null);
    showToast(`✓ ${guest || 'Walk-in Guest'} seated at Table ${table} · ${covers} covers!`);
    await refreshDineIn();
  };

  // ── RESERVE TABLE ───────────────────────────────────────────────────
  // Called by <ReserveTablePanel /> after the reservation was created via the API
  const handleReserveTable = ({ tableId, guest, phone, covers, reserveDate, reserveTime, reservation }) => {
    setTables((prev) =>
      prev.map((tab) =>
        tab.id === tableId
          ? {
              ...tab,
              status: 'reserved',
              statusLabel: formatStatus('reserved'),
              guest,
              phone,
              covers,
              reservedFor: reserveTime,
              reservedOn: reserveDate,
              reservationId:
                reservation?._id ||
                reservation?.reservationId ||
                tab.reservationId ||
                null,
            }
          : tab
      )
    );
    setActionMode(null);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const when = reserveDate && reserveDate !== todayStr ? `${reserveDate} at ${reserveTime}` : reserveTime;
    showToast(`✓ Table ${tableId} reserved for ${guest} · ${when}.`);
  };

  // Called by <ReserveTablePanel /> after the reservation was cancelled via the API
  const handleReservationCancelled = ({ tableId }) => {
    setTables((prev) =>
      prev.map((tab) =>
        tab.id === tableId
          ? {
              ...tab,
              status: 'available',
              statusLabel: formatStatus('available'),
              guest: '',
              phone: '',
              covers: 0,
              reservedFor: '',
              reservedOn: '',
              reservationId: null,
            }
          : tab
      )
    );
    setActionMode(null);
    showToast(`✓ Reservation cancelled — Table ${tableId} is now available.`);
    refreshDineIn();
  };

  // ── BILLING & CHECKOUT MODAL ────────────────────────────────────────
  const openBillCheckoutModal = (sessionObj) => {
    setActiveCheckoutSession(sessionObj);
    setIsBillCheckoutModalOpen(true);
  };

  const handleCompleteCheckout = ({ table, sessionId, grandTotal, payMethod, invoice }) => {
    setSettledSessionIds((prev) =>
      prev.includes(String(sessionId)) ? prev : [...prev, String(sessionId)]
    );
    if (invoice) {
      setSettledInvoices((prev) => ({ ...prev, [String(sessionId)]: invoice }));
    }
    const matchesSession = (s) => String(s.mongoId || s.id) === String(sessionId);
    const remaining = sessions.filter((s) => !matchesSession(s));
    setSessions(remaining);
    setSessionCache((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([, s]) => !matchesSession(s)))
    );
    setSessionTotal((n) => Math.max(0, n - 1));
    setTables((prev) =>
      prev.map((t) =>
        t.id === table
          ? {
            ...t,
            status: 'available',
            statusLabel: formatStatus('available'),
            guest: '',
            covers: 0,
            orderId: '',
            since: '',
            session: null,
          }
          : t
      )
    );

    setIsBillCheckoutModalOpen(false);
    setActiveCheckoutSession(null);
    showToast(`✓ Bill settled for Table ${table}! Payment of ${money(grandTotal)} collected via ${payMethod}.`);

    // Pull the next page into view when the last row of this page was settled
    if (remaining.length === 0 && sessionPage > 1) {
      const prevPage = sessionPage - 1;
      setSessionPage(prevPage);
      fetchSessions(prevPage, SESSION_PAGE_SIZE);
    }
  };

  // Real bill, order code and order count per session, reported by <SessionOrdersCard />
  // from the orders API — the sessions payload always reports totalAmount: 0
  const handleSessionSummary = useCallback((summary) => {
    if (!summary || Object.keys(summary).length === 0) return;

    // Remembered so the next sessions refresh re-applies it instead of resetting to ₹0
    sessionSummaryRef.current = { ...sessionSummaryRef.current, ...summary };

    setSessions((prev) => {
      let changed = false;
      const next = prev.map((s) => {
        const patched = applySummary(s, summary[String(s.mongoId)]);
        if (patched !== s) changed = true;
        return patched;
      });
      return changed ? next : prev;
    });

    setSessionCache((prev) => {
      let changed = false;
      const next = Object.fromEntries(
        Object.entries(prev).map(([key, s]) => {
          const patched = applySummary(s, summary[String(s.mongoId)]);
          if (patched !== s) changed = true;
          return [key, patched];
        })
      );
      return changed ? next : prev;
    });
  }, []);

  // Order Placement — called by <OrderFoodPanel /> after the order API succeeds
  const handleOrderPlaced = async ({ sessionId, tableId, items, total, orderCode }) => {
    const matchesSession = (s) =>
      sessionId ? String(s.mongoId || s.id) === String(sessionId) : s.table === tableId;

    // Keep the derived bill in sync, otherwise the next sessions refresh resets it to ₹0
    const targetSession = sessions.find(matchesSession) || sessionCache[String(sessionId)];
    const summaryId = String(targetSession?.mongoId || sessionId || '');
    if (summaryId) {
      const prev = sessionSummaryRef.current[summaryId] || {
        total: 0,
        orderCode: '',
        orderCount: 0,
      };
      sessionSummaryRef.current = {
        ...sessionSummaryRef.current,
        [summaryId]: {
          total: prev.total + Number(total || 0),
          orderCode: orderCode || prev.orderCode,
          orderCount: prev.orderCount + 1,
        },
      };
    }

    const addToBill = (s) =>
      matchesSession(s)
        ? {
            ...s,
            amount: (s.amount || 0) + Number(total || 0),
            orderCount: (s.orderCount || 0) + 1,
            status: 'Serving',
            ...(orderCode ? { orderCode } : {}),
          }
        : s;

    setSessions((prev) => prev.map(addToBill));
    setSessionCache((prev) =>
      Object.fromEntries(Object.entries(prev).map(([key, s]) => [key, addToBill(s)]))
    );

    showToast(`✓ Added ${items.length} items (${money(total)}) to Table ${tableId}!`);
    setActionMode(null);

    // Re-sync the session bill with the backend
    await refreshDineIn();
  };

  // ── ACTIVE FLOOR SESSIONS PAGINATION ────────────────────────────────
  const handleSessionPageChange = (newPage) => {
    if (newPage < 1 || newPage > sessionTotalPages || newPage === sessionPage) return;
    setSessionPage(newPage);
    fetchSessions(newPage, SESSION_PAGE_SIZE);
  };

  const getPageNumbers = (currentPage, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', total];
    if (currentPage >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', total];
  };

  const sessionStartItem = sessionTotal === 0 ? 0 : (sessionPage - 1) * SESSION_PAGE_SIZE + 1;
  const sessionEndItem = Math.min(sessionPage * SESSION_PAGE_SIZE, sessionTotal);

  const updateTableStatus = (tableId, nextStatus) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: nextStatus, statusLabel: formatStatus(nextStatus) }
          : t
      )
    );
    if (nextStatus === 'available') {
      const hadSession = knownSessions.some((s) => s.table === tableId);
      setSessions((prev) => prev.filter((s) => s.table !== tableId));
      setSessionCache((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([, s]) => s.table !== tableId))
      );
      if (hadSession) setSessionTotal((n) => Math.max(0, n - 1));
    }
    showToast(`✓ Table ${tableId} marked as ${formatStatus(nextStatus)}.`);
  };

  // ── ENABLE / DISABLE DINE-IN SERVICE ───────────────────────────────
  const handleToggleService = async () => {
    const nextState = !enabled;
    setEnabled(nextState);
    try {
      const res = await fetch(URLS.EnableDineIn, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isEnabled: nextState }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false || data.status === false) {
        setEnabled(!nextState);
        showToast(data.message || 'Failed to update dine-in status.', 'error');
        return;
      }

      showToast(
        nextState ? '✓ Dine-in service is now ENABLED' : 'Dine-in service is now DISABLED'
      );
      setStatsRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Error toggling dine-in status:', err);
      setEnabled(!nextState);
      showToast('Network error while toggling service.', 'error');
    }
  };

  // ── RIGHT COLUMN ACTION PANEL RENDERER ───────────────────────────────
  const renderActionPanel = () => {
    if (!selectedTableData) {
      return (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Quick Seat</h2>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>Open a new dine-in session</p>
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
              Select an available table from the floor plan to seat walk-in guests or manage active tables.
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!enabled || availableTables.length === 0}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => openSeatModal()}
            >
              <Plus size={16} /> Open Seat Guests Form
            </button>
          </div>
        </div>
      );
    }

    const t = selectedTableData;

    // ORDER FOOD PANEL (separated component — owns categories + menu API)
    if (actionMode === 'order') {
      return (
        <OrderFoodPanel
          table={t}
          session={t.session}
          onClose={() => setActionMode(null)}
          onOrderPlaced={handleOrderPlaced}
          isDisabled={!enabled}
        />
      );
    }

    // RESERVE TABLE PANEL (separated component — create or cancel a reservation)
    if (actionMode === 'reserve') {
      return (
        <ReserveTablePanel
          table={t}
          reservationId={t.reservationId || ''}
          onClose={() => setActionMode(null)}
          onConfirm={handleReserveTable}
          onCancelled={handleReservationCancelled}
          isDisabled={!enabled}
        />
      );
    }

    // DEFAULT TABLE DETAILS PANEL
    const statusBadges = {
      available: { label: 'Available', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
      occupied: { label: 'Occupied', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
      reserved: { label: 'Reserved', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
      // maintenance: { label: 'Maintenance', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
      // inactive: { label: 'Inactive', bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
      cleaning: { label: 'Cleaning', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
    };
    const sb = statusBadges[t.status] || statusBadges.available;
    const sessionObj = knownSessions.find((s) => s.table === t.id);

    return (
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Table {t.id}</h2>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>{t.sectionLabel || formatSection(t.section)} · {t.seats} seats</p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 999,
              background: sb.bg,
              color: sb.color,
              border: `1.5px solid ${sb.border}`,
            }}
          >
            {sb.label}
          </span>
        </div>

        {/* Informative Box */}
        {t.status === 'available' ? (
          <div
            style={{
              padding: '12px 14px',
              background: '#f0fdf4',
              borderRadius: 12,
              border: '1.5px solid #a7f3d0',
              marginBottom: 16,
              fontSize: 13,
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} color="#10b981" />
            <span>Table {t.id} is clean, available, and ready for seating.</span>
          </div>
        ) : (t.guest || t.covers || t.orderId || t.since) ? (
          <div style={{ padding: '14px 16px', background: sb.bg, borderRadius: 12, border: `1.5px solid ${sb.border}`, marginBottom: 18 }}>
            {t.guest && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Guest</span>
                <strong style={{ color: '#0f172a' }}>{t.guest}</strong>
              </div>
            )}
            {t.covers && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Covers</span>
                <strong style={{ color: '#0f172a' }}>{t.covers} persons</strong>
              </div>
            )}
            {t.orderId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Order</span>
                <strong style={{ color: '#0f172a' }}>{sessionObj?.orderCode || t.orderId}</strong>
              </div>
            )}
            {t.since && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{t.status === 'reserved' ? 'Reserved for' : 'Seated since'}</span>
                <strong style={{ color: '#0f172a' }}>{t.reservedFor || t.since}</strong>
              </div>
            )}
          </div>
        ) : null}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {t.status === 'available' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                disabled={!enabled}
                onClick={() => openSeatModal(t.id)}
              >
                <Utensils size={15} /> Seat Guests Now
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center' }}
                onClick={() => setActionMode('reserve')}
              >
                <CalendarCheck size={15} /> Reserve Table
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center', color: '#64748b' }}
                onClick={() => updateTableStatus(t.id, 'cleaning')}
              >
                Mark as Cleaning
              </button>
            </>
          )}

          {t.status === 'occupied' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => setActionMode('order')}
              >
                <ShoppingCart size={15} /> Add Food / Drinks
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                onClick={() => {
                  if (sessionObj) openBillCheckoutModal(sessionObj);
                  else showToast('No active session found for this table.');
                }}
              >
                <IndianRupee size={15} /> Bill & Settle Payment
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center', color: '#059669' }}
                onClick={() => updateTableStatus(t.id, 'available')}
              >
                <CheckCircle2 size={15} /> Vacate Table
              </button>
            </>
          )}

          {t.status === 'reserved' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => openSeatModal(t.id)}
              >
                <UserCheck size={15} /> Seat Reserved Guest
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center', color: '#ef4444', borderColor: '#fecaca' }}
                onClick={() => setActionMode('reserve')}
              >
                Cancel Reservation
              </button>
            </>
          )}

          {t.status === 'cleaning' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => updateTableStatus(t.id, 'available')}
              >
                <CheckCircle2 size={15} /> Mark Table Ready
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Armchair size={22} color="var(--primary)" /> Dine-in
          </h1>
          <p className="page-desc">
            Floor plan, table sessions, covers, and in-house service management
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={refreshDineIn} disabled={isLoading}>
            <RefreshCw size={15} /> {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
          {/* <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsConfigModalOpen(true)}
            title="Dine-in Configuration & Settings"
          >
            <Settings2 size={15} /> Dine-in Configuration
          </button> */}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!enabled}
            onClick={() => openSeatModal()}
          >
            <Plus size={16} /> Seat Guests
          </button>
        </div>
      </div>

      {/* Enable / Toggle Row */}
      <div className="svc-toggle-row">
        <div className="svc-toggle-meta">
          <div className="svc-toggle-title">Dine-in service status</div>
          <div className="svc-toggle-desc">
            When off, guests cannot be seated and walk-in/reservation intake is paused.
          </div>
        </div>
        <button
          type="button"
          className={`svc-switch ${enabled ? 'on' : ''}`}
          aria-pressed={enabled}
          onClick={handleToggleService}
          title={enabled ? 'Dine-in Enabled' : 'Dine-in Disabled'}
        >
          <span className="svc-switch-knob" />
        </button>
      </div>

      {/* Stats Cards — fetch their own dashboard data */}
      <DineInStatsCards
        refreshKey={statsRefreshKey}
        onDashboardLoaded={handleDashboardLoaded}
        money={money}
      />

      {/* Main Floor & Right Action Column Grid */}
      <div className="svc-section-grid">
        {/* Left Card: Floor & Tables Plan */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Floor & Tables</h2>
              {/* <p style={{ fontSize: 12.5, color: '#64748b' }}>
                Occupied {stats.occupied} · Reserved {stats.reserved} · Available {stats.available}
              </p> */}
            </div>
          </div>

          {/* Legend */}

          <div
            className="svc-legend"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '7px',
              padding: '5px 10px',
              fontSize: 12.5,
              color: '#15803d',
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
            }}
          >
            <span className="svc-legend-item" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 12px', borderRadius: 8,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              color: '#15803d', fontWeight: 500
            }}>
              <span className="svc-legend-dot" style={{
                width: 8, height: 8, borderRadius: '50%', background: '#22c55e'
              }} />
              Available <strong>{stats.available}</strong>
            </span>

            <span className="svc-legend-item" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 12px', borderRadius: 8,
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#b91c1c', fontWeight: 500
            }}>
              <span className="svc-legend-dot" style={{
                width: 8, height: 8, borderRadius: '50%', background: '#ef4444'
              }} />
              Occupied <strong>{stats.occupied}</strong>
            </span>

            <span className="svc-legend-item" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 12px', borderRadius: 8,
              background: '#fffbeb', border: '1px solid #fde68a',
              color: '#a16207', fontWeight: 500
            }}>
              <span className="svc-legend-dot" style={{
                width: 8, height: 8, borderRadius: '50%', background: '#f59e0b'
              }} />
              Reserved <strong>{stats.reserved}</strong>
            </span>

            <span className="svc-legend-item" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 12px', borderRadius: 8,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              color: '#1d4ed8', fontWeight: 500
            }}>
              <span className="svc-legend-dot" style={{
                width: 8, height: 8, borderRadius: '50%', background: '#3b82f6'
              }} />
              Cleaning <strong>{stats.cleaning}</strong>
            </span>
          </div>


          {/* Search & Filters */}
          <div className="form-grid" style={{ marginBottom: 18, gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Search</label>
              <div className="svc-input-with-icon">
                <Search size={16} className="svc-input-icon" />
                <input
                  className="form-control"
                  placeholder="Table, section, guest…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <select
                className="form-control"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                {sections.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All Sections' : formatSection(s)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          </div>

          {/* Tables Interactive Grid */}
          <div className="svc-table-grid">
            {filteredTables.map((t) => {
              const isSel = selectedTable === t.id;
              return (
                <div
                  key={t.id}
                  className={`svc-table-card ${t.status} ${isSel ? 'selected' : ''}`}
                  onClick={() => handleTableClick(t.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="svc-table-no">{t.id}</div>
                  <div className="svc-table-sec">{t.sectionLabel || formatSection(t.section)}</div>
                  <div className="svc-table-seats">{t.seats} seats</div>

                  {t.guest && (
                    <div className="svc-table-guest">
                      {t.guest}
                    </div>
                  )}

                  {t.since && (
                    <div className="svc-table-time">
                      <Clock3 size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {t.reservedFor || t.since}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredTables.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '18px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#64748b', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                No tables found for the selected filters.
              </div>
            )}
          </div>

          {!selectedTable && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#64748b', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              Click any table on the floor to seat guests, take orders, or view bill & payment options
            </div>
          )}
        </div>

        {/* Dynamic Right Action Panel */}
        {renderActionPanel()}
      </div>

      {/* Active Floor Sessions Table with BILL & PAYMENT BUTTON */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Active Dine-in Orders</h2>
            <p style={{ fontSize: 12.5,marginTop: 4, color: '#64748b' }}>Live orders and ongoing customer dining</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>SL.No</th>
                <th>Order</th>
                <th>Table</th>
                <th>Guest</th>
                <th>Covers</th>
                <th>Server</th>
                <th>Started</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, index) => (
                <tr key={s.mongoId || s.id}>
                  <td>{(sessionPage - 1) * SESSION_PAGE_SIZE + index + 1}</td>
                  <td>
                    {s.orderCode ? (
                      <strong>{s.orderCode}</strong>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-primary">{s.table}</span>
                    {s.section && (
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>
                        {formatSection(s.section)}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{s.guest}</strong>
                    {s.phone && (
                      <div style={{ fontSize: 11, color: '#64748b' }}>{s.phone}</div>
                    )}
                  </td>
                  <td>{s.covers}</td>
                  <td>{s.server || 'Floor Staff'}{s.staffCode ? ` (${s.staffCode})` : ''}</td>
                  <td>{s.started}</td>
                  <td><span className={`badge ${sessionStatusBadge(s.status)}`}>{s.status}</span></td>
                  <td title="Total of all orders on this session — retrieved from dine-in orders">
                    <strong>{money(s.amount)}</strong>
                    {s.orderCount > 0 && (
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>
                        {s.orderCount} order{s.orderCount > 1 ? 's' : ''}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: 12, padding: '5px 10px' }}
                        onClick={() => {
                          setSelectedTable(s.table);
                          setActionMode('order');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                      >
                        <ShoppingCart size={13} /> Add items
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: '5px 12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        onClick={() => openBillCheckoutModal(s)}
                      >
                        <IndianRupee size={13} /> Bill & Pay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '28px 12px', color: '#64748b' }}>
                    {isSessionsLoading
                      ? 'Loading active floor sessions…'
                      : 'No active dine-in sessions right now.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Active Floor Sessions Pagination */}
        {sessionTotal > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #e2e8f0',
              padding: '14px 4px 0',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 12,
            }}
          >
            <div style={{ fontSize: 12.5, color: '#64748b' }}>
              {isSessionsLoading
                ? 'Loading active sessions…'
                : `Showing ${sessionStartItem} to ${sessionEndItem} of ${sessionTotal} sessions`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                onClick={() => handleSessionPageChange(sessionPage - 1)}
                disabled={sessionPage === 1 || isSessionsLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: sessionPage === 1 ? 'not-allowed' : 'pointer', opacity: sessionPage === 1 ? 0.5 : 1, fontSize: 12.5 }}
              >
                <ChevronLeft size={13} /> Prev
              </button>
              {getPageNumbers(sessionPage, sessionTotalPages).map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  type="button"
                  onClick={() => typeof p === 'number' && handleSessionPageChange(p)}
                  disabled={p === '...' || isSessionsLoading}
                  style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12.5, cursor: p === '...' ? 'default' : 'pointer', background: p === sessionPage ? 'var(--primary)' : '#fff', color: p === sessionPage ? '#fff' : 'inherit', fontWeight: p === sessionPage ? 700 : 400 }}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleSessionPageChange(sessionPage + 1)}
                disabled={sessionPage === sessionTotalPages || isSessionsLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: sessionPage === sessionTotalPages ? 'not-allowed' : 'pointer', opacity: sessionPage === sessionTotalPages ? 0.5 : 1, fontSize: 12.5 }}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Completed (paid) dine-in orders for the sessions on this page */}
      <SessionOrdersCard
        sessions={sessions}
        settledSessionIds={settledSessionIds}
        settledInvoices={settledInvoices}
        onSessionSummary={handleSessionSummary}
        money={money}
      />

      {/* ══════════════════════════════════════════════
          MODALS (SEPARATED COMPONENTS)
      ══════════════════════════════════════════════ */}
      <SeatGuestsModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        onSeated={handleSeated}
        availableTables={availableTables}
        preselectedTable={preselectedSeatTable}
        servers={serversList}
      />

      <CheckoutPaymentModal
        isOpen={isBillCheckoutModalOpen}
        onClose={() => setIsBillCheckoutModalOpen(false)}
        session={activeCheckoutSession}
        onCompleteCheckout={handleCompleteCheckout}
        settings={settings}
        money={money}
        onShowToast={showToast}
      />

      <DineInConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('✓ Dine-in configuration saved successfully!');
        }}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`svc-toast ${toastType}`}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}
    </div>
  );
}

export { DineIn };
export default DineIn;

