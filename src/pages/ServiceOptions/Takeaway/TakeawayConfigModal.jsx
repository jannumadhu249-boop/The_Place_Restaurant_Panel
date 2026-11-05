import React from 'react';
import {
  Settings2,
  X,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Bell,
} from 'lucide-react';

export default function TakeawayConfigModal({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onSaveConfig,
}) {
  if (!isOpen) return null;

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <Settings2 size={20} color="var(--primary)" /> Takeaway Configuration
          </div>
          <button
            type="button"
            className="svc-modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="svc-modal-body">
          <div className="svc-settings-group">
            <div className="svc-settings-group-title">
              <Clock3 size={15} color="var(--primary)" /> Prep Timing & Capacity
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Default preparation time</label>
                <div className="svc-input-group">
                  <input
                    type="number"
                    min={5}
                    className="form-control"
                    value={settings.prepMins}
                    onChange={(e) => onUpdateSetting('prepMins', Number(e.target.value))}
                  />
                  <span className="svc-input-addon">mins</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Slot time interval</label>
                <div className="svc-input-group">
                  <input
                    type="number"
                    min={5}
                    className="form-control"
                    value={settings.slotInterval}
                    onChange={(e) => onUpdateSetting('slotInterval', Number(e.target.value))}
                  />
                  <span className="svc-input-addon">mins</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Max orders per slot</label>
                <input
                  type="number"
                  min={1}
                  className="form-control"
                  value={settings.maxOrdersPerSlot}
                  onChange={(e) => onUpdateSetting('maxOrdersPerSlot', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="svc-settings-group" style={{ marginTop: 16 }}>
            <div className="svc-settings-group-title">
              <IndianRupee size={15} color="var(--primary)" /> Charges & Payment Policy
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Packaging fee</label>
                <div className="svc-input-group">
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={settings.packingFee}
                    onChange={(e) => onUpdateSetting('packingFee', Number(e.target.value))}
                  />
                  <span className="svc-input-addon">₹</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Require prepaid orders</label>
                <select
                  className="form-control"
                  value={settings.requirePrepaid ? 'yes' : 'no'}
                  onChange={(e) => onUpdateSetting('requirePrepaid', e.target.value === 'yes')}
                >
                  <option value="no">No, allow pay at counter</option>
                  <option value="yes">Yes, mandatory prepaid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="svc-settings-group" style={{ marginTop: 16 }}>
            <div className="svc-settings-group-title">
              <Bell size={15} color="var(--primary)" /> Notifications
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Send SMS alert when ready</label>
                <select
                  className="form-control"
                  value={settings.notifySms ? 'yes' : 'no'}
                  onChange={(e) => onUpdateSetting('notifySms', e.target.value === 'yes')}
                >
                  <option value="yes">Yes, send SMS</option>
                  <option value="no">Disabled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Send App push notification</label>
                <select
                  className="form-control"
                  value={settings.notifyPush ? 'yes' : 'no'}
                  onChange={(e) => onUpdateSetting('notifyPush', e.target.value === 'yes')}
                >
                  <option value="yes">Yes, send Push</option>
                  <option value="no">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="svc-modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSaveConfig}
          >
            <CheckCircle2 size={16} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

