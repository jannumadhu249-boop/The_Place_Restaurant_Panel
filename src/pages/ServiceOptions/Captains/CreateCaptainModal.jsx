
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, UserCheck } from 'lucide-react';

const ROLES = ['Floor Captain', 'Senior Server', 'Table Server', 'Trainee'];

const SECTIONS = ['Main Hall', 'Patio', 'Private', 'Bar', 'All Sections'];

const SHIFTS = [
  'Lunch (11:00 AM - 4:30 PM)',
  'Dinner (5:00 PM - 11:30 PM)',
  'Full Day (11:00 AM - 10:00 PM)',
];

export default function CreateCaptainModal({
  isOpen,
  onClose,
  onAddCaptain,
  sections = SECTIONS,
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Floor Captain');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [section, setSection] = useState(sections[0] || 'Main Hall');
  const [shift, setShift] = useState(SHIFTS[0]);
  const [status, setStatus] = useState('Active');

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should not exceed 5 MB.');
      e.target.value = '';
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Remove image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageError('');

    const fileInput = document.getElementById('captain-profile-image');

    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setRole('Floor Captain');
    setPhone('');
    setEmail('');
    setSection('Main Hall');
    setShift(SHIFTS[0]);
    setStatus('Active');
    setImage(null);
    setImagePreview(null);
    setImageError('');
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    onAddCaptain({
      image,
      name: name.trim(),
      role,
      phone: phone.trim() || '+91 98xxx 00000',
      email:
        email.trim() ||
        `${name.trim().toLowerCase().replace(/\s+/g, '.')}@theplace.com`,
      section,
      shift,
      status,
      ordersCount: 0,
      rating: 5.0,
      tables: [],
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div
        className="svc-modal-card wide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            <UserCheck size={20} color="var(--primary)" />
            Add Floor Captain / Server
          </div>

          <button
            type="button"
            className="svc-modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="svc-modal-body">
            <div
              className="form-grid"
              style={{
                gridTemplateColumns: '1fr',
                gap: 14,
              }}
            >
              {/* Profile Image - Single Column */}
              <div className="form-group">
                <label className="form-label">Profile Image</label>

                <input
                  id="captain-profile-image"
                  type="file"
                  className="form-control"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange}
                />

                <small className="text-muted">
                  Supported formats: JPG, JPEG, PNG, WEBP. Maximum size: 5 MB.
                </small>

                {imageError && (
                  <div className="text-danger mt-2">
                    {imageError}
                  </div>
                )}

                {imagePreview && (
                  <div className="mt-3 d-flex align-items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Captain Preview"
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                      }}
                    />

                    <div>
                      <div className="mb-2">
                        <strong>{image?.name}</strong>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleRemoveImage}
                      >
                        <X size={14} /> Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Name - Single Column */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Role & Section */}
              <div
                className="form-grid"
                style={{
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div className="form-group">
                  <label className="form-label">Role</label>

                  <select
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Section</label>

                  <select
                    className="form-control"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  >
                    {sections.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div
                className="form-grid"
                style={{
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>

                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="staff@theplace.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Shift & Status */}
              <div
                className="form-grid"
                style={{
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div className="form-group">
                  <label className="form-label">Shift</label>

                  <select
                    className="form-control"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                  >
                    {SHIFTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Duty Status</label>

                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="svc-modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              Save Captain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
