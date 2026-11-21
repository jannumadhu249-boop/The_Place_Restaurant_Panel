import React from 'react';

/**
 * Tone-coded metric cards shared by every report page.
 * `cards` items: { label, value, hint, icon, tone }
 * tone: 'orange' | 'green' | 'blue' | 'amber' | 'violet' | 'slate' | 'red'
 */
export default function ReportStatsCards({ cards = [] }) {
  return (
    <div className="report-stats">
      {cards.map(({ label, value, hint, icon, tone }) => (
        <article className="report-stat" data-tone={tone} key={label}>
          <div className="report-stat-top">
            <span className="report-stat-icon">{icon}</span>
            {hint && <span className="report-stat-hint">{hint}</span>}
          </div>
          <div className="report-stat-body">
            <div className="report-stat-value">{value}</div>
            <div className="report-stat-label">{label}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
