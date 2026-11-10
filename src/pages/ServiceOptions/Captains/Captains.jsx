import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Users,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Shield,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import '../ServiceOps.css';
import { URLS } from '../../../url';
import CreateCaptainModal from './CreateCaptainModal';
import UpdateCaptainModal from './UpdateCaptainModal';

function statusColors(s) {
  if (s === 'Active') return { bg: '#ecfdf5', color: '#059669', dot: '#10b981' };
  return { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
}

// Convert display role to API enum
function toApiRole(role) {
  if (!role) return 'floor_captain';
  const r = role.toLowerCase();
  if (r.includes('captain')) return 'floor_captain';
  if (r.includes('senior')) return 'senior_server';
  if (r.includes('trainee')) return 'trainee';
  return 'table_server';
}

// Convert API enum to display role
function fromApiRole(role) {
  if (!role) return 'Floor Captain';
  const r = role.toLowerCase();
  if (r === 'floor_captain') return 'Floor Captain';
  if (r === 'senior_server') return 'Senior Server';
  if (r === 'table_server') return 'Table Server';
  if (r === 'trainee') return 'Trainee';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// Convert API status to display status (only Active and Off Duty)
function fromApiStatus(status) {
  if (!status) return 'Off Duty';
  const s = String(status).toLowerCase();
  if (s === 'active') return 'Active';
  return 'Off Duty';
}

// Convert display status to API status (only active and off_duty)
function toApiStatus(status) {
  if (!status) return 'active';
  const s = String(status).toLowerCase();
  if (s === 'active') return 'active';
  return 'off_duty';
}

export default function Captains() {
  const [captains, setCaptains] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCaptain, setEditingCaptain] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  };

  const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    return {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  };

  // Fetch sections to populate sections dropdown
  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch(`${URLS.GetFloorSections}?page=1&limit=50`, {
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
      console.warn('Failed to fetch sections for staff:', err);
    }
  }, []);

  // 1. Fetch Staff Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetServerCards, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.success || data.status || data.data)) {
          setDashboardStats(data.data || data);
        }
      }
    } catch (err) {
      console.warn('Staff dashboard stats fetch warning:', err);
    }
  }, []);

  // 2. Fetch Floor Staff List
  const fetchCaptains = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ page: '1', limit: '50' });
      if (search.trim()) queryParams.append('search', search.trim());
      if (roleFilter !== 'All') queryParams.append('role', toApiRole(roleFilter));
      if (statusFilter !== 'All') queryParams.append('status', toApiStatus(statusFilter));

      const res = await fetch(`${URLS.GetServers}?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();

      let rawStaff = [];
      if (Array.isArray(result.data)) rawStaff = result.data;
      else if (Array.isArray(result.staff)) rawStaff = result.staff;
      else if (Array.isArray(result.data?.staff)) rawStaff = result.data.staff;
      else if (Array.isArray(result.data?.docs)) rawStaff = result.data.docs;
      else if (Array.isArray(result.docs)) rawStaff = result.docs;
      else if (Array.isArray(result)) rawStaff = result;

      const mapped = rawStaff.map((c, idx) => {
        const shiftStr =
          typeof c.shift === 'object' && c.shift !== null
            ? `${c.shift.shiftName || 'Shift'} (${c.shift.startTime || ''} - ${c.shift.endTime || ''})`
            : c.shift || 'Lunch (11:00 AM - 4:30 PM)';

        const secNames =
          Array.isArray(c.assignedSectionIds) && c.assignedSectionIds.length > 0
            ? c.assignedSectionIds
                .map((s) => (s && typeof s === 'object' && s.sectionName ? s.sectionName : s))
                .filter(Boolean)
                .join(', ')
            : c.section || 'All Sections';

        return {
          id: c.staffId || (c._id ? `CAP-${c._id.slice(-4).toUpperCase()}` : `CAP-0${idx + 1}`),
          mongoId: c._id,
          name: c.name || 'Staff Member',
          role: fromApiRole(c.role),
          phone: c.phone || '—',
          email: c.email || '—',
          section: secNames,
          shift: shiftStr,
          shiftRaw: c.shift,
          status: fromApiStatus(c.status),
          ordersCount: Number(c.ordersCount || c.totalOrders || 0),
          rating: Number(c.rating || 4.8),
          tables: Array.isArray(c.assignedTables) ? c.assignedTables : [],
          image: c.profileImage || c.image || null,
          raw: c,
        };
      });

      setCaptains(mapped);
    } catch (err) {
      console.error('Floor staff fetch error:', err);
      showToast('Unable to load staff members. Please check connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchSections();
    fetchDashboardStats();
    fetchCaptains();
  }, [fetchSections, fetchDashboardStats, fetchCaptains]);

  const availableSections = useMemo(() => {
    return sectionsList.map((s) => s.sectionName || s.name || '').filter(Boolean);
  }, [sectionsList]);

  const filteredCaptains = useMemo(() =>
    captains.filter((c) => {
      const matchRole = roleFilter === 'All' || (c.role || '').toLowerCase() === roleFilter.toLowerCase();
      const matchStatus = statusFilter === 'All' || (c.status || '').toLowerCase() === statusFilter.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.section || '').toLowerCase().includes(q);
      return matchRole && matchStatus && matchSearch;
    }), [captains, roleFilter, statusFilter, search]);

  const stats = useMemo(() => {
    if (dashboardStats) {
      return {
        total: Number(dashboardStats.totalStaff ?? dashboardStats.total ?? captains.length),
        active: Number(dashboardStats.activeStaff ?? dashboardStats.active ?? captains.filter((c) => c.status === 'Active').length),
        offDuty: Number(dashboardStats.offDutyStaff ?? dashboardStats.offDuty ?? captains.filter((c) => c.status === 'Off Duty').length),
      };
    }
    return {
      total: captains.length,
      active: captains.filter((c) => c.status === 'Active').length,
      offDuty: captains.filter((c) => c.status === 'Off Duty').length,
    };
  }, [captains, dashboardStats]);

  // Add Captain (POST /add with multipart/form-data)
  const handleAddCaptain = async (data) => {
    try {
      const shiftObj = {
        shiftName: data.shift?.includes('Lunch') ? 'Lunch' : data.shift?.includes('Dinner') ? 'Dinner' : 'Full Day',
        startTime: data.shift?.includes('Lunch') ? '11:00' : data.shift?.includes('Dinner') ? '17:00' : '11:00',
        endTime: data.shift?.includes('Lunch') ? '16:30' : data.shift?.includes('Dinner') ? '23:30' : '22:00',
      };

      // Find section IDs if selected
      let assignedSecIds = [];
      const matchedSec = sectionsList.find(
        (s) => (s.sectionName || s.name || '').toLowerCase() === (data.section || '').toLowerCase()
      );
      if (matchedSec?._id) assignedSecIds.push(matchedSec._id);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('role', toApiRole(data.role));
      formData.append('phone', data.phone || '');
      formData.append('email', data.email || '');
      formData.append('status', toApiStatus(data.status));
      formData.append('shift', JSON.stringify(shiftObj));
      if (assignedSecIds.length > 0) {
        formData.append('assignedSectionIds', JSON.stringify(assignedSecIds));
      }
      if (data.image instanceof File) {
        formData.append('profileImage', data.image);
      }

      const res = await fetch(URLS.CreateServers, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      });
      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        showToast(`✓ ${data.name} added successfully!`);
        fetchCaptains();
        fetchDashboardStats();
      } else {
        showToast(result.message || 'Failed to add staff member.', 'error');
      }
    } catch (err) {
      console.error('Error adding captain:', err);
      showToast('Network error while adding staff member.', 'error');
    }
  };

  const openEditModal = (cap) => {
    setEditingCaptain(cap);
    setIsEditModalOpen(true);
  };

  // Save Captain (PUT /:id)
  const handleSaveCaptain = async (updated) => {
    try {
      const targetId = updated.mongoId || updated.id;
      const shiftObj = typeof updated.shiftRaw === 'object' && updated.shiftRaw !== null
        ? updated.shiftRaw
        : {
            shiftName: updated.shift?.includes('Lunch') ? 'Lunch' : updated.shift?.includes('Dinner') ? 'Dinner' : 'Full Day',
            startTime: updated.shift?.includes('Lunch') ? '11:00' : updated.shift?.includes('Dinner') ? '17:00' : '11:00',
            endTime: updated.shift?.includes('Lunch') ? '16:30' : updated.shift?.includes('Dinner') ? '23:30' : '22:00',
          };

      const payload = {
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        shift: shiftObj,
        status: toApiStatus(updated.status),
      };

      const res = await fetch(`${URLS.UpdateServers}${targetId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        showToast(`✓ ${updated.name} updated!`);
        fetchCaptains();
        fetchDashboardStats();
      } else {
        showToast(result.message || 'Failed to update staff member.', 'error');
      }
    } catch (err) {
      console.error('Error updating captain:', err);
      showToast('Network error while updating staff member.', 'error');
    }
  };

  // Delete Captain (DELETE /:id)
  const handleDeleteCaptain = async (capId, name) => {
    const target = captains.find((c) => c.id === capId || c.mongoId === capId);
    if (!target) return;

    if (window.confirm(`Remove ${name} (${target.id}) from the floor staff list permanently?`)) {
      try {
        const targetId = target.mongoId || target.id;
        const res = await fetch(`${URLS.DeleteServers}${targetId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        const result = await res.json();

        if (res.ok && (result.success || result.status)) {
          showToast(`✓ ${name} removed.`);
          fetchCaptains();
          fetchDashboardStats();
        } else {
          showToast(result.message || 'Failed to remove staff member.', 'error');
        }
      } catch (err) {
        console.error('Error deleting staff:', err);
        showToast('Network error while removing staff member.', 'error');
      }
    }
  };

  // Toggle Status (PUT /:id/status) — ONLY Active <-> Off Duty
  const handleToggleStatus = async (capId, current) => {
    const target = captains.find((c) => c.id === capId || c.mongoId === capId);
    if (!target) return;

    // Toggle strictly between Active and Off Duty (no break status)
    const next = current === 'Active' ? 'Off Duty' : 'Active';
    const apiStatus = toApiStatus(next);

    try {
      const targetId = target.mongoId || target.id;
      const res = await fetch(`${URLS.UpdateStatusServer}${targetId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: apiStatus }),
      });
      const result = await res.json();

      if (res.ok && (result.success || result.status)) {
        showToast(`✓ ${target.name} is now ${next}.`);
        fetchCaptains();
        fetchDashboardStats();
      } else {
        showToast(result.message || 'Failed to update duty status.', 'error');
      }
    } catch (err) {
      console.error('Error updating staff status:', err);
      showToast('Network error while updating duty status.', 'error');
    }
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
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              fetchCaptains();
              fetchDashboardStats();
              fetchSections();
              showToast('Refreshed floor staff data');
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} /> Refresh
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
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && captains.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: 8 }} />
          <div>Loading staff members...</div>
        </div>
      )}

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
                    overflow: 'hidden',
                  }}>
                    {c.image && typeof c.image === 'string' && c.image.startsWith('http') ? (
                      <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      c.name.split(' ').map((p) => p[0]).join('').slice(0, 2)
                    )}
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

                {/* Strict Active <-> Off Duty Toggle (No Break Status) */}
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    fontSize: 12,
                    padding: '8px 6px',
                    justifyContent: 'center',
                    marginBottom: 7,
                    flexDirection: 'column',
                    gap: 3,
                    color: c.status === 'Active' ? '#ea580c' : '#059669',
                    borderColor: c.status === 'Active' ? '#fed7aa' : '#a7f3d0',
                  }}
                  onClick={() => handleToggleStatus(c.id, c.status)}
                  title={c.status === 'Active' ? 'Set Off Duty' : 'Set Active on Floor'}
                >
                  {c.status === 'Active' ? (
                    <>
                      <Clock size={14} />
                      <span style={{ fontSize: 10 }}>Off Duty</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span style={{ fontSize: 10 }}>Activate</span>
                    </>
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

      {!isLoading && filteredCaptains.length === 0 && (
        <div style={{ padding: 50, textAlign: 'center', color: '#64748b', fontSize: 14,
          background: '#f8fafc', borderRadius: 14, border: '1.5px dashed #cbd5e1' }}>
          {captains.length === 0 ? 'No staff members found. Click "+ Add Captain" to add staff.' : 'No staff members match your search.'}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────── */}
      <CreateCaptainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCaptain={handleAddCaptain}
        sections={availableSections}
      />
      <UpdateCaptainModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingCaptain(null); }}
        captain={editingCaptain}
        onSaveCaptain={handleSaveCaptain}
        sections={availableSections}
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
