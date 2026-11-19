import React from 'react';
import {
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Package,
  ListOrdered,
  CalendarCheck,
  IndianRupee,
  XCircle,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

export default function TakeawayStatsCards({
  summary = null,
  loading = false,
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
}) {
  const os = summary?.orderStatus || {};
  const ps = summary?.paymentStatus || {};

  const cards = [
    // ── Row 1: Overview ─────────────────────────────────────
    {
      label: 'Total Orders',
      value: Number(summary?.totalOrders ?? 0),
      icon: <ListOrdered size={22} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      subtitle: 'All time takeaways',
    },
    {
      label: "Today's Orders",
      value: Number(summary?.todayOrders ?? 0),
      icon: <CalendarCheck size={22} />,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      subtitle: 'New orders today',
    },
    {
      label: "Today's Revenue",
      value: money(summary?.todayRevenue ?? 0),
      icon: <IndianRupee size={22} />,
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      subtitle: 'Total collected today',
      isMoney: true,
    },

    // ── Row 2: Order Status ──────────────────────────────────
    // {
    //   label: 'Queued',
    //   value: Number(os.queued ?? 0),
    //   icon: <Package size={20} />,
    //   iconBg: '#eff6ff',
    //   iconColor: '#2563eb',
    //   subtitle: 'Waiting to prepare',
    // },
    // {
    //   label: 'Preparing',
    //   value: Number(os.preparing ?? 0),
    //   icon: <Clock3 size={20} />,
    //   iconBg: '#fff7ed',
    //   iconColor: '#ea580c',
    //   subtitle: 'In kitchen',
    // },
    // {
    //   label: 'Ready',
    //   value: Number(os.ready ?? 0),
    //   icon: <CheckCircle2 size={20} />,
    //   iconBg: '#ecfdf5',
    //   iconColor: '#059669',
    //   subtitle: 'Ready for pickup',
    // },
    // {
    //   label: 'Picked Up',
    //   value: Number(os.pickedUp ?? os.picked_up ?? 0),
    //   icon: <ShoppingBag size={20} />,
    //   iconBg: '#f0f9ff',
    //   iconColor: '#0284c7',
    //   subtitle: 'Completed',
    // },
    // {
    //   label: 'Cancelled',
    //   value: Number(os.cancelled ?? 0),
    //   icon: <XCircle size={20} />,
    //   iconBg: '#fef2f2',
    //   iconColor: '#dc2626',
    //   subtitle: 'Cancelled orders',
    // },

    // ── Row 3: Payment Status ────────────────────────────────
    // {
    //   label: 'Paid',
    //   value: Number(ps.paid ?? 0),
    //   icon: <CreditCard size={20} />,
    //   iconBg: '#ecfdf5',
    //   iconColor: '#059669',
    //   subtitle: 'Payment received',
    // },
    // {
    //   label: 'Unpaid',
    //   value: Number(ps.unpaid ?? 0),
    //   icon: <AlertTriangle size={20} />,
    //   iconBg: '#fef2f2',
    //   iconColor: '#dc2626',
    //   subtitle: 'Pending payment',
    // },
  ];

  if (loading && !summary) {
    // Skeleton shimmer while loading first time
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              height: 96,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
        marginBottom: 22,
        width: '100%',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 14,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
            transition: 'all 0.2s ease',
          }}
        >
          {/* Left: Metric details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '0.01em',
                marginBottom: 4,
              }}
            >
              {card.label}
            </div>

            <div
              style={{
                fontSize: card.isMoney ? 24 : 26,
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              {card.value}
            </div>

            {card.subtitle && (
              <div
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {card.subtitle}
              </div>
            )}
          </div>

          {/* Right: Round icon container */}
          <div
            style={{
              background: card.iconBg,
              color: card.iconColor,
              width: 48,
              height: 48,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
