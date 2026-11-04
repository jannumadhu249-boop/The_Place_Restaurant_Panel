import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { Utensils, ArrowLeft, Save, AlertCircle, RefreshCw, CheckCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { URLS } from '../../url';

export default function EditFood() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Image file and preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [food, setFood] = useState({
    dishName: '',
    restaurantName: '',
    categoryId: '',
    subcategoryId: '',
    regularPrice: '',
    offerPrice: '',
    dietaryType: 'nonvegg',
    kitchenStatus: 'active',
    description: '',
    image: ''
  });

  const extractId = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return val._id || val.id || '';
    return String(val);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const clean = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = URLS.Image || URLS.Base || 'http://16.113.133.178:3000/';
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${clean}`;
  };

  const populateDish = (f) => {
    const catId = extractId(f.categoryId) || extractId(f.category);
    const subCatId = extractId(f.subcategoryId) || extractId(f.subcategory);
    const dName = f.dishName || f.name || '';
    const restName = f.restaurantName || '';
    const regPrice = f.regularPrice !== undefined && f.regularPrice !== null && f.regularPrice !== ''
      ? String(f.regularPrice)
      : (f.price !== undefined && f.price !== null ? String(f.price) : '');
    const offPrice = f.offerPrice !== undefined && f.offerPrice !== null ? String(f.offerPrice) : '';
    const diet = (f.dietaryType || f.foodType || 'nonvegg').toLowerCase().includes('veg') && !(f.dietaryType || f.foodType || '').toLowerCase().includes('non')
      ? 'vegg'
      : 'nonvegg';
    const status = f.kitchenStatus || f.status || 'active';
    const desc = f.description || '';
    const img = f.image || '';

    setFood({
      dishName: dName,
      restaurantName: restName,
      categoryId: catId,
      subcategoryId: subCatId,
      regularPrice: regPrice,
      offerPrice: offPrice,
      dietaryType: diet,
      kitchenStatus: status,
      description: desc,
      image: img
    });

    if (img) {
      setImagePreview(getImageUrl(img));
    }
  };

  // Fetch active categories and subcategories in parallel
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const catUrl = URLS.GetActiveCategories;
    const subCatUrl = URLS.GetActiveSubCategories;

    Promise.all([
      fetch(catUrl, { method: 'POST', headers }).then(r => r.json()).catch(() => null),
      fetch(subCatUrl, { method: 'POST', headers }).then(r => r.json()).catch(() => null)
    ]).then(([catRes, subRes]) => {
      if (catRes) {
        const list = catRes.category || catRes.categories || catRes.data;
        if (Array.isArray(list) && list.length > 0) setCategories(list);
      }
      if (subRes) {
        const list = subRes.subcategory || subRes.subcategories || subRes.data;
        if (Array.isArray(list) && list.length > 0) setSubcategories(list);
      }
    });
  }, []);

  useEffect(() => {
    // If food was passed via route state
    if (location.state && location.state.food) {
      populateDish(location.state.food);
      return;
    }

    // Fetch food menu to find by ID
    const token = localStorage.getItem('token');
    setLoading(true);
    fetch(URLS.GetFoodMenu, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(r => r.json())
      .then(res => {
        if (res) {
          const list = res.data || res.menu || res.food || res.foods || (Array.isArray(res) ? res : []);
          const found = list.find(item => (item._id || item.id) === id);
          if (found) {
            populateDish(found);
          }
        }
      })
      .catch(err => console.error('Fetch food error:', err))
      .finally(() => setLoading(false));
  }, [id, location.state]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFood(prev => ({ ...prev, image: '' }));
  };

  const availableSubcategories = subcategories.filter(sub => {
    if (!sub.categoryId) return true;
    const subCatId = typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId;
    return !food.categoryId || subCatId === food.categoryId;
  });

  const displaySubcategories = availableSubcategories.length > 0 ? availableSubcategories : subcategories;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const updateUrl = `${URLS.UpdateFoodMenu.endsWith('/') ? URLS.UpdateFoodMenu : `${URLS.UpdateFoodMenu}/`}${id}`;
      let response;

      if (imageFile) {
        const formData = new FormData();
        formData.append('dishName', food.dishName.trim());
        formData.append('name', food.dishName.trim());
        formData.append('categoryId', food.categoryId);
        formData.append('subcategoryId', food.subcategoryId);
        formData.append('regularPrice', food.regularPrice);
        formData.append('price', food.regularPrice);
        formData.append('offerPrice', food.offerPrice || food.regularPrice);
        formData.append('dietaryType', food.dietaryType);
        formData.append('foodType', food.dietaryType);
        formData.append('kitchenStatus', food.kitchenStatus);
        formData.append('status', food.kitchenStatus);
        formData.append('description', food.description.trim());
        formData.append('image', imageFile);

        response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData
        });
      } else {
        response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            dishName: food.dishName.trim(),
            name: food.dishName.trim(),
            categoryId: food.categoryId,
            subcategoryId: food.subcategoryId,
            regularPrice: Number(food.regularPrice) || 0,
            price: Number(food.regularPrice) || 0,
            offerPrice: food.offerPrice !== '' ? Number(food.offerPrice) : Number(food.regularPrice) || 0,
            dietaryType: food.dietaryType,
            foodType: food.dietaryType,
            kitchenStatus: food.kitchenStatus,
            status: food.kitchenStatus,
            description: food.description.trim(),
            image: food.image || ''
          })
        });
      }

      const result = await response.json().catch(() => null);

      if (response && response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/food-management/foods');
        }, 800);
      } else {
        setError(result?.message || 'Failed to update food menu item.');
      }
    } catch (err) {
      console.error('Update food error:', err);
      setError('Unable to connect to the server. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Utensils size={22} color="var(--primary)" /> Edit Food Menu Item</h1>
          <p className="page-desc">Modify dish attributes, category tags, recipe notes, pricing, and availability</p>
        </div>
        <Link to="/food-management/foods" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Foods Menu
        </Link>
      </div>

      {success && (
        <div
          className="card"
          style={{
            background: 'var(--success-bg)',
            border: '1px solid #a7f3d0',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            marginBottom: 20
          }}
        >
          <CheckCircle size={20} /> Food dish updated successfully! Returning to menu...
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid #fecaca',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            marginBottom: 20
          }}
        >
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Dish Specifications & Pricing</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={26} className="fp-spinner" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0 }}>Loading dish details...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="form-grid">
              {/* Dish Name */}
              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Chicken Biryani Special"
                  value={food.dishName}
                  onChange={(e) => setFood({ ...food, dishName: e.target.value })}
                  required
                />
              </div>

              {/* Restaurant Name (Read-Only / No Edit Access) */}
              <div className="form-group">
                <label className="form-label">Restaurant Name (Read-Only)</label>
                <input
                  className="form-input"
                  value={food.restaurantName || 'Restaurant'}
                  disabled
                  readOnly
                  style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    cursor: 'not-allowed',
                    border: '1px solid #cbd5e1'
                  }}
                  title="Restaurant name is assigned to your profile and cannot be edited here."
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={food.categoryId}
                  onChange={(e) => setFood({ ...food, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name || c.categoryName || c.title || c._id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Category */}
              <div className="form-group">
                <label className="form-label">Sub-Category</label>
                <select
                  className="form-select"
                  value={food.subcategoryId}
                  onChange={(e) => setFood({ ...food, subcategoryId: e.target.value })}
                  required
                >
                  <option value="">Select Sub-Category</option>
                  {displaySubcategories.map((sc) => (
                    <option key={sc._id || sc.id} value={sc._id || sc.id}>
                      {sc.name || sc.subCategoryName || sc.title || sc._id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Regular Price */}
              <div className="form-group">
                <label className="form-label">Regular Price (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 280"
                  value={food.regularPrice}
                  onChange={(e) => setFood({ ...food, regularPrice: e.target.value })}
                  required
                />
              </div>

              {/* Offer Price */}
              <div className="form-group">
                <label className="form-label">Offer Price (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 240"
                  value={food.offerPrice}
                  onChange={(e) => setFood({ ...food, offerPrice: e.target.value })}
                  required
                />
              </div>

              {/* Dietary Classification */}
              <div className="form-group">
                <label className="form-label">Dietary Classification</label>
                <select
                  className="form-select"
                  value={food.dietaryType}
                  onChange={(e) => setFood({ ...food, dietaryType: e.target.value })}
                >
                  <option value="nonvegg">Non-Vegetarian</option>
                  <option value="vegg">Vegetarian</option>
                </select>
              </div>

              {/* Kitchen Inventory Status */}
              <div className="form-group">
                <label className="form-label">Kitchen Status</label>
                <select
                  className="form-select"
                  value={food.kitchenStatus}
                  onChange={(e) => setFood({ ...food, kitchenStatus: e.target.value })}
                >
                  <option value="active">Active (Available / In Stock)</option>
                  <option value="inactive">Inactive (Unavailable / Sold Out)</option>
                </select>
              </div>

              {/* Dish Image File Upload */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Dish Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {imagePreview ? (
                    <div style={{ position: 'relative', width: 90, height: 90, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img
                        src={imagePreview}
                        alt="Dish Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 22,
                          height: 22,
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remove Image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: 90, height: 90, borderRadius: 10, border: '2px dashed var(--border)', display: 'grid', placeItems: 'center', background: '#f8fafc', color: 'var(--text-muted)' }}>
                      <ImageIcon size={28} style={{ opacity: 0.5 }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
                      <Upload size={14} /> {imagePreview ? 'Change Dish Image' : 'Upload Dish Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {imageFile ? imageFile.name : imagePreview ? 'Current image loaded' : 'Select JPG, PNG, WEBP image file from your device'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description & Ingredients</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Special Hyderabadi chicken biryani, spices..."
                  value={food.description}
                  onChange={(e) => setFood({ ...food, description: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: 26, display: 'flex', gap: 12 }}>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? <RefreshCw size={16} className="fp-spinner" /> : <Save size={16} />}
                <span>{submitting ? 'Updating...' : 'Update Food Item'}</span>
              </button>
              <Link to="/food-management/foods" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
