import React from 'react';
import { Printer, X } from 'lucide-react';

export default function TakeawayBillModal({
  isOpen,
  onClose,
  order,
  packingFee = 15,
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
  onPrint = () => {},
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <Printer size={20} color="var(--primary)" /> Takeaway Receipt — {order.id}
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
          <div className="svc-bill-preview">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>TAKEAWAY INVOICE</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{order.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{order.guest}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Slot: {order.slot}</div>
              </div>
            </div>

            <div className="svc-bill-row">
              <span>Order Items ({order.items})</span>
              <strong>{money(order.subtotal || (order.total - packingFee + (order.discount || 0)))}</strong>
            </div>
            {order.discount > 0 && (
              <div className="svc-bill-row" style={{ color: '#059669' }}>
                <span>Discount {order.coupon ? `(${order.coupon})` : ''}</span>
                <strong>- {money(order.discount)}</strong>
              </div>
            )}
            <div className="svc-bill-row">
              <span>Packaging Charges</span>
              <strong>{money(packingFee)}</strong>
            </div>
            <div className="svc-bill-row total">
              <span>Total Paid</span>
              <strong>{money(order.total)}</strong>
            </div>
            <div style={{ fontSize: 12, marginTop: 10, opacity: 0.85 }}>
              Payment Method: <strong>{order.payment}</strong>
            </div>
          </div>
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
            onClick={onPrint}
          >
            <Printer size={15} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

