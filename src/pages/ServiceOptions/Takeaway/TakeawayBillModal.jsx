import React from 'react';
import { Printer, X, RefreshCw } from 'lucide-react';

export default function TakeawayBillModal({
  isOpen,
  onClose,
  order,
  invoiceData = null,
  isLoadingInvoice = false,
  packingFee = 15,
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
  onPrint,
}) {
  if (!isOpen || !order) return null;

  // Use live invoice data if returned by API, otherwise fall back to order details seamlessly
  const inv = invoiceData || {};
  const orderId = inv.invoiceNumber || inv.orderNumber || order.id || `TKW-${(order._id || '').slice(-4).toUpperCase()}`;
  const guestName = inv.customerName || inv.guest || order.guest || 'Guest';
  const phone = inv.customerPhone || inv.phone || order.phone || '';
  const slot = inv.pickupSlot || inv.slot || order.slot || '12:55';
  const totalAmount = inv.totalAmount ?? inv.grandTotal ?? order.total ?? 0;
  const discountAmount = inv.discountAmount ?? inv.discount ?? order.discount ?? 0;
  const items = (Array.isArray(inv.items) && inv.items.length > 0)
    ? inv.items
    : (Array.isArray(order.itemsList) ? order.itemsList : []);
  const paymentMethod = inv.paymentMethod || order.payment || 'Cash';
  const paymentStatus = inv.paymentStatus || order.paymentStatus || 'Unpaid';

  const handlePrintReceipt = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <Printer size={20} color="var(--primary)" /> Takeaway Receipt — {orderId}
          </div>
          <button
            type="button"
            className="svc-modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="svc-modal-body">
          {isLoadingInvoice ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={22} className="spin" style={{ marginBottom: 8 }} />
              <div>Fetching official invoice...</div>
            </div>
          ) : (
            <div className="svc-bill-preview svc-receipt-printable" id="takeaway-receipt-print">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.05em', opacity: 0.8 }}>THE PLACE RESTAURANT</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Takeaway Bill: {orderId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{guestName}</div>
                  {phone && <div style={{ fontSize: 11, opacity: 0.85 }}>{phone}</div>}
                  <div style={{ fontSize: 11, opacity: 0.85 }}>Slot: {slot}</div>
                </div>
              </div>

              {/* Items breakdown */}
              {items.length > 0 ? (
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '6px 0', marginBottom: 8 }}>
                  {items.map((it, idx) => {
                    const itemName = it.dishName || it.name || it.productName || 'Dish';
                    const itemQty = it.qty || it.quantity || 1;
                    const itemSub = it.subtotal || (it.price ? it.price * itemQty : 0);
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span>{itemQty} × {itemName}</span>
                        <strong>{money(itemSub)}</strong>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="svc-bill-row" style={{ padding: '4px 0' }}>
                  <span>Order Items ({order.items || 1})</span>
                  <strong>{money(order.subtotal || Math.max(0, totalAmount - packingFee + discountAmount))}</strong>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="svc-bill-row" style={{ color: '#34d399', padding: '3px 0', fontSize: 12 }}>
                  <span>Discount {order.coupon ? `(${order.coupon})` : ''}</span>
                  <strong>- {money(discountAmount)}</strong>
                </div>
              )}

              <div className="svc-bill-row" style={{ padding: '3px 0', fontSize: 12 }}>
                <span>Packaging Charges</span>
                <strong>{money(packingFee)}</strong>
              </div>

              <div className="svc-bill-row total" style={{ marginTop: 6, paddingTop: 8, fontSize: 14 }}>
                <span>Total Due</span>
                <strong>{money(totalAmount)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8, opacity: 0.85 }}>
                <span>Payment: <strong>{paymentMethod}</strong></span>
                <span>Status: <strong>{paymentStatus}</strong></span>
              </div>
            </div>
          )}
        </div>

        <div className="svc-modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrintReceipt}
          >
            <Printer size={15} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
