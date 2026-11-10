import React, { useState, useEffect } from 'react';
import { Edit2, X, CheckCircle2 } from 'lucide-react';

export default function UpdateTableModal({
  isOpen,
  onClose,
  table,
  onSaveTable,
  sections = [],
  captains = [],
}) {
  const [section, setSection] = useState('');
  const [seats, setSeats] = useState(4);
  const [captain, setCaptain] = useState('Unassigned');
  const [status, setStatus] = useState('available');
  const [shape, setShape] = useState('Square');
  const [minSpend, setMinSpend] = useState(0);

  useEffect(() => {
    if (table) {
      setSection(table.section || (sections.length > 0 ? sections[0] : ''));
      setSeats(table.seats || 4);
      setCaptain(table.captain || (captains.length > 0 ? captains[0] : 'Unassigned'));
      setStatus(table.status || 'available');
      setShape(table.shape || 'Square');
      setMinSpend(table.minSpend || 0);
    }
  }, [table, sections, captains]);

  if (!isOpen || !table) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveTable({
      ...table,
      section,
      seats: Number(seats) || 2,
      captain,
      status,
      shape,
      minSpend: Number(minSpend) || 0,
    });
    onClose();
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <Edit2 size={18} color="var(--primary)" /> Edit Table {table.id}
          </div>
          <button type="button" className="svc-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Floor Section</label>
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
                  <label className="form-label">Seating Capacity</label>
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
                  <label className="form-label">Table Status</label>
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
                    placeholder="0"
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
              <CheckCircle2 size={16} /> Update Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

