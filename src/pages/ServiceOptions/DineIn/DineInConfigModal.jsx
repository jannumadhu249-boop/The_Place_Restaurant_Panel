import React, { useState, useEffect } from 'react';
import { Settings2, X, CheckCircle2 } from 'lucide-react';

export default function DineInConfigModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) {
  const [form, setForm] = useState({
    coverCharge: 0,
    serviceChargePct: 5,
    gstPct: 5,
    maxWaitMins: 15,
    reservationHoldMins: 20,
    defaultCovers: 2,
    defaultSection: 'Main Hall',
    autoAssign: true,
  });

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <Settings2 size={20} color="var(--primary)" /> Dine-in Configuration & Settings
          </div>
          <button type="button" className="svc-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            <div className="svc-settings-group">
              <div className="svc-settings-group-title">Floor Rules & Service Charges</div>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Cover charge per guest (₹)</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.coverCharge}
                    onChange={(e) => handleChange('coverCharge', Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Service charge (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    className="form-control"
                    value={form.serviceChargePct}
                    onChange={(e) => handleChange('serviceChargePct', Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST / Tax rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={28}
                    className="form-control"
                    value={form.gstPct}
                    onChange={(e) => handleChange('gstPct', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="svc-settings-group" style={{ marginTop: 16 }}>
              <div className="svc-settings-group-title">Table Intake & Wait Times</div>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Max wait time (mins)</label>
                  <input
                    type="number"
                    min={5}
                    className="form-control"
                    value={form.maxWaitMins}
                    onChange={(e) => handleChange('maxWaitMins', Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reservation hold window (mins)</label>
                  <input
                    type="number"
                    min={5}
                    className="form-control"
                    value={form.reservationHoldMins}
                    onChange={(e) => handleChange('reservationHoldMins', Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Default seating covers</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={form.defaultCovers}
                    onChange={(e) => handleChange('defaultCovers', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="svc-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

