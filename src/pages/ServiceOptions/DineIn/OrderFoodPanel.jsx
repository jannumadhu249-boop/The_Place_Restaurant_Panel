import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  X,
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

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Active categories can come as { category | categories | data } or a bare array
const extractCategories = (data) => {
  const list = data?.category || data?.categories || data?.data || (Array.isArray(data) ? data : []);
  return Array.isArray(list) ? list : [];
};

// Available food menu can come as { data | menu | foods | data.menu } or a bare array
const extractFoods = (data) => {
  let list = [];
  if (Array.isArray(data?.data)) list = data.data;
  else if (Array.isArray(data?.menu)) list = data.menu;
  else if (Array.isArray(data?.foods)) list = data.foods;
  else if (Array.isArray(data?.data?.menu)) list = data.data.menu;
  else if (Array.isArray(data)) list = data;
  return list;
};

const mapFood = (f, idx, categoryNameById) => {
  const catObj = f.categoryId && typeof f.categoryId === 'object' ? f.categoryId : null;
  const categoryId = String(
    catObj?._id || (typeof f.categoryId === 'string' ? f.categoryId : '') || ''
  );
  const categoryName =
    catObj?.name ||
    (f.category && typeof f.category === 'object' ? f.category.name : f.category) ||
    categoryNameById.get(categoryId) ||
    'Other';

  return {
    id: f._id || `food-${idx}`,
    name: f.dishName || f.name || f.foodName || `Dish ${idx + 1}`,
    categoryId,
    category: String(categoryName),
    price: Number(f.offerPrice ?? f.regularPrice ?? f.price ?? 0),
    originalPrice: Number(f.regularPrice ?? f.price ?? 0),
    foodType: f.dietaryType || f.foodType || '',
    available: f.isAvailable !== false,
  };
};

export default function OrderFoodPanel({ table, session, onClose, onOrderPlaced, isDisabled = false }) {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── API: ACTIVE CATEGORIES (POST, GET fallback) ────────────────────
  const loadCategories = async () => {
    const request = async (method) => {
      const res = await fetch(URLS.GetActiveCategories, { method, headers: getAuthHeaders() });
      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      return extractCategories(data);
    };

    try {
      let list = await request('POST');
      if (list.length === 0) list = await request('GET');
      return list;
    } catch (err) {
      console.warn('Failed to fetch active categories:', err);
      return [];
    }
  };

  // ── API: AVAILABLE FOOD MENU ───────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const rawCategories = await loadCategories();
      const mappedCategories = rawCategories
        .filter((c) => c && c.isActive !== false)
        .map((c, idx) => ({
          id: String(c._id || c.id || c.name || `cat-${idx}`),
          name: c.name || c.categoryName || 'Category',
        }));
      const categoryNameById = new Map(mappedCategories.map((c) => [c.id, c.name]));

      const res = await fetch(URLS.GetAvailableFoodMenu, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Menu request failed (${res.status})`);
      const data = await res.json().catch(() => ({}));

      const mappedFoods = extractFoods(data)
        .map((f, idx) => mapFood(f, idx, categoryNameById))
        .filter((f) => f.available);

      setCategories(mappedCategories);
      setFoods(mappedFoods);
    } catch (err) {
      console.warn('Failed to fetch dine-in food menu:', err);
      setLoadError('Could not load the food menu. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Category chips — fall back to the categories present in the menu itself
  const chips = useMemo(() => {
    if (categories.length > 0) return [{ id: 'all', name: 'All' }, ...categories];
    const names = Array.from(new Set(foods.map((f) => f.category).filter(Boolean)));
    return [{ id: 'all', name: 'All' }, ...names.map((name) => ({ id: name, name }))];
  }, [categories, foods]);

  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activeChip = chips.find((c) => c.id === activeCategory);

    return foods.filter((f) => {
      if (activeCategory !== 'all') {
        const categoryOk = f.categoryId
          ? f.categoryId === activeCategory ||
            (activeChip && f.category.toLowerCase() === activeChip.name.toLowerCase())
          : Boolean(activeChip && f.category.toLowerCase() === activeChip.name.toLowerCase());
        if (!categoryOk) return false;
      }
      return !q || f.name.toLowerCase().includes(q);
    });
  }, [foods, activeCategory, search, chips]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = foods.find((f) => f.id === id);
          return item ? { ...item, qty, subtotal: item.price * qty } : null;
        })
        .filter(Boolean),
    [cart, foods]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartItems]
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  if (!table) return null;

  // The order endpoint needs the session's Mongo id (not the display code)
  const sessionId = session?.mongoId || session?._id || session?.id || '';

  // ── API: ADD FOOD ORDER TO THE TABLE SESSION ────────────────────────
  const handleSendToKitchen = async () => {
    setSubmitError('');
    if (cartItems.length === 0) return;
    if (!sessionId) {
      setSubmitError('No active session found for this table — seat the guests first.');
      return;
    }

    const payload = {
      sessionId,
      products: cartItems.map((item) => ({ productId: item.id, quantity: item.qty })),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(URLS.CreateDineInOrder, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      const apiError =
        data.message ||
        data.error ||
        (Array.isArray(data.errors)
          ? data.errors.map((item) => item?.message || item).join(', ')
          : '');

      if (!res.ok || data.success === false || data.status === false) {
        setSubmitError(apiError || 'Failed to place the order. Please try again.');
        return;
      }

      onOrderPlaced?.({
        sessionId,
        tableId: table.id,
        items: cartItems,
        total: Number(data.totalAmount ?? data.data?.totalAmount ?? cartTotal),
        orderCode:
          data.orderUniqueId ||
          data.order?.orderUniqueId ||
          data.data?.orderUniqueId ||
          data.data?.order?.orderUniqueId ||
          '',
        order: data.order || data.data?.order || data.data || null,
      });
    } catch (err) {
      console.warn('Failed to add dine-in order:', err);
      setSubmitError('Network error while placing the order. Check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <ShoppingCart
              size={17}
              style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--primary)' }}
            />
            Menu Order — {table.id} ({table.guest || 'Guest'})
          </h2>
          <p style={{ fontSize: 12.5, color: '#64748b' }}>Select dishes &amp; drinks</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={onClose}
        >
          <X size={14} /> Close
        </button>
      </div>

      <div className="svc-order-search">
        <div className="svc-input-with-icon" style={{ flex: 1 }}>
          <Search size={15} className="svc-input-icon" />
          <input
            className="form-control"
            placeholder="Search food item…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="svc-menu-cats">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`svc-menu-cat-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="svc-order-state error" role="alert">
          <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {loadError}
          <button type="button" className="btn btn-outline" style={{ marginLeft: 10, fontSize: 11.5, padding: '4px 10px' }} onClick={fetchMenu}>
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className="svc-order-state">
          <Loader2 size={15} className="svc-spin" style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Loading menu…
        </div>
      )}

      {!isLoading && !loadError && filteredFoods.length === 0 && (
        <div className="svc-order-state">No dishes found for this search or category.</div>
      )}

      {!isLoading && !loadError && filteredFoods.length > 0 && (
        <div className="svc-menu-grid">
          {filteredFoods.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div key={item.id} className="svc-menu-item">
                <div className="svc-menu-item-top">
                  <div>
                    <div className="svc-menu-item-name">{item.name}</div>
                    <div className="svc-menu-item-cat">{item.category}</div>
                  </div>
                  <div className="svc-menu-item-price">{money(item.price)}</div>
                </div>
                <div className="svc-menu-item-qty">
                  {qty === 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: 12, padding: '6px 14px', width: '100%', justifyContent: 'center' }}
                      onClick={() => changeQty(item.id, 1)}
                    >
                      <Plus size={13} /> Add
                    </button>
                  ) : (
                    <div className="svc-qty-ctrl">
                      <button type="button" className="svc-qty-btn" onClick={() => changeQty(item.id, -1)}>
                        <Minus size={13} />
                      </button>
                      <span className="svc-qty-val">{qty}</span>
                      <button type="button" className="svc-qty-btn add" onClick={() => changeQty(item.id, 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="svc-cart-summary">
          <div className="svc-cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="svc-cart-line">
                <span>
                  {item.qty} × {item.name}
                </span>
                <strong>{money(item.subtotal)}</strong>
              </div>
            ))}
          </div>
          <div className="svc-cart-divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Items ({cartCount})</span>
            <strong>{money(cartTotal)}</strong>
          </div>
          {submitError && (
            <div className="svc-order-state error" role="alert" style={{ marginTop: 10 }}>
              <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {submitError}
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
            disabled={isDisabled || isSubmitting || !sessionId}
            onClick={handleSendToKitchen}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="svc-spin" /> Sending…
              </>
            ) : (
              <>
                <Plus size={16} /> Send to Kitchen ({money(cartTotal)})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
