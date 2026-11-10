import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { URLS } from '../../../url';
import CreateTableModal from './CreateTableModal';
import UpdateTableModal from './UpdateTableModal';

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [captainsList, setCaptainsList] = useState([]);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    return {
      'Content-Type': 'application/json',
      ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  };

  // Section names list for dropdowns
  const availableSections = useMemo(() => {
    return sectionsList.map((s) => s.sectionName || s.name || '').filter(Boolean);
  }, [sectionsList]);

  // Captain names list for dropdowns
  const availableCaptains = useMemo(() => {
    const names = captainsList.map((c) => c.name || '').filter(Boolean);
    return [...names, 'Unassigned'];
  }, [captainsList]);

  // Fetch Sections (to resolve sectionId)
  const fetchSectionsData = useCallback(async () => {
    try {
      const res = await fetch(`${URLS.GetFloorSections}?page=1&limit=100`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        let list = [];
        if (Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data.sections)) list = data.sections;
        else if (Array.isArray(data.data?.sections)) list = data.data.sections;
        else if (Array.isArray(data.data?.docs)) list = data.data.docs;
        else if (Array.isArray(data)) list = data;

        setSectionsList(list);
      }
    } catch (err) {
      console.warn('Failed to fetch sections for table dropdown:', err);
    }
  }, []);

  // Fetch Captains (to resolve captainId)
  const fetchCaptainsData = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetActiveServers, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        let list = [];
        if (Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data.captains)) list = data.captains;
        else if (Array.isArray(data.staff)) list = data.staff;
        else if (Array.isArray(data)) list = data;

        if (list.length > 0) {
          setCaptainsList(list);
          return;
        }
      }

      // Fallback to GetServers
      const res2 = await fetch(`${URLS.GetServers}?page=1&limit=100`, {
        headers: getAuthHeaders(),
      });
      if (res2.ok) {
        const data2 = await res2.json();
        let list2 = [];
        if (Array.isArray(data2.data)) list2 = data2.data;
        else if (Array.isArray(data2.staff)) list2 = data2.staff;
        else if (Array.isArray(data2.data?.docs)) list2 = data2.data.docs;
        else if (Array.isArray(data2)) list2 = data2;
        setCaptainsList(list2);
      }
    } catch (err) {
      console.warn('Failed to fetch staff list for tables:', err);
    }
  }, []);

  // Fetch Table Dashboard Stats
  const fetchTableDashboard = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetTableCards, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.success || data.status || data.data)) {
          setDashboardStats(data.data || data);
        }
      }
    } catch (err) {
      console.warn('Table dashboard fetch warning:', err);
    }
  }, []);

  // Fetch Tables List
  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append('search', search.trim());
      if (statusFilter !== 'All') queryParams.append('status', statusFilter.toLowerCase());

      const url = `${URLS.GetTables}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      const result = await res.json();

      let rawTables = [];
      if (Array.isArray(result.data)) rawTables = result.data;
      else if (Array.isArray(result.tables)) rawTables = result.tables;
      else if (Array.isArray(result.data?.tables)) rawTables = result.data.tables;
      else if (Array.isArray(result.data?.docs)) rawTables = result.data.docs;
      else if (Array.isArray(result.docs)) rawTables = result.docs;
      else if (Array.isArray(result)) rawTables = result;

      const mapped = rawTables.map((t, idx) => {
        const secName =
          t.sectionId && typeof t.sectionId === 'object' && t.sectionId.sectionName
            ? t.sectionId.sectionName
            : t.sectionName || t.section || 'General';

        const capName =
          t.captainId && typeof t.captainId === 'object' && t.captainId.name
            ? t.captainId.name
            : t.assignedCaptain && typeof t.assignedCaptain === 'object' && t.assignedCaptain.name
            ? t.assignedCaptain.name
            : t.captain || 'Unassigned';

        return {
          id: t.tableNumber || t.tableName || `T${String(idx + 1).padStart(2, '0')}`,
          mongoId: t._id,
          sectionId: t.sectionId && typeof t.sectionId === 'object' ? t.sectionId._id : t.sectionId,
          section: secName,
          seats: Number(t.seatingCapacity || t.capacity || t.seats || 4),
          status: (t.status || 'available').toLowerCase(),
          captain: capName,
          captainId: t.captainId && typeof t.captainId === 'object' ? t.captainId._id : t.captainId,
          shape: t.tableType ? t.tableType.charAt(0).toUpperCase() + t.tableType.slice(1) : 'Square',
          minSpend: Number(t.minSpend || 0),
          guest: t.currentGuest || t.guest || '',
          covers: Number(t.covers || 0),
          raw: t,
        };
      });

      setTables(mapped);
    } catch (err) {
      console.error('Tables fetch error:', err);
      showToast('Unable to load tables. Please check your connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchSectionsData();
    fetchCaptainsData();
    fetchTableDashboard();
    fetchTables();
  }, [fetchSectionsData, fetchCaptainsData, fetchTableDashboard, fetchTables]);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchSection = sectionFilter === 'All' || (t.section || '').toLowerCase() === sectionFilter.toLowerCase();
      const matchStatus = statusFilter === 'All' || (t.status || '').toLowerCase() === statusFilter.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (t.id || '').toLowerCase().includes(q) ||
        (t.section || '').toLowerCase().includes(q) ||
        (t.captain || '').toLowerCase().includes(q) ||
        (t.guest || '').toLowerCase().includes(q);
      return matchSection && matchStatus && matchSearch;
    });
  }, [tables, sectionFilter, statusFilter, search]);

  const stats = useMemo(() => {
    if (dashboardStats) {
      return {
        total: Number(dashboardStats.totalTables ?? dashboardStats.total ?? tables.length),
        available: Number(dashboardStats.availableTables ?? dashboardStats.available ?? tables.filter((t) => t.status === 'available').length),
        occupied: Number(dashboardStats.occupiedTables ?? dashboardStats.occupied ?? tables.filter((t) => t.status === 'occupied').length),
        reserved: Number(dashboardStats.reservedTables ?? dashboardStats.reserved ?? tables.filter((t) => t.status === 'reserved').length),
      };
    }
    const total = tables.length;
    const available = tables.filter((t) => t.status === 'available').length;
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const reserved = tables.filter((t) => t.status === 'reserved').length;
    return { total, available, occupied, reserved };
  }, [tables, dashboardStats]);

  const statusBadge = (s) => {
    if (s === 'available') return 'badge-success';
    if (s === 'occupied') return 'badge-warning';
    if (s === 'reserved') return 'badge-info';
    return 'badge-muted';
  };

  // Add Table (POST /add)
  const handleAddTable = async (newTable) => {
    try {
      // Resolve sectionId
      let resolvedSecId = '';
      const matchedSection = sectionsList.find(
        (s) => (s.sectionName || s.name || '').toLowerCase() === (newTable.section || '').toLowerCase()
      );
      if (matchedSection) {
        resolvedSecId = matchedSection._id;
      } else if (sectionsList.length > 0 && sectionsList[0]._id) {
        resolvedSecId = sectionsList[0]._id;
      }

      if (!resolvedSecId) {
        showToast('Please create a floor section first before adding tables.', 'error');
        return;
      }

      // Resolve captainId if assigned
      const matchedCaptain = captainsList.find(
        (c) => (c.name || '').toLowerCase() === (newTable.captain || '').toLowerCase()
      );

      const payload = {
        tableNumber: newTable.id,
        sectionId: resolvedSecId,
        seatingCapacity: Number(newTable.seats) || 4,
        status: (newTable.status || 'available').toLowerCase(),
        tableType: (newTable.shape || 'standard').toLowerCase() === 'bar' ? 'bar' : 'standard',
      };

      const res = await fetch(URLS.CreateTables, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        const createdId = result.data?._id || result._id;
        // If captain assigned, trigger assignment API
        if (createdId && matchedCaptain?._id) {
          try {
            await fetch(`${URLS.AssignCaptainTable}${createdId}/assignment`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ captainId: matchedCaptain._id }),
            });
          } catch (e) {
            console.warn('Captain assignment warning:', e);
          }
        }
        showToast(`✓ Table ${newTable.id} added successfully!`);
        fetchTables();
        fetchTableDashboard();
      } else {
        showToast(result.message || 'Failed to add table. Please check input.', 'error');
      }
    } catch (err) {
      console.error('Error adding table:', err);
      showToast('Network error while adding table.', 'error');
    }
  };

  // Open Edit Modal
  const openEditModal = (table) => {
    setEditingTable(table);
    setIsEditModalOpen(true);
  };

  // Save Edit Table (PUT /:id, status, assignment)
  const handleSaveEditTable = async (updatedTable) => {
    try {
      const targetId = updatedTable.mongoId || updatedTable.id;

      // Find sectionId
      let resolvedSecId = updatedTable.sectionId;
      if (!resolvedSecId) {
        const matchSec = sectionsList.find(
          (s) => (s.sectionName || s.name || '').toLowerCase() === (updatedTable.section || '').toLowerCase()
        );
        resolvedSecId = matchSec?._id;
      }

      const payload = {
        tableName: updatedTable.id,
        tableNumber: updatedTable.id,
        ...(resolvedSecId ? { sectionId: resolvedSecId } : {}),
        tableType: (updatedTable.shape || 'standard').toLowerCase() === 'bar' ? 'bar' : 'standard',
        seatingCapacity: Number(updatedTable.seats) || 4,
        description: `${updatedTable.seats}-seater dining table`,
        displayOrder: 1,
      };

      const res = await fetch(`${URLS.UpdateTables}${targetId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      // Also update status if modified
      if (updatedTable.status) {
        try {
          await fetch(`${URLS.UpdateTableStatus}${targetId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: updatedTable.status.toLowerCase() }),
          });
        } catch (e) {
          console.warn('Status update warning:', e);
        }
      }

      // Also assign captain if changed
      if (updatedTable.captain && updatedTable.captain !== 'Unassigned') {
        const matchCap = captainsList.find(
          (c) => (c.name || '').toLowerCase() === updatedTable.captain.toLowerCase()
        );
        if (matchCap?._id) {
          try {
            await fetch(`${URLS.AssignCaptainTable}${targetId}/assignment`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ captainId: matchCap._id }),
            });
          } catch (e) {
            console.warn('Captain assignment warning:', e);
          }
        }
      }

      if (res.ok && (result.success || result.status)) {
        showToast(`✓ Table ${updatedTable.id} updated successfully!`);
        fetchTables();
        fetchTableDashboard();
      } else {
        showToast(result.message || 'Failed to update table.', 'error');
      }
    } catch (err) {
      console.error('Error updating table:', err);
      showToast('Network error while updating table.', 'error');
    }
  };

  // Delete Table (DELETE /:id)
  const handleDeleteTable = async (tableId) => {
    const table = tables.find((t) => t.id === tableId || t.mongoId === tableId);
    if (!table) return;

    if (table.status === 'occupied') {
      alert(`Cannot delete Table ${table.id} because it is currently OCCUPIED by guests.`);
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete Table ${table.id} (${table.section})?`)) {
      try {
        const targetId = table.mongoId || table.id;
        const res = await fetch(`${URLS.DeleteTables}${targetId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        const result = await res.json();

        if (res.ok && (result.success || result.status)) {
          showToast(`✓ Table ${table.id} deleted.`);
          fetchTables();
          fetchTableDashboard();
        } else {
          showToast(result.message || 'Failed to delete table.', 'error');
        }
      } catch (err) {
        console.error('Error deleting table:', err);
        showToast('Network error while deleting table.', 'error');
      }
    }
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
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              fetchTables();
              fetchTableDashboard();
              fetchSectionsData();
              fetchCaptainsData();
              showToast('Refreshed tables data');
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} /> Refresh
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
              {availableSections.map((s) => (
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

        {/* Loading Spinner */}
        {isLoading && tables.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: 8 }} />
            <div>Loading tables...</div>
          </div>
        )}

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

        {!isLoading && filteredTables.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            {tables.length === 0 ? 'No tables found. Click "+ Add Table" to add your first floor table.' : 'No tables found matching your search criteria.'}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════ */}
      <CreateTableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTable={handleAddTable}
        sections={availableSections}
        captains={availableCaptains}
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
        sections={availableSections}
        captains={availableCaptains}
      />

      {/* Toast Feedback */}
      {toast.message && (
        <div className={`svc-toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
