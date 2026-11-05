import React, { useState } from 'react';
import { Plus, X, CheckCircle2, Armchair } from 'lucide-react';

export default function CreateTableModal({
  isOpen,
  onClose,
  onAddTable,
  sections = ['Main Hall', 'Patio', 'Private', 'Bar'],
  captains = ['Ananya', 'Vikram', 'Meera', 'Unassigned'],
  existingTableIds = [],
}) {
  const [tableNo, setTableNo] = useState('');
  const [section, setSection] = useState(sections[0] || 'Main Hall');
  const [seats, setSeats] = useState(4);
  const [captain, setCaptain] = useState(captains[0] || 'Ananya');
  const [status, setStatus] = useState('available');
  const [shape, setShape] = useState('Square');
  const [minSpend, setMinSpend] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = tableNo.trim().toUpperCase();
    if (!cleanId) return;

    if (existingTableIds.includes(cleanId)) {
      alert(`Table ${cleanId} already exists! Please choose another table number.`);
      return;
    }

    onAddTable({
      id: cleanId,
      section,
      seats: Number(seats) || 2,
      status,
      captain,
      shape,
      minSpend: Number(minSpend) || 0,
    });

    // Reset Form
    setTableNo('');
    setSeats(4);
    setMinSpend(0);
    onClose();
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <Armchair size={20} color="var(--primary)" /> Add New Floor Table
          </div>
          <button type="button" className="svc-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Table Number / Code *</label>
                <input
                  className="form-control"
                  placeholder="e.g. T13, P04, B05"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Floor Section *</label>
                  <select
                    className="form-control"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    required
                  >
                    {sections.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Seating Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    className="form-control"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Assigned Captain</label>
                  <select
                    className="form-control"
                    value={captain}
                    onChange={(e) => setCaptain(e.target.value)}
                  >
                    {captains.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Table Shape</label>
                  <select
                    className="form-control"
                    value={shape}
                    onChange={(e) => setShape(e.target.value)}
                  >
                    <option value="Square">Square</option>
                    <option value="Round">Round</option>
                    <option value="Rectangle">Rectangle</option>
                  </select>
                </div>

                {/* <div className="form-group">
                  <label className="form-label">Minimum Spend (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    className="form-control"
                    placeholder="0 (optional)"
                    value={minSpend || ''}
                    onChange={(e) => setMinSpend(e.target.value)}
                  />
                </div> */}
              </div>
            </div>
          </div>

          <div className="svc-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Save Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

