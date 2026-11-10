import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Minus,
  Search,
  Utensils,
  CheckCircle2,
  X,
  RefreshCw,
  ShoppingBag,
  Banknote,
  Smartphone,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { URLS } from '../../../url';

export default function AddItemsModal({
  isOpen,
  onClose,
  order,
  menuItems = [],
  menuCategories = [],
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
  onUpdateSuccess,
}) {
  const [newCart, setNewCart] = useState({});
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewCart({});
      setCategory('All');
      setSearch('');
      setPayMethod('Cash');
      setCashReceived('');
      setIsSubmitting(false);
      setErrorMsg('');
    }
  }, [isOpen, order]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    return {
      'Content-Type': 'application/json',
      ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  };

  const filteredMenu = useMemo(() => {
    return menuItems.filter((m) => {
      const catOk = category === 'All' || m.category === category;
      const q = search.trim().toLowerCase();
      const itemName = (m.dishName || m.name || '').toLowerCase();
      const searchOk = !q || itemName.includes(q);
      return catOk && searchOk;
    });
  }, [menuItems, category, search]);

  const changeQty = (id, delta) => {
    setNewCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const newlyAddedItems = useMemo(() => {
    return Object.entries(newCart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id || m._id === id);
        return {
          ...item,
          productId: item?._id || item?.id || id,
          id: item?.id || id,
          _id: item?._id || id,
          name: item?.dishName || item?.name || 'Dish',
          price: Number(item?.price || 0),
          qty,
          subtotal: Number(item?.price || 0) * qty,
        };
      });
  }, [newCart, menuItems]);

  const additionalSubtotal = useMemo(
    () => newlyAddedItems.reduce((s, i) => s + i.subtotal, 0),
    [newlyAddedItems]
  );

  const previousTotal = Number(order?.total || 0);
  const updatedTotal = previousTotal + additionalSubtotal;

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newlyAddedItems.length === 0) {
      alert('Please add at least 1 new dish.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build combined items: existing items + newly added items
      const existingItems = Array.isArray(order.itemsList) ? order.itemsList : [];
      const existingPayloadItems = existingItems.map((it) => ({
        productId: it.productId || it._id || it.id,
        quantity: Number(it.qty || it.quantity || 1),
      })).filter((it) => Boolean(it.productId));

      const newPayloadItems = newlyAddedItems.map((it) => ({
        productId: it.productId || it._id || it.id,
        quantity: Number(it.qty || 1),
      }));

      // Merge quantities if product was already in order
      const mergedMap = new Map();
      [...existingPayloadItems, ...newPayloadItems].forEach((item) => {
        const pId = String(item.productId);
        if (mergedMap.has(pId)) {
          mergedMap.set(pId, mergedMap.get(pId) + item.quantity);
        } else {
          mergedMap.set(pId, item.quantity);
        }
      });

      const combinedItems = Array.from(mergedMap.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const targetId = order.mongoId || order._id || order.id;

      const res = await fetch(`${URLS.UpdateTakeaway}${targetId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          items: combinedItems,
        }),
      });

      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        // If additional payment is settled with UPI or Card, record payment
        if (additionalSubtotal > 0 && (payMethod === 'UPI' || payMethod === 'Card')) {
          try {
            await fetch(`${URLS.UpdateTakeawayPayment}${targetId}/payment`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ transactionId: `${payMethod}-ADD-${Date.now()}` }),
            });
          } catch (payErr) {
            console.warn('Payment update warning:', payErr);
          }
        }

        const updatedOrderObj = {
          ...order,
          items: (order.items || 0) + newlyAddedItems.reduce((s, it) => s + it.qty, 0),
          itemsList: [
            ...existingItems,
            ...newlyAddedItems.map((it) => ({
              name: it.name,
              dishName: it.name,
              qty: it.qty,
              price: it.price,
              subtotal: it.subtotal,
            })),
          ],
          total: updatedTotal,
          subtotal: Number(order.subtotal || 0) + additionalSubtotal,
        };

        if (onUpdateSuccess) {
          onUpdateSuccess(updatedOrderObj, result);
        }

        onClose();
      } else {
        const errMsg = result.message || 'Failed to update order items.';
        setErrorMsg(errMsg);
      }
    } catch (err) {
      console.error('Error adding items to order:', err);
      setErrorMsg('Network error while updating order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card extra-wide" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <ShoppingBag size={20} color="var(--primary)" /> Add More Items to Order ({order.id})
          </div>
          <button
            type="button"
            className="svc-modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            {errorMsg && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20 }}>
              {/* Left Column: Menu Selection */}
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 750, color: '#0f172a', marginBottom: 10 }}>
                  <Utensils size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--primary)' }} />
                  Select Additional Dishes
                </div>

                <div className="svc-input-with-icon" style={{ marginBottom: 10 }}>
                  <Search size={15} className="svc-input-icon" />
                  <input
                    className="form-control"
                    placeholder="Search dishes to add…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="svc-menu-cats" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {menuCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`svc-menu-cat-btn ${category === c ? 'active' : ''}`}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="svc-menu-grid" style={{ maxHeight: 310 }}>
                  {filteredMenu.map((item) => {
                    const itemId = item._id || item.id;
                    const qty = newCart[itemId] || 0;
                    const displayName = item.dishName || item.name || 'Dish';

                    return (
                      <div key={itemId} className="svc-menu-item">
                        <div className="svc-menu-item-top">
                          <div>
                            <div className="svc-menu-item-name">{displayName}</div>
                            <div className="svc-menu-item-cat">{item.category}</div>
                          </div>
                          <div className="svc-menu-item-price">{money(item.price)}</div>
                        </div>
                        <div className="svc-menu-item-qty">
                          {qty === 0 ? (
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ fontSize: 12, padding: '5px 12px', width: '100%', justifyContent: 'center' }}
                              onClick={() => changeQty(itemId, 1)}
                            >
                              <Plus size={13} /> Add
                            </button>
                          ) : (
                            <div className="svc-qty-ctrl">
                              <button type="button" className="svc-qty-btn" onClick={() => changeQty(itemId, -1)}>
                                <Minus size={13} />
                              </button>
                              <span className="svc-qty-val">{qty}</span>
                              <button type="button" className="svc-qty-btn add" onClick={() => changeQty(itemId, 1)}>
                                <Plus size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredMenu.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      No dishes found in category &quot;{category}&quot;.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Info & Additional Payment */}
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
                <div style={{ fontSize: 14, fontWeight: 750, color: '#0f172a', marginBottom: 6 }}>
                  Order Details
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 12 }}>
                  Customer: <strong>{order.guest}</strong> · Phone: {order.phone || 'N/A'}
                </div>

                {/* Existing Items in order */}
                <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Existing Ordered Items:
                  </div>
                  {Array.isArray(order.itemsList) && order.itemsList.length > 0 ? (
                    order.itemsList.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#334155', marginBottom: 3 }}>
                        <span>{it.qty || it.quantity || 1} × {it.dishName || it.name || 'Dish'}</span>
                        <strong>{money(it.subtotal || ((it.price || 0) * (it.qty || 1)))}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{order.items} items already ordered</div>
                  )}
                </div>

                {/* Newly Added Items */}
                <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                    Newly Added ({newlyAddedItems.length} items):
                  </div>
                  {newlyAddedItems.length > 0 ? (
                    newlyAddedItems.map((it) => (
                      <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#0f172a', marginBottom: 3 }}>
                        <span>{it.qty} × {it.name}</span>
                        <strong>+{money(it.subtotal)}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>No extra dishes added yet</div>
                  )}
                </div>

                {/* Totals Breakdown */}
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Previous Total:</span>
                    <strong>{money(previousTotal)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6, color: 'var(--primary)', fontWeight: 700 }}>
                    <span>Extra Amount Due:</span>
                    <strong>+{money(additionalSubtotal)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                    <span>Updated Grand Total:</span>
                    <strong style={{ color: 'var(--primary)' }}>{money(updatedTotal)}</strong>
                  </div>
                </div>

                {/* Additional Payment Tender */}
                <label className="form-label" style={{ marginBottom: 6, display: 'block', fontSize: 12 }}>
                  Settle Extra Amount ({money(additionalSubtotal)})
                </label>
                <div className="svc-checkout-tender-tabs" style={{ marginBottom: 10 }}>
                  <button
                    type="button"
                    className={`svc-checkout-tender-btn ${payMethod === 'Cash' ? 'active' : ''}`}
                    onClick={() => setPayMethod('Cash')}
                  >
                    <Banknote size={14} /> Cash
                  </button>
                  <button
                    type="button"
                    className={`svc-checkout-tender-btn ${payMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPayMethod('UPI')}
                  >
                    <Smartphone size={14} /> UPI
                  </button>
                  <button
                    type="button"
                    className={`svc-checkout-tender-btn ${payMethod === 'Card' ? 'active' : ''}`}
                    onClick={() => setPayMethod('Card')}
                  >
                    <CreditCard size={14} /> Card
                  </button>
                </div>

                {payMethod === 'Cash' && additionalSubtotal > 0 && (
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder={`Cash tendered for extra (${money(additionalSubtotal)})`}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={newlyAddedItems.length === 0 || isSubmitting}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={15} className="spin" /> Updating Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Update Order & Settle ({money(additionalSubtotal)})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

