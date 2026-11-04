import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, ArrowLeft, Save, AlertCircle, RefreshCw, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { URLS } from '../../url';

export default function CreateFood() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Image file and preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [food, setFood] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    price: '',
    offerPrice: '',
    foodType: 'nonvegg',
    description: '',
    status: 'active',
    image: '',
    stock: '20'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const catUrl = URLS.GetActiveCategories ;
    const subCatUrl = URLS.GetActiveSubCategories ;

    Promise.all([
      fetch(catUrl, { method: 'POST', headers }).then(r => r.json()).catch(() => null),
      fetch(subCatUrl, { method: 'POST', headers }).then(r => r.json()).catch(() => null)
    ]).then(([catRes, subRes]) => {
      if (catRes) {
        const catList = catRes.category || catRes.categories || catRes.data;
        if (Array.isArray(catList) && catList.length > 0) {
          setCategories(catList);
        }
      }
      if (subRes) {
        const subList = subRes.subcategory || subRes.subcategories || subRes.data;
        if (Array.isArray(subList) && subList.length > 0) {
          setSubcategories(subList);
        }
      }
    });
  }, []);

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

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = err => reject(err);
    });

  // Filter subcategories matching the selected category if they contain categoryId
  const availableSubcategories = subcategories.filter(sub => {
    if (!sub.categoryId) return true;
    const subCatId = typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId;
    return !food.categoryId || subCatId === food.categoryId;
  });

  const displaySubcategories = availableSubcategories.length > 0 ? availableSubcategories : subcategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      let response;

      if (imageFile) {
        const formData = new FormData();
        formData.append('dishName', food.name.trim());
        formData.append('name', food.name.trim());
        formData.append('categoryId', food.categoryId);
        formData.append('subcategoryId', food.subcategoryId);
        formData.append('regularPrice', food.price);
        formData.append('price', food.price);
        formData.append('offerPrice', food.offerPrice || food.price);
        formData.append('dietaryType', food.foodType);
        formData.append('foodType', food.foodType);
        formData.append('kitchenStatus', food.status);
        formData.append('status', food.status);
        formData.append('description', food.description.trim());
        formData.append('stock', food.stock || '20');
        formData.append('image', imageFile);

        response = await fetch(URLS.CreateFoodMenu, {
          method: 'POST',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData
        });
      } else {
        response = await fetch(URLS.CreateFoodMenu, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            dishName: food.name.trim(),
            name: food.name.trim(),
            categoryId: food.categoryId,
            subcategoryId: food.subcategoryId,
            regularPrice: Number(food.price) || 0,
            price: Number(food.price) || 0,
            offerPrice: food.offerPrice ? Number(food.offerPrice) : Number(food.price) || 0,
            dietaryType: food.foodType,
            foodType: food.foodType,
            kitchenStatus: food.status,
            status: food.status,
            description: food.description.trim(),
            image: '',
            stock: Number(food.stock) || 0
          })
        });
      }

      const result = await response.json().catch(() => null);

      if (response && response.ok) {
        navigate('/food-management/foods');
      } else {
        setError(result?.message || 'Failed to create food item. Please try again.');
      }
    } catch (err) {
      console.error('Create food error:', err);
      setError('Unable to connect to the server. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Utensils size={22} color="var(--primary)" /> Create Food Menu Item</h1>
          <p className="page-desc">Add a new specialty dish to your restaurant digital catalog</p>
        </div>
        <Link to="/food-management/foods" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Foods Menu
        </Link>
      </div>

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
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Dish Name</label>
              <input
                className="form-input"
                placeholder="e.g. Chicken Biryani Test"
                value={food.name}
                onChange={(e) => setFood({ ...food, name: e.target.value })}
                required
              />
            </div>

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

            <div className="form-group">
              <label className="form-label">Regular Price (₹)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="e.g. 250"
                value={food.price}
                onChange={(e) => setFood({ ...food, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Offer Price (₹)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="e.g. 220"
                value={food.offerPrice}
                onChange={(e) => setFood({ ...food, offerPrice: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Food Dietary Classification</label>
              <select
                className="form-select"
                value={food.foodType}
                onChange={(e) => setFood({ ...food, foodType: e.target.value })}
              >
                <option value="nonvegg">Non-Vegetarian</option>
                <option value="vegg">Vegetarian</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Kitchen Stock Quantity</label>
              <input
                className="form-input"
                type="number"
                placeholder="20"
                value={food.stock}
                onChange={(e) => setFood({ ...food, stock: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={food.status}
                onChange={(e) => setFood({ ...food, status: e.target.value })}
              >
                <option value="">Select Status</option>
                <option value="active">Active (Available)</option>
                <option value="inactive">Inactive (Unavailable)</option>
              </select>
            </div>

            {/* Dish Image File Upload (Replaced URL text input) */}
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
                    {imageFile ? imageFile.name : 'Select JPG, PNG, WEBP image file from your device'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Culinary Description</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Hyderabadi chicken biryani, spices, ingredients..."
                value={food.description}
                onChange={(e) => setFood({ ...food, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 26, display: 'flex', gap: 12 }}>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <RefreshCw size={16} className="fp-spinner" /> : <Save size={16} />}
              <span>{submitting ? 'Creating...' : 'Save Food Item'}</span>
            </button>
            <Link to="/food-management/foods" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
