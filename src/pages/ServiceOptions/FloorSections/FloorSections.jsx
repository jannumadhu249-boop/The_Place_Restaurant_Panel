import React, { useMemo, useState } from 'react';
import {
  LayoutGrid,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  MapPin,
  Armchair,
  Users,
  Eye,
  EyeOff,
  Utensils,
  Sun,
  Sparkles,
  Wine,
  CloudSun,
  Building2,
  Check,
} from 'lucide-react';
import '../ServiceOps.css';
import CreateSectionModal from './CreateSectionModal';
import UpdateSectionModal from './UpdateSectionModal';

const INITIAL_SECTIONS = [
  {
    id: 'SEC-01',
    name: 'Main Hall',
    description: 'Main indoor dining area — primary seating zone for families & guests',
    capacity: 60,
    tableCount: 7,
    isActive: true,
    floorLevel: 'Ground Floor',
  },
  {
    id: 'SEC-02',
    name: 'Patio',
    description: 'Outdoor garden terrace — fresh open-air dining with scenic views',
    capacity: 24,
    tableCount: 3,
    isActive: true,
    floorLevel: 'Ground Floor',
  },
  {
    id: 'SEC-03',
    name: 'Private Dining',
    description: 'Exclusive private dining hall for VIP guests, parties & corporate dinners',
    capacity: 16,
    tableCount: 2,
    isActive: true,
    floorLevel: 'Ground Floor',
  },
  {
    id: 'SEC-04',
    name: 'Bar',
    description: 'High-top counter and lounge seating for handcrafted drinks & appetizers',
    capacity: 12,
    tableCount: 2,
    isActive: true,
    floorLevel: 'Ground Floor',
  },
  {
    id: 'SEC-05',
    name: 'Rooftop Lounge',
    description: 'Elevated rooftop terrace venue with evening skyline ambiance',
    capacity: 30,
    tableCount: 6,
    isActive: false,
    floorLevel: 'Rooftop',
  },
];

// Aesthetic theme styling mapping for each section type
const SECTION_THEMES = {
  'Main Hall': {
    icon: Utensils,
    themeColor: '#ea580c',
    lightBg: '#fff7ed',
    borderSoft: '#fed7aa',
    tag: 'Indoor Dining',
  },
  'Patio': {
    icon: Sun,
    themeColor: '#059669',
    lightBg: '#ecfdf5',
    borderSoft: '#a7f3d0',
    tag: 'Outdoor Terrace',
  },
  'Private Dining': {
    icon: Sparkles,
    themeColor: '#7c3aed',
    lightBg: '#f5f3ff',
    borderSoft: '#ddd6fe',
    tag: 'VIP & Events',
  },
  'Bar': {
    icon: Wine,
    themeColor: '#2563eb',
    lightBg: '#eff6ff',
    borderSoft: '#bfdbfe',
    tag: 'Drinks & Lounge',
  },
  'Rooftop Lounge': {
    icon: CloudSun,
    themeColor: '#db2777',
    lightBg: '#fdf2f8',
    borderSoft: '#fbcfe8',
    tag: 'Skyline Terrace',
  },
};

const DEFAULT_THEME = {
  icon: Building2,
  themeColor: '#4f46e5',
  lightBg: '#eef2ff',
  borderSoft: '#c7d2fe',
  tag: 'Floor Area',
};

export default function FloorSections() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Filtered list
  const filtered = useMemo(() => {
    return sections.filter((s) => {
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && s.isActive) ||
        (statusFilter === 'Inactive' && !s.isActive);
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        s.floorLevel.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [sections, search, statusFilter]);

  const stats = useMemo(() => ({
    total: sections.length,
    active: sections.filter((s) => s.isActive).length,
    totalCapacity: sections.filter((s) => s.isActive).reduce((sum, s) => sum + Number(s.capacity), 0),
    totalTables: sections.filter((s) => s.isActive).reduce((sum, s) => sum + Number(s.tableCount), 0),
  }), [sections]);

  // Add Section
  const handleAddSection = (newSec) => {
    const newId = `SEC-0${sections.length + 1}`;
    setSections((prev) => [...prev, { id: newId, ...newSec }]);
    showToast(`✓ Section "${newSec.name}" created successfully!`);
  };

  // Edit Section
  const openEditModal = (sec) => {
    setEditingSection(sec);
    setIsEditModalOpen(true);
  };

  const handleSaveSection = (updated) => {
    setSections((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
    showToast(`✓ Section "${updated.name}" updated!`);
  };

  // Delete Section
  const handleDelete = (sec) => {
    if (sec.tableCount > 0) {
      alert(`Cannot delete "${sec.name}" — it has ${sec.tableCount} tables assigned. Please reassign or delete those tables first.`);
      return;
    }
    if (window.confirm(`Delete section "${sec.name}" (${sec.id}) permanently?`)) {
      setSections((prev) => prev.filter((s) => s.id !== sec.id));
      showToast(`✓ Section "${sec.name}" deleted.`);
    }
  };

  // Toggle Active
  const toggleActive = (secId) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== secId) return s;
        const next = !s.isActive;
        showToast(`✓ Section "${s.name}" marked ${next ? 'Active' : 'Inactive'}.`);
        return { ...s, isActive: next };
      })
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <LayoutGrid size={22} color="var(--primary)" /> Floor Sections
          </h1>
          <p className="page-desc">
            Manage restaurant dining areas, seating capacity, and floor zones
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Add Section
          </button>
        </div>
      </div>

      {/* ── Stats Cards ───────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <LayoutGrid size={20} />
          </div>
          <div>
            <div className="stat-label">Total Sections</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-label">Active Sections</div>
            <div className="stat-value">{stats.active}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="stat-label">Total Capacity</div>
            <div className="stat-value">{stats.totalCapacity}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fdf4ff', color: '#8b5cf6' }}>
            <Armchair size={20} />
          </div>
          <div>
            <div className="stat-label">Active Tables</div>
            <div className="stat-value">{stats.totalTables}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter (Small size search bar) ────────── */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="svc-input-with-icon" style={{ width: 220 }}>
            <Search size={15} className="svc-input-icon" />
            <input
              className="form-control"
              placeholder="Search section name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
          <select
            className="form-control"
            style={{ width: 160, fontSize: 13 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* ── Enhanced Floor Section Cards Grid ─────────────── */}
      <div
        className="svc-table-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 20 }}
      >
        {filtered.map((sec) => {
          const theme = SECTION_THEMES[sec.name] || DEFAULT_THEME;
          const ThemeIcon = theme.icon;

          return (
            <div
              key={sec.id}
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: sec.isActive ? `1.5px solid #e2e8f0` : '1.5px dashed #cbd5e1',
                boxShadow: sec.isActive ? '0 4px 16px rgba(15, 23, 42, 0.04)' : 'none',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {/* Subtle top color strip indicator */}
              <div
                style={{
                  height: 4,
                  background: sec.isActive ? theme.themeColor : '#cbd5e1',
                  width: '100%',
                }}
              />

              <div style={{ padding: '20px 20px 16px' }}>
                {/* Header row with Icon avatar + Titles + Active Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: sec.isActive ? theme.lightBg : '#f1f5f9',
                        color: sec.isActive ? theme.themeColor : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1.5px solid ${sec.isActive ? theme.borderSoft : '#e2e8f0'}`,
                        flexShrink: 0,
                      }}
                    >
                      <ThemeIcon size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                        {sec.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: 5 }}>
                          {sec.id}
                        </span>
                        <span style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={11} color="#94a3b8" /> {sec.floorLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: sec.isActive ? '#ecfdf5' : '#f1f5f9',
                      color: sec.isActive ? '#059669' : '#64748b',
                      border: `1px solid ${sec.isActive ? '#a7f3d0' : '#cbd5e1'}`,
                      flexShrink: 0,
                    }}
                  >
                    {sec.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                {/* Section Category Tag & Description */}
                <div style={{ marginBottom: 14 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 650,
                      color: theme.themeColor,
                      background: theme.lightBg,
                      padding: '2px 8px',
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  >
                    {theme.tag}
                  </span>
                  {sec.description && (
                    <p style={{ fontSize: 12.5, color: '#475569', margin: 0, lineHeight: 1.45, minHeight: 36 }}>
                      {sec.description}
                    </p>
                  )}
                </div>

                {/* Capacity & Tables Metric Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    background: '#f8fafc',
                    borderRadius: 12,
                    padding: '12px 14px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                      }}
                    >
                      <Users size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {sec.capacity}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Max Seats</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#3b82f6',
                      }}
                    >
                      <Armchair size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {sec.tableCount}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Assigned Tables</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 20px',
                  borderTop: '1px solid #f1f5f9',
                  background: '#fafbfc',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: 12, padding: '7px 12px', justifyContent: 'center' }}
                  onClick={() => openEditModal(sec)}
                >
                  <Edit2 size={13} /> Edit Section
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    fontSize: 12,
                    padding: '7px 12px',
                    color: sec.isActive ? '#ea580c' : '#059669',
                    borderColor: sec.isActive ? '#fed7aa' : '#a7f3d0',
                  }}
                  onClick={() => toggleActive(sec.id)}
                  title={sec.isActive ? 'Deactivate Section' : 'Activate Section'}
                >
                  {sec.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: '7px 12px', color: '#ef4444', borderColor: '#fecaca' }}
                  onClick={() => handleDelete(sec)}
                  title="Delete Section"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            padding: 50,
            textAlign: 'center',
            color: '#64748b',
            fontSize: 14,
            background: '#f8fafc',
            borderRadius: 14,
            border: '1.5px dashed #cbd5e1',
          }}
        >
          <MapPin size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
          <div>No sections found matching your search.</div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────── */}
      <CreateSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={handleAddSection}
        existingNames={sections.map((s) => s.name)}
      />

      <UpdateSectionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSection(null);
        }}
        section={editingSection}
        onSaveSection={handleSaveSection}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="svc-toast success">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}
    </div>
  );
}
