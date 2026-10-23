import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Utensils, ArrowLeft, Save } from 'lucide-react';

export default function EditFood() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState({
    name: 'Butter Chicken Special',
    category: 'Main Course',
    subCategory: 'Chicken Gravies',
    price: '16.99',
    discount: '10',
    type: 'Non-Veg',
    prepTime: '25',
    spicyLevel: 'Medium',
    status: 'In Stock',
    description: 'Tender tandoori chicken cooked in creamy tomato, butter, and fenugreek gravy.'
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Food dish updated successfully!`);
    navigate('/food-management/foods');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Utensils size={22} color="var(--primary)" /> Edit Food Menu Item #{id || 1}</h1>
          <p className="page-desc">Modify dish attributes, recipe notes, pricing, and availability</p>
        </div>
        <Link to="/food-management/foods" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Foods Menu
        </Link>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Dish Specifications & Pricing</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Dish Name</label>
              <input
                className="form-input"
                value={food.name}
                onChange={(e) => setFood({ ...food, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Master Category</label>
              <select
                className="form-select"
                value={food.category}
                onChange={(e) => setFood({ ...food, category: e.target.value })}
              >
                <option value="Main Course">Main Course</option>
                <option value="Appetizers & Starters">Appetizers & Starters</option>
                <option value="Tandoori Breads">Tandoori Breads</option>
                <option value="Desserts & Sweets">Desserts & Sweets</option>
                <option value="Refreshing Beverages">Refreshing Beverages</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sub-Category</label>
              <input
                className="form-input"
                value={food.subCategory}
                onChange={(e) => setFood({ ...food, subCategory: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Regular Price ($)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={food.price}
                onChange={(e) => setFood({ ...food, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount (%)</label>
              <input
                className="form-input"
                type="number"
                value={food.discount}
                onChange={(e) => setFood({ ...food, discount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dietary Classification</label>
              <select
                className="form-select"
                value={food.type}
                onChange={(e) => setFood({ ...food, type: e.target.value })}
              >
                <option value="Non-Veg">🍗 Non-Vegetarian</option>
                <option value="Veg">🌱 Vegetarian</option>
                <option value="Vegan">🥑 Vegan</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Prep Time (minutes)</label>
              <input
                className="form-input"
                type="number"
                value={food.prepTime}
                onChange={(e) => setFood({ ...food, prepTime: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Spice Level</label>
              <select
                className="form-select"
                value={food.spicyLevel}
                onChange={(e) => setFood({ ...food, spicyLevel: e.target.value })}
              >
                <option value="Mild">Mild 🌿</option>
                <option value="Medium">Medium 🌶️</option>
                <option value="Hot Spicy">Hot Spicy 🌶️🌶️</option>
                <option value="Extra Hot">Extra Hot 🌶️🌶️🌶️</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Inventory Status</label>
              <select
                className="form-select"
                value={food.status}
                onChange={(e) => setFood({ ...food, status: e.target.value })}
              >
                <option value="In Stock">In Stock (Available)</option>
                <option value="Out of Stock">Out of Stock (Sold Out)</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description & Ingredients</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={food.description}
                onChange={(e) => setFood({ ...food, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 26, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Update Food Item
            </button>
            <Link to="/food-management/foods" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
