import React from 'react';
import { ListOrdered, CalendarCheck, IndianRupee } from 'lucide-react';

export default function TakeawayStatsCards({
  summary = null,
  loading = false,
  money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`,
}) {
  const cards = [
    {
      label: 'Total Orders',
      value: Number(summary?.totalOrders ?? 0),
      hint: 'All time',
      icon: <ListOrdered size={18} />,
      tone: 'blue',
    },
    {
      label: "Today's Orders",
      value: Number(summary?.todayOrders ?? 0),
      hint: 'New today',
      icon: <CalendarCheck size={18} />,
      tone: 'green',
    },
    {
      label: "Today's Revenue",
      value: money(summary?.todayRevenue ?? 0),
      hint: 'Collected today',
      icon: <IndianRupee size={18} />,
      tone: 'amber',
    },
  ];

  if (loading && !summary) {
    // Skeleton shimmer while the dashboard payload loads for the first time
    return (
      <div className="svc-stats-grid">
        {cards.map((card) => (
          <div className="svc-stat-card is-skeleton" key={card.label}>
            <div className="svc-stat-top">
              <span className="svc-stat-icon-sk" />
            </div>
            <div className="svc-stat-body">
              <span className="svc-stat-line lg" />
              <span className="svc-stat-line sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="svc-stats-grid">
      {cards.map((card) => (
        <article className="svc-stat-card" data-tone={card.tone} key={card.label}>
          <div className="svc-stat-top">
            <span className="svc-stat-icon">{card.icon}</span>
            <span className="svc-stat-hint">{card.hint}</span>
          </div>
          <div className="svc-stat-body">
            <div className="svc-stat-value">{card.value}</div>
            <div className="svc-stat-label">{card.label}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
