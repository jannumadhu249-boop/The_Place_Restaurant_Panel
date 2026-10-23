import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Plus, Calendar, DollarSign, Edit2, Trash2, Search } from 'lucide-react';

export default function Campaign() {
  const [campaigns, setCampaigns] = useState([
    { id: 1, title: 'Diwali Festive Feast', budget: '200', startDate: '2026-10-25', endDate: '2026-11-05', targetAudience: 'All Nearby Customers', impressions: '4,280', status: 'Upcoming' },
    { id: 2, title: 'Weekend Biryani Rush', budget: '120', startDate: '2026-10-18', endDate: '2026-10-21', targetAudience: 'Repeat Food Lovers', impressions: '8,410', status: 'Completed' },
    { id: 3, title: 'Free Delivery Tuesdays', budget: '80', startDate: '2026-10-01', endDate: '2026-10-31', targetAudience: 'Radius 5km', impressions: '12,900', status: 'Running' },
    { id: 4, title: 'Winter Lunchtime Combos', budget: '100', startDate: '2026-11-01', endDate: '2026-11-15', targetAudience: 'Office Workers Downtown', impressions: '3,100', status: 'Upcoming' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = campaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.targetAudience.toLowerCase().includes(search.toLowerCase()) ||
    c.status.toLowerCase().includes(search.toLowerCase())
  );

  const deleteCampaign = (id) => {
    if (window.confirm('Delete this marketing campaign?')) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Megaphone size={22} color="var(--primary)" /> Store Marketing Campaigns</h1>
          <p className="page-desc">Boost restaurant visibility, promote seasonal menus, and drive food orders</p>
        </div>
        <Link to="/campaigns/create" className="btn btn-primary">
          <Plus size={16} /> Create Campaign
        </Link>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search campaigns by title or audience..."
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
                <th>Campaign Name</th>
                <th>Allocated Budget</th>
                <th>Target Audience</th>
                <th>Campaign Duration</th>
                <th>Reach / Impressions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.title}</strong></td>
                  <td><strong>${c.budget}</strong></td>
                  <td><span className="badge badge-info">{c.targetAudience}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {c.startDate} to {c.endDate}
                  </td>
                  <td>
                    <span className="badge badge-primary">{c.impressions} Views</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      c.status === 'Running' ? 'badge-success' :
                      c.status === 'Upcoming' ? 'badge-warning' : 'badge-muted'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/campaigns/edit/${c.id}`} className="action-btn" title="Edit Campaign">
                        <Edit2 size={14} />
                      </Link>
                      <button className="action-btn delete" title="Delete Campaign" onClick={() => deleteCampaign(c.id)}>
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
