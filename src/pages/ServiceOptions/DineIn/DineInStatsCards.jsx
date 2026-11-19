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

  const cards = [
    {
      label: 'Active Sessions',
      value: Number(d.activeSessions ?? 0),
      icon: <Utensils size={20} />,
      iconBg: '#fff7ed',
      iconColor: '#ea580c',
    },
    {
      label: 'Available Tables',
      value: Number(d.availableTables ?? 0),
      icon: <Armchair size={20} />,
      iconBg: '#ecfdf5',
      iconColor: '#059669',
    },
    {
      label: 'Reserved',
      value: Number(d.reservedTables ?? d.reserved ?? 0),
      icon: <Clock3 size={20} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      label: 'Open Checks',
      value: money(d.openChecksAmount ?? 0),
      icon: <IndianRupee size={20} />,
      iconBg: '#fef3c7',
      iconColor: '#d97706',
    },
  ];

  if (loading && !dashboard) {
    // Skeleton shimmer while the dashboard payload loads for the first time
    return (
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              height: 86,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid" style={{ marginBottom: 22 }}>
      {cards.map((card) => (
        <div className="stat-card" key={card.label}>
          <div className="stat-icon" style={{ background: card.iconBg, color: card.iconColor }}>
            {card.icon}
          </div>
          <div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
