import React, { useEffect, useRef, useState } from 'react';
import { Armchair, Clock3, IndianRupee, Utensils } from 'lucide-react';
import { URLS } from '../../../url';

const defaultMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function DineInStatsCards({
  refreshKey = 0,
  onDashboardLoaded,
  money = defaultMoney,
}) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const onLoadedRef = useRef(onDashboardLoaded);

  // Keep the latest callback without re-triggering the fetch effect
  useEffect(() => {
    onLoadedRef.current = onDashboardLoaded;
  }, [onDashboardLoaded]);

  // ── API: DINE-IN DASHBOARD CARDS ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const hasToken =
          token && token !== 'undefined' && token !== 'null' && token.trim() !== '';

        const res = await fetch(URLS.GetDineInCards, {
          headers: {
            'Content-Type': 'application/json',
            ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
          },
        });
        const data = await res.json();
        const dash = data.dashboard || data.data?.dashboard || data.data || null;

        if (cancelled || !dash) return;
        setDashboard(dash);
        onLoadedRef.current?.(dash);
      } catch (err) {
        console.warn('Dine-in dashboard cards fetch warning:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const d = dashboard || {};
  const totalTables = Number(d.totalTables ?? 0);

  const cards = [
    {
      label: 'Active Sessions',
      value: Number(d.activeSessions ?? 0),
      hint: 'Currently seated',
      icon: <Utensils size={18} />,
      tone: 'orange',
    },
    {
      label: 'Available Tables',
      value: Number(d.availableTables ?? 0),
      hint: totalTables > 0 ? `of ${totalTables} tables` : 'Ready to seat',
      icon: <Armchair size={18} />,
      tone: 'green',
    },
    {
      label: 'Reserved',
      value: Number(d.reservedTables ?? d.reserved ?? 0),
      hint: 'Upcoming holds',
      icon: <Clock3 size={18} />,
      tone: 'blue',
    },
    {
      label: 'Open Checks',
      value: money(d.openChecksAmount ?? 0),
      hint: 'Unbilled amount',
      icon: <IndianRupee size={18} />,
      tone: 'amber',
    },
  ];

  if (loading && !dashboard) {
    // Skeleton shimmer while the dashboard payload loads for the first time
    return (
      <div className="dinein-stats-grid">
        {cards.map((card) => (
          <div className="dinein-stat-card is-skeleton" key={card.label}>
            <div className="dinein-stat-top">
              <span className="dinein-stat-icon-sk" />
            </div>
            <div className="dinein-stat-body">
              <span className="dinein-stat-line lg" />
              <span className="dinein-stat-line sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dinein-stats-grid">
      {cards.map((card) => (
        <article className="dinein-stat-card" data-tone={card.tone} key={card.label}>
          <div className="dinein-stat-top">
            <span className="dinein-stat-icon">{card.icon}</span>
            <span className="dinein-stat-hint">{card.hint}</span>
          </div>
          <div className="dinein-stat-body">
            <div className="dinein-stat-value">{card.value}</div>
            <div className="dinein-stat-label">{card.label}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
