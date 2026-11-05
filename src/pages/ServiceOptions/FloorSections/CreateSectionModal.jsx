import React, { useState } from 'react';
import { Plus, X, CheckCircle2, LayoutGrid } from 'lucide-react';

const FLOOR_LEVELS = ['Ground Floor', 'First Floor', 'Rooftop', 'Basement', 'Outdoor Patio'];

export default function CreateSectionModal({ isOpen, onClose, onAddSection, existingNames = [] }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [floorLevel, setFloorLevel] = useState('Ground Floor');
  const [isActive, setIsActive] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    if (existingNames.some((n) => n.toLowerCase() === cleanName.toLowerCase())) {
      alert(`A section named "${cleanName}" already exists!`);
      return;
    }

    onAddSection({
      name: cleanName,
      description: description.trim(),
      capacity: Number(capacity) || 1,
      floorLevel,
      isActive,
      tableCount: 0,
    });

    // Reset Form
    setName('');
    setDescription('');
    setCapacity(20);
    setFloorLevel('Ground Floor');
    setIsActive(true);
    onClose();
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <LayoutGrid size={20} color="var(--primary)" /> Add Floor Section
          </div>
          <button type="button" className="svc-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
              {/* Section Name */}
              <div className="form-group">
                <label className="form-label">Section Name *</label>
                <input
                  className="form-control"
                  placeholder="e.g. Main Dining Hall, Rooftop Terrace, Bar Lounge…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Short description of this section…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical', fontSize: 13 }}
                />
              </div>

              {/* Capacity & Floor Level */}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Max Seating Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    className="form-control"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor / Level</label>
                  <select
                    className="form-control"
                    value={floorLevel}
                    onChange={(e) => setFloorLevel(e.target.value)}
                  >
                    {FLOOR_LEVELS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Section Status</label>
                <select
                  className="form-control"
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                >
                  <option value="active">Active (Accepting guests)</option>
                  <option value="inactive">Inactive / Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="svc-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Save Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

