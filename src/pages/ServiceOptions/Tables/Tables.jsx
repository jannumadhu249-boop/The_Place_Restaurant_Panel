import React, { useMemo, useState } from 'react';
import {
  LayoutGrid,
  Armchair,
  Users,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  UserCheck,
  List,
  Grid,
} from 'lucide-react';
import '../ServiceOps.css';
import CreateTableModal from './CreateTableModal';
import UpdateTableModal from './UpdateTableModal';

const INITIAL_TABLES = [
  { id: 'T01', section: 'Main Hall', seats: 2, status: 'available', captain: 'Ananya', shape: 'Square', minSpend: 0 },
  { id: 'T02', section: 'Main Hall', seats: 4, status: 'occupied', captain: 'Vikram', guest: 'Rahul S.', covers: 3, shape: 'Square', minSpend: 0 },
  { id: 'T03', section: 'Main Hall', seats: 4, status: 'reserved', captain: 'Meera', guest: 'Priya P.', covers: 4, shape: 'Round', minSpend: 0 },
  { id: 'T04', section: 'Main Hall', seats: 6, status: 'cleaning', captain: 'Ananya', shape: 'Rectangle', minSpend: 0 },
  { id: 'T05', section: 'Patio', seats: 2, status: 'available', captain: 'Vikram', shape: 'Square', minSpend: 0 },
  { id: 'T06', section: 'Patio', seats: 4, status: 'occupied', captain: 'Vikram', guest: 'Emma W.', covers: 2, shape: 'Square', minSpend: 0 },
  { id: 'T07', section: 'Patio', seats: 4, status: 'available', captain: 'Meera', shape: 'Square', minSpend: 0 },
  { id: 'T08', section: 'Private', seats: 8, status: 'reserved', captain: 'Ananya', guest: 'Corp Dinner', covers: 8, shape: 'Rectangle', minSpend: 2500 },
  { id: 'T09', section: 'Bar', seats: 2, status: 'occupied', captain: 'Meera', guest: 'James L.', covers: 1, shape: 'Round', minSpend: 0 },
  { id: 'T10', section: 'Bar', seats: 2, status: 'available', captain: 'Ananya', shape: 'Round', minSpend: 0 },
  { id: 'T11', section: 'Main Hall', seats: 4, status: 'available', captain: 'Vikram', shape: 'Square', minSpend: 0 },
  { id: 'T12', section: 'Main Hall', seats: 6, status: 'occupied', captain: 'Meera', guest: 'Sophie T.', covers: 5, shape: 'Rectangle', minSpend: 0 },
];

const SECTIONS = ['Main Hall', 'Patio', 'Private', 'Bar'];
const CAPTAINS = ['Ananya', 'Vikram', 'Meera', 'Unassigned'];

export default function Tables() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchSection = sectionFilter === 'All' || t.section === sectionFilter;
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.section.toLowerCase().includes(q) ||
        (t.captain || '').toLowerCase().includes(q) ||
        (t.guest || '').toLowerCase().includes(q);
      return matchSection && matchStatus && matchSearch;
    });
  }, [tables, sectionFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter((t) => t.status === 'available').length;
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const reserved = tables.filter((t) => t.status === 'reserved').length;
    return { total, available, occupied, reserved };
  }, [tables]);

  const statusBadge = (s) => {
    if (s === 'available') return 'badge-success';
    if (s === 'occupied') return 'badge-warning';
    if (s === 'reserved') return 'badge-info';
    return 'badge-muted';
  };

  // Add Table
  const handleAddTable = (newTable) => {
    setTables((prev) => [...prev, newTable]);
    showToast(`✓ Table ${newTable.id} added successfully to ${newTable.section}!`);
  };

  // Open Edit Modal
  const openEditModal = (table) => {
    setEditingTable(table);
    setIsEditModalOpen(true);
  };

  // Save Edit Table
  const handleSaveEditTable = (updatedTable) => {
    setTables((prev) =>
      prev.map((t) => (t.id === updatedTable.id ? { ...t, ...updatedTable } : t))
    );
    showToast(`✓ Table ${updatedTable.id} updated successfully!`);
  };

  // Delete Table (with occupancy check)
  const handleDeleteTable = (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    if (table.status === 'occupied') {
      alert(`Cannot delete Table ${tableId} because it is currently OCCUPIED by guests.`);
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete Table ${tableId} (${table.section})?`)) {
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      showToast(`✓ Table ${tableId} deleted.`);
    }
  };

  // Quick Status Toggle
  const handleStatusChange = (tableId, nextStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: nextStatus } : t))
    );
    showToast(`✓ Table ${tableId} marked as ${nextStatus}.`);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <LayoutGrid size={22} color="var(--primary)" /> Tables Management
          </h1>
          <p className="page-desc">
            Overview of all floor tables, seating capacity, assigned captains, and live occupancy status
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Add Table
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f8fafc', color: '#0f172a' }}>
            <Armchair size={20} />
          </div>
          <div>
            <div className="stat-label">Total Tables</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Armchair size={20} />
          </div>
          <div>
            <div className="stat-label">Available</div>
            <div className="stat-value">{stats.available}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <Armchair size={20} />
          </div>
          <div>
            <div className="stat-label">Occupied</div>
            <div className="stat-value">{stats.occupied}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Armchair size={20} />
          </div>
          <div>
            <div className="stat-label">Reserved</div>
            <div className="stat-value">{stats.reserved}</div>
          </div>
        </div>
      </div>

      {/* Search, Filters & View Toggle */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="svc-input-with-icon" style={{ width: 220 }}>
              <Search size={15} className="svc-input-icon" />
              <input
                className="form-control"
                placeholder="Search table, section…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>
            <select
              className="form-control"
              style={{ width: 140, fontSize: 13 }}
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <option value="All">All Sections</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className="form-control"
              style={{ width: 140, fontSize: 13 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 3, flexShrink: 0 }}>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '5px 10px', fontSize: 12, border: 'none' }}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={14} /> Grid
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '5px 10px', fontSize: 12, border: 'none' }}
              onClick={() => setViewMode('table')}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            GRID VIEW
        ══════════════════════════════════════════════ */}
        {viewMode === 'grid' && (
          <div className="svc-table-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filteredTables.map((t) => (
              <div
                key={t.id}
                className={`svc-table-card ${t.status}`}
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 160,
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{t.id}</div>
                    <span className={`badge ${statusBadge(t.status)}`} style={{ textTransform: 'capitalize', fontSize: 11 }}>
                      {t.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>
                    <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {t.section} · <strong>{t.seats} seats</strong>
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                    <UserCheck size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Captain: <strong>{t.captain || 'Unassigned'}</strong>
                  </div>

                  {t.guest && (
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 650, background: '#fff7ed', padding: '3px 6px', borderRadius: 6, display: 'inline-block' }}>
                      Guest: {t.guest} ({t.covers} covers)
                    </div>
                  )}
                </div>

                {/* Actions bottom bar — Edit & Delete only */}
                <div style={{ display: 'flex', gap: 6, marginTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '5px 8px', fontSize: 11, justifyContent: 'center' }}
                    onClick={() => openEditModal(t)}
                    title="Edit Table Details"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '5px 8px', fontSize: 11, color: '#ef4444', borderColor: '#fca5a5' }}
                    onClick={() => handleDeleteTable(t.id)}
                    title="Delete Table"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            LIST / DATA TABLE VIEW
        ══════════════════════════════════════════════ */}
        {viewMode === 'table' && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Section</th>
                  <th>Capacity</th>
                  <th>Assigned Captain</th>
                  <th>Current Guest</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.map((t) => (
                  <tr key={t.id}>
                    <td><strong style={{ fontSize: 14 }}>{t.id}</strong></td>
                    <td>{t.section}</td>
                    <td>{t.seats} seats</td>
                    <td>{t.captain || '—'}</td>
                    <td>{t.guest ? `${t.guest} (${t.covers} covers)` : '—'}</td>
                    <td>
                      <span className={`badge ${statusBadge(t.status)}`} style={{ textTransform: 'capitalize' }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                          onClick={() => openEditModal(t)}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: 12, color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => handleDeleteTable(t.id)}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredTables.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            No tables found matching your search criteria.
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          MODALS (SEPARATED COMPONENTS)
      ══════════════════════════════════════════════ */}
      <CreateTableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTable={handleAddTable}
        sections={SECTIONS}
        captains={CAPTAINS}
        existingTableIds={tables.map((t) => t.id)}
      />

      <UpdateTableModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTable(null);
        }}
        table={editingTable}
        onSaveTable={handleSaveEditTable}
        sections={SECTIONS}
        captains={CAPTAINS}
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

