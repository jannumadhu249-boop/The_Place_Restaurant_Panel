import React, { useMemo, useState } from 'react';
import {
  UserCheck,
  Users,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Coffee,
  Star,
  Shield,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Trash2,
} from 'lucide-react';
import '../ServiceOps.css';
import CreateCaptainModal from './CreateCaptainModal';
import UpdateCaptainModal from './UpdateCaptainModal';

const INITIAL_CAPTAINS = [
  {
    id: 'CAP-01',
    name: 'Ananya Sharma',
    role: 'Floor Captain',
    phone: '+91 98765 11220',
    email: 'ananya.s@theplace.com',
    section: 'Main Hall',
    shift: 'Lunch (11:00 AM - 4:30 PM)',
    status: 'Active',
    ordersCount: 342,
    rating: 4.9,
    tables: ['T01', 'T04', 'T10'],
  },
  {
    id: 'CAP-02',
    name: 'Vikram Patel',
    role: 'Floor Captain',
    phone: '+91 98450 33441',
    email: 'vikram.p@theplace.com',
    section: 'Patio & Main Hall',
    shift: 'Full Day (11:00 AM - 10:00 PM)',
    status: 'Active',
    ordersCount: 418,
    rating: 4.8,
    tables: ['T02', 'T05', 'T06', 'T11'],
  },
  {
    id: 'CAP-03',
    name: 'Meera Nair',
    role: 'Senior Server',
    phone: '+91 97120 55662',
    email: 'meera.n@theplace.com',
    section: 'Bar & Private Dining',
    shift: 'Dinner (5:00 PM - 11:30 PM)',
    status: 'Active',
    ordersCount: 290,
    rating: 4.9,
    tables: ['T03', 'T07', 'T08', 'T09', 'T12'],
  },
  {
    id: 'CAP-04',
    name: 'Karan Malhotra',
    role: 'Table Server',
    phone: '+91 99650 77883',
    email: 'karan.m@theplace.com',
    section: 'Main Hall',
    shift: 'Dinner (5:00 PM - 11:30 PM)',
    status: 'Off Duty',
    ordersCount: 156,
    rating: 4.7,
    tables: [],
  },
];

function statusColors(s) {
  if (s === 'Active') return { bg: '#ecfdf5', color: '#059669', dot: '#10b981' };
  if (s === 'On Break') return { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' };
  return { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
}

export default function Captains() {
  const [captains, setCaptains] = useState(INITIAL_CAPTAINS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCaptain, setEditingCaptain] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const filteredCaptains = useMemo(() =>
    captains.filter((c) => {
      const matchRole = roleFilter === 'All' || c.role === roleFilter;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) || c.section.toLowerCase().includes(q);
      return matchRole && matchStatus && matchSearch;
    }), [captains, roleFilter, statusFilter, search]);

  const stats = useMemo(() => ({
    total: captains.length,
    active: captains.filter((c) => c.status === 'Active').length,
    onBreak: captains.filter((c) => c.status === 'On Break').length,
    offDuty: captains.filter((c) => c.status === 'Off Duty').length,
  }), [captains]);

  const handleAddCaptain = (data) => {
    const newId = `CAP-0${captains.length + 1}`;
    setCaptains((prev) => [...prev, { id: newId, ...data }]);
    showToast(`✓ ${data.name} added as ${data.role}!`);
  };

  const openEditModal = (cap) => { setEditingCaptain(cap); setIsEditModalOpen(true); };

  const handleSaveCaptain = (updated) => {
    setCaptains((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    showToast(`✓ ${updated.name} updated!`);
  };

  const handleDeleteCaptain = (capId, name) => {
    if (window.confirm(`Remove ${name} (${capId}) from the floor staff list?`)) {
      setCaptains((prev) => prev.filter((c) => c.id !== capId));
      showToast(`✓ ${name} removed.`);
    }
  };

  const handleToggleStatus = (capId, current) => {
    const next = current === 'Active' ? 'On Break' : current === 'On Break' ? 'Off Duty' : 'Active';
    setCaptains((prev) => prev.map((c) => (c.id === capId ? { ...c, status: next } : c)));
    showToast(`✓ Status updated to "${next}".`);
  };

  return (
    <div style={{ width: '100%' }}>

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserCheck size={22} color="var(--primary)" /> Captains & Floor Servers
          </h1>
          <p className="page-desc">
            Manage floor captains, servers, assigned zones, shift schedules and ratings
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Captain
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total Staff', value: stats.total, bg: '#eff6ff', color: '#3b82f6', Icon: Users },
          { label: 'Active on Floor', value: stats.active, bg: '#ecfdf5', color: '#10b981', Icon: CheckCircle2 },
          { label: 'On Break', value: stats.onBreak, bg: '#fff7ed', color: '#f97316', Icon: Coffee },
          { label: 'Off Duty', value: stats.offDuty, bg: '#f8fafc', color: '#64748b', Icon: Clock },
        ].map(({ label, value, bg, color, Icon }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}><Icon size={20} /></div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter ───────────────────────────────── */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="svc-input-with-icon" style={{ width: 220 }}>
            <Search size={15} className="svc-input-icon" />
            <input
              className="form-control"
              placeholder="Name, ID, section…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
          <select className="form-control" style={{ width: 160, fontSize: 13 }}
            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="Floor Captain">Floor Captain</option>
            <option value="Senior Server">Senior Server</option>
            <option value="Table Server">Table Server</option>
            <option value="Trainee">Trainee</option>
          </select>
          <select className="form-control" style={{ width: 150, fontSize: 13 }}
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Break">On Break</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* ── Staff Cards — Dual Column Grid ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filteredCaptains.map((c) => {
          const sc = statusColors(c.status);
          return (
            <div
              key={c.id}
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              {/* LEFT — info panel */}
              <div style={{ flex: 1, padding: '18px 16px 16px' }}>

                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: sc.bg, color: sc.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 15, flexShrink: 0,
                    border: `2px solid ${sc.dot}22`,
                  }}>
                    {c.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 750, fontSize: 14.5, color: '#0f172a', lineHeight: 1.2 }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Shield size={11} /> {c.role}
                    </div>
                  </div>
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 650, padding: '3px 9px',
                    borderRadius: 20, background: sc.bg, color: sc.color,
                    border: `1px solid ${sc.dot}44`, flexShrink: 0,
                  }}>
                    {c.status}
                  </span>
                </div>

                {/* Info rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                  {[
                    { icon: <MapPin size={12} color="var(--primary)" />, text: c.section },
                    { icon: <Clock size={12} color="#f97316" />, text: c.shift },
                    { icon: <Phone size={12} color="#64748b" />, text: c.phone },
                    { icon: <Mail size={12} color="#64748b" />, text: c.email },
                  ].map(({ icon, text }, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {icon} <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 0, background: '#f8fafc', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  {[
                    { label: 'Orders', value: c.ordersCount },
                    { label: 'Rating', value: `⭐ ${c.rating}` },
                    { label: 'Tables', value: c.tables.length },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} style={{
                      flex: 1, padding: '8px 0', textAlign: 'center',
                      borderRight: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{value}</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — actions column */}
              <div style={{
                width: 100, flexShrink: 0,
                borderLeft: '1px solid #f1f5f9',
                display: 'flex', flexDirection: 'column',
                gap: 0, padding: '12px 10px',
                justifyContent: 'center',
              }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: 12, padding: '8px 6px', justifyContent: 'center', marginBottom: 7, flexDirection: 'column', gap: 3 }}
                  onClick={() => openEditModal(c)}
                >
                  <Edit2 size={14} />
                  <span style={{ fontSize: 11 }}>Edit</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: 12, padding: '8px 6px', justifyContent: 'center', marginBottom: 7, flexDirection: 'column', gap: 3,
                    color: c.status === 'Active' ? '#f97316' : c.status === 'On Break' ? '#64748b' : '#059669',
                    borderColor: c.status === 'Active' ? '#fed7aa' : c.status === 'On Break' ? '#e2e8f0' : '#a7f3d0',
                  }}
                  onClick={() => handleToggleStatus(c.id, c.status)}
                >
                  {c.status === 'Active' ? (
                    <><Coffee size={14} /><span style={{ fontSize: 10 }}>Break</span></>
                  ) : c.status === 'On Break' ? (
                    <><Clock size={14} /><span style={{ fontSize: 10 }}>Off Duty</span></>
                  ) : (
                    <><CheckCircle2 size={14} /><span style={{ fontSize: 10 }}>Activate</span></>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: 12, padding: '8px 6px', justifyContent: 'center', flexDirection: 'column', gap: 3,
                    color: '#ef4444', borderColor: '#fecaca' }}
                  onClick={() => handleDeleteCaptain(c.id, c.name)}
                >
                  <Trash2 size={14} />
                  <span style={{ fontSize: 11 }}>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCaptains.length === 0 && (
        <div style={{ padding: 50, textAlign: 'center', color: '#64748b', fontSize: 14,
          background: '#f8fafc', borderRadius: 14, border: '1.5px dashed #cbd5e1' }}>
          No staff members match your search.
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────── */}
      <CreateCaptainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCaptain={handleAddCaptain}
      />
      <UpdateCaptainModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingCaptain(null); }}
        captain={editingCaptain}
        onSaveCaptain={handleSaveCaptain}
      />

      {toastMessage && (
        <div className="svc-toast success">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}
    </div>
  );
}
