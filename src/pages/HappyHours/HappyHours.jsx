import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus, Trash2, Edit2, Search } from 'lucide-react';

export default function HappyHours() {
  const [deals, setDeals] = useState([
    { id: 1, title: 'Evening Rush Hour', discount: '20% OFF', days: 'Mon, Tue, Wed, Thu, Fri', startTime: '17:00', endTime: '19:30', active: true },
    { id: 2, title: 'Late Night Cravings', discount: '15% OFF', days: 'Sat, Sun', startTime: '22:00', endTime: '23:59', active: true },
    { id: 3, title: 'Lunch Bonanza', discount: 'Flat $5 OFF', days: 'Mon, Tue, Wed', startTime: '12:00', endTime: '15:00', active: false },
    { id: 4, title: 'Sunday Family Feast', discount: '25% OFF', days: 'Sun', startTime: '13:00', endTime: '17:00', active: true },
  ]);

  const [search, setSearch] = useState('');

  const filtered = deals.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.discount.toLowerCase().includes(search.toLowerCase()) ||
    d.days.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setDeals(deals.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  const deleteDeal = (id) => {
    if (window.confirm('Delete this Happy Hour deal?')) {
      setDeals(deals.filter(d => d.id !== id));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Clock size={22} color="var(--primary)" /> Happy Hours</h1>
          <p className="page-desc">Automated discounts during specific hours and days of the week</p>
        </div>
        <Link to="/happy-hours/create" className="btn btn-primary">
          <Plus size={16} /> Create Happy Hour
        </Link>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search happy hour deal or days..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal Name</th>
                <th>Discount Benefit</th>
                <th>Applicable Days</th>
                <th>Time Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.title}</strong></td>
                  <td><span className="badge badge-primary">{d.discount}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.days}</td>
                  <td>
                    <span style={{ fontWeight: 600, background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 12 }}>
                      {d.startTime} - {d.endTime}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(d.id)}
                      className={`badge ${d.active ? 'badge-success' : 'badge-muted'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {d.active ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/happy-hours/edit/${d.id}`} className="action-btn" title="Edit Deal">
                        <Edit2 size={14} />
                      </Link>
                      <button className="action-btn delete" title="Delete Deal" onClick={() => deleteDeal(d.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
