import React, { useState, useEffect } from 'react';
import { Utensils, X, CheckCircle2, Phone } from 'lucide-react';

export default function SeatGuestsModal({
  isOpen,
  onClose,
  onConfirmSeat,
  availableTables = [],
  preselectedTable = '',
  defaultCovers = 2,
  servers = ['Ananya', 'Vikram', 'Meera'],
}) {
  const [selectedTable, setSelectedTable] = useState('');
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [covers, setCovers] = useState(defaultCovers);
  const [server, setServer] = useState(servers[0] || 'Ananya');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialTable = preselectedTable || (availableTables[0]?.id || '');
      setSelectedTable(initialTable);
      setGuestName('');
      setPhone('');
      setCovers(defaultCovers);
      setServer(servers[0] || 'Ananya');
      setNotes('');
    }
  }, [isOpen, preselectedTable, availableTables, defaultCovers, servers]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTable) {
      alert('Please select an available table');
      return;
    }

    onConfirmSeat({
      table: selectedTable,
      guest: guestName.trim() || 'Walk-in Guest',
      phone: phone.trim(),
      covers: Number(covers) || 1,
      server,
      notes: notes.trim(),
    });
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
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Select Available Table *</label>
                <select
                  className="form-control"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  required
                >
                  <option value="" disabled>Choose a table</option>
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} — {t.section} ({t.seats} seats available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Guest Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Covers (Guests)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    className="form-control"
                    value={covers}
                    onChange={(e) => setCovers(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone (Optional)</label>
                  <div className="svc-input-with-icon">
                    <Phone size={15} className="svc-input-icon" />
                    <input
                      className="form-control"
                      placeholder="+91 …"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Captain / Server</label>
                <select
                  className="form-control"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                >
                  {servers.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={availableTables.length === 0}>
              <CheckCircle2 size={16} /> Confirm & Seat Guests
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

