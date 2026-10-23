import React, { useState } from 'react';
import { Store, Clock, Phone, MapPin, Percent, Save, CheckCircle, Upload, Image, Trash2, Camera } from 'lucide-react';

export default function Restaurant() {
  const [saved, setSaved] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80');
  const [gallery, setGallery] = useState([
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  ]);

  const [store, setStore] = useState({
    name: 'Spice Garden Bistro & Lounge',
    phone: '+1 (555) 234-5678',
    email: 'contact@spicegarden.com',
    address: '452 Gourmet Way, Downtown Food District',
    cuisine: 'North Indian, Asian Fusion, Tandoor Grills',
    openingTime: '10:00',
    closingTime: '23:00',
    taxPercent: '5',
    minOrderAmount: '20',
    deliveryRadius: '10',
    isOpen: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStore(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerUrl(url);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleAddGallery = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGallery([...gallery, url]);
    }
  };

  const removeGalleryImage = (idx) => {
    setGallery(gallery.filter((_, i) => i !== idx));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Store size={22} color="var(--primary)" /> Restaurant Information & Branding</h1>
          <p className="page-desc">Manage store media, identity photos, cuisines, and operating hours</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          <Save size={16} /> Save Restaurant Details
        </button>
      </div>

      {saved && (
        <div className="card" style={{ background: 'var(--success-bg)', border: '1px solid #a7f3d0', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 10, padding: 14 }}>
          <CheckCircle size={20} /> Restaurant profile and branding images updated successfully!
        </div>
      )}

      {/* Visual Identity & Images Card */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 16 }}>Store Cover Banner & Brand Logo</h2>
        
        {/* Banner with Logo overlay */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <img
            src={bannerUrl}
            alt="Store Cover Banner"
            className="restaurant-banner-preview"
          />
          <label style={{
            position: 'absolute',
            bottom: 28,
            right: 16,
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Camera size={14} /> Change Cover Banner
            <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
          </label>

          {/* Logo Badge Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 24,
            transform: 'translateY(35%)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 14
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={logoUrl}
                alt="Restaurant Logo"
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 16,
                  objectFit: 'cover',
                  border: '4px solid #fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <label style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                background: 'var(--primary)',
                color: '#fff',
                width: 26,
                height: 26,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }} title="Change Logo">
                <Camera size={13} />
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ paddingBottom: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>{store.name}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{store.cuisine}</p>
            </div>
          </div>
        </div>

        {/* Gallery Photos */}
        <div style={{ marginTop: 55 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Restaurant Ambiance & Food Showcase</h3>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={13} /> Add Photo
              <input type="file" accept="image/*" onChange={handleAddGallery} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {gallery.map((img, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', height: 100, border: '1px solid var(--border)' }}>
                <img src={img} alt={`Showcase ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    width: 22,
                    height: 22,
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer'
                  }}
                  title="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Information Form */}
      <form onSubmit={handleSave} className="card">
        <h2 className="card-title" style={{ marginBottom: 18 }}>Store Contact & Location</h2>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Restaurant Display Name</label>
            <input className="form-input" name="name" value={store.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input className="form-input" name="phone" value={store.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Official Store Email</label>
            <input className="form-input" name="email" type="email" value={store.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Cuisines Offered</label>
            <input className="form-input" name="cuisine" value={store.cuisine} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Store Physical Address</label>
            <input className="form-input" name="address" value={store.address} onChange={handleChange} required />
          </div>
        </div>

        <h2 className="card-title" style={{ margin: '28px 0 16px' }}>Operations, Delivery & Taxes</h2>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Opening Time</label>
            <input className="form-input" type="time" name="openingTime" value={store.openingTime} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Closing Time</label>
            <input className="form-input" type="time" name="closingTime" value={store.closingTime} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Tax / GST Rate (%)</label>
            <input className="form-input" type="number" name="taxPercent" value={store.taxPercent} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Order Requirement ($)</label>
            <input className="form-input" type="number" name="minOrderAmount" value={store.minOrderAmount} onChange={handleChange} />
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
