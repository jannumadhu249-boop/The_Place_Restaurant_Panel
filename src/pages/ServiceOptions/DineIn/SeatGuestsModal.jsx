import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Utensils, X, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import { URLS } from '../../../url';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
  return {
    'Content-Type': 'application/json',
    ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
  };
};

const titleCase = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const mapTable = (t, idx) => ({
  id: t.tableNumber || t.tableName || `T${String(idx + 1).padStart(2, '0')}`,
  mongoId: t._id,
  sectionLabel: t.sectionLabel || titleCase(t.section) || 'Other',
  seats: Number(t.seatingCapacity || t.capacity || t.seats || 0),
  status: String(t.status || 'available').toLowerCase(),
});

// Props below only seed the form — live data always comes from the API
export default function SeatGuestsModal({
  isOpen,
  onClose,
  onSeated,
  availableTables = [],
  preselectedTable = '',
  servers = [],
}) {
  // null = not fetched yet (fall back to props), [] = fetched but empty
  const [tables, setTables] = useState(null);
  const [captains, setCaptains] = useState(null);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [selectedTable, setSelectedTable] = useState('');
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [covers, setCovers] = useState('');
  const [server, setServer] = useState('');
  const [notes, setNotes] = useState('');

  const tableOptions = useMemo(() => {
    const source = tables ?? availableTables;
    return source.filter((t) => !t.status || t.status === 'available');
  }, [tables, availableTables]);

  const serverOptions = useMemo(() => {
    const source = captains ?? servers;
    return source.map((s) =>
      typeof s === 'string'
        ? { id: s, name: s, staffCode: '' }
        : {
            id: s.id || s._id,
            name: s.name || s.staffCode || 'Captain',
            staffCode: s.staffCode || '',
          }
    );
  }, [captains, servers]);

  // ── API: AVAILABLE DINE-IN TABLES ─────────────────────────────────
  const loadTables = useCallback(async () => {
    setIsLoadingTables(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 100 });
      const res = await fetch(`${URLS.GetAvailableTables}?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();

      let rawTables = [];
      if (Array.isArray(result.tables)) rawTables = result.tables;
      else if (Array.isArray(result.data)) rawTables = result.data;
      else if (Array.isArray(result.data?.tables)) rawTables = result.data.tables;
      else if (Array.isArray(result.data?.docs)) rawTables = result.data.docs;
      else if (Array.isArray(result)) rawTables = result;

      setTables(rawTables.map(mapTable));
    } catch (err) {
      console.warn('Failed to fetch available tables:', err);
    } finally {
      setIsLoadingTables(false);
    }
  }, []);

  // ── API: ACTIVE CAPTAINS / SERVERS ────────────────────────────────
  const loadCaptains = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetActiveServers, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const result = await res.json();

      let rawStaff = [];
      if (Array.isArray(result.captains)) rawStaff = result.captains;
      else if (Array.isArray(result.data)) rawStaff = result.data;
      else if (Array.isArray(result.staff)) rawStaff = result.staff;
      else if (Array.isArray(result.data?.captains)) rawStaff = result.data.captains;
      else if (Array.isArray(result)) rawStaff = result;

      setCaptains(
        rawStaff.map((c) => ({
          id: c._id,
          name: c.name || c.staffCode || 'Captain',
          staffCode: c.staffCode || '',
        }))
      );
    } catch (err) {
      console.warn('Failed to fetch active captains:', err);
    }
  }, []);

  // Reset the form on open and pull live tables / captains
  useEffect(() => {
    if (!isOpen) return;
    setSelectedTable(preselectedTable || '');
    setGuestName('');
    setPhone('');
    setPhoneError('');
    setCovers('');
    setServer('');
    setNotes('');
    setError('');
    setIsSubmitting(false);
    setTables(null);
    loadTables();
    loadCaptains();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the selection valid once live tables arrive
  useEffect(() => {
    if (!isOpen || tableOptions.length === 0) return;
    if (tableOptions.some((t) => String(t.id) === String(selectedTable))) return;

    const preferred = tableOptions.some((t) => String(t.id) === String(preselectedTable))
      ? preselectedTable
      : tableOptions[0].id;
    setSelectedTable(preferred);
  }, [isOpen, tableOptions, preselectedTable, selectedTable]);

  if (!isOpen) return null;

  // ── API: CREATE WALK-IN DINE-IN SESSION ───────────────────────────
  const validatePhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    return digits.length === 10 ? '' : 'Phone number must be exactly 10 digits';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const currentPhoneError = validatePhone(phone);
    if (currentPhoneError) {
      setPhoneError(currentPhoneError);
      return;
    }
    setPhoneError('');

    const tableObj = tableOptions.find((t) => String(t.id) === String(selectedTable));
    if (!tableObj) {
      setError('Please select an available table.');
      return;
    }

    const coverCount = Number(covers);
    if (!coverCount || coverCount < 1) {
      setError('Enter the number of covers (guests).');
      return;
    }
    if (tableObj.seats && coverCount > tableObj.seats) {
      setError(
        `Table ${tableObj.id} seats only ${tableObj.seats} guests. Reduce covers or pick another table.`
      );
      return;
    }

    const payload = {
      tableId: tableObj.mongoId || tableObj.id,
      guestCount: coverCount,
      customerName: guestName.trim() || 'Walk-in Guest',
    };
    if (phone.trim()) payload.customerPhone = phone.replace(/\D/g, '');
    if (server) payload.assignedStaffId = server;
    if (notes.trim()) payload.specialNotes = notes.trim();

    setIsSubmitting(true);
    try {
      const res = await fetch(URLS.CreateDineIn, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      const apiError =
        data.message ||
        data.error ||
        (Array.isArray(data.errors)
          ? data.errors.map((item) => item?.message || item).join(', ')
          : '');

      if (!res.ok || data.success === false || data.status === false) {
        setError(apiError || 'Failed to seat guests. Please try again.');
        return;
      }

      const session = data.session || data.data?.session || data.data || null;
      onSeated?.({
        table: tableObj.id,
        covers: coverCount,
        guest: payload.customerName,
        session,
      });
    } catch (err) {
      console.error('Error creating dine-in session:', err);
      setError('Network error while seating guests. Check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <Utensils size={20} color="var(--primary)" /> Seat Guests
          </div>
          <button type="button" className="svc-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 12px',
                  marginBottom: 14,
                  borderRadius: 10,
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: 12.5,
                  lineHeight: 1.45,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Select Available Table *</label>
                <select
                  className="form-control"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  required
                  disabled={isLoadingTables && tableOptions.length === 0}
                >
                  <option value="" disabled>
                    {isLoadingTables && tableOptions.length === 0
                      ? 'Loading available tables…'
                      : 'Choose a table'}
                  </option>
                  {tableOptions.map((t) => (
                    <option key={t.mongoId || t.id} value={t.id}>
                      {t.id} — {t.sectionLabel || t.section} ({t.seats} seats)
                    </option>
                  ))}
                </select>
                {!isLoadingTables && tableOptions.length === 0 && (
                  <div style={{ fontSize: 12, color: '#b45309', marginTop: 6 }}>
                    No tables are currently available. Free up a table or refresh the floor plan.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Guest Name *</label>
                <input
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={guestName}
                  required
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Guests *</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    className="form-control"
                    placeholder="Enter covers"
                    value={covers}
                    onChange={(e) => setCovers(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="svc-input-with-icon">
                    <Phone size={15} className="svc-input-icon" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className={`form-control${phoneError ? ' svc-input-invalid' : ''}`}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (phoneError) setPhoneError('');
                      }}
                      onBlur={() => setPhoneError(validatePhone(phone))}
                    />
                  </div>
                  {phoneError && <span className="svc-field-error">{phoneError}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Captain / Server</label>
                <select
                  className="form-control"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                >
                  <option value="">Select Server</option>
                  {serverOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.staffCode ? ` (${s.staffCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Special Notes / Dietary Requirements</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="High chair, window preference, celebration…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="svc-modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={tableOptions.length === 0 || isSubmitting}
            >
              <CheckCircle2 size={16} /> {isSubmitting ? 'Seating…' : 'Confirm & Seat Guests'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
