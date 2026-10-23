import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, ArrowLeft, Save, Upload, Sparkles } from 'lucide-react';

export default function CreateFood() {
  const navigate = useNavigate();
  const [food, setFood] = useState({
    name: '',
    category: 'Main Course',
    subCategory: 'Curries & Gravies',
    price: '',
    discount: '0',
    type: 'Veg',
    prepTime: '20',
    description: '',
    calories: '450',
    spicyLevel: 'Medium',
    status: 'In Stock'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Food dish "${food.name}" added to menu successfully!`);
    navigate('/food-management/foods');
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

      <div className="card" style={{ width: '100%' }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Dish Specifications & Pricing</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Dish Name</label>
              <input
                className="form-input"
                placeholder="e.g. Royal Shahi Paneer with Saffron Cream"
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
                placeholder="e.g. Vegetarian Chef Specials"
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
                placeholder="16.50"
                value={food.price}
                onChange={(e) => setFood({ ...food, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Promotional Discount (%)</label>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={food.discount}
                onChange={(e) => setFood({ ...food, discount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Food Dietary Classification</label>
              <select
                className="form-select"
                value={food.type}
                onChange={(e) => setFood({ ...food, type: e.target.value })}
              >
                <option value="Veg">🌱 Vegetarian</option>
                <option value="Non-Veg">🍗 Non-Vegetarian</option>
                <option value="Vegan">🥑 Pure Vegan</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Prep Time (minutes)</label>
              <input
                className="form-input"
                type="number"
                placeholder="20"
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
              <label className="form-label">Kitchen Inventory Status</label>
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
              <label className="form-label">Culinary Description & Ingredients</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Fresh ingredients, cooking style, allergies warning, serving suggestions..."
                value={food.description}
                onChange={(e) => setFood({ ...food, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 26, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Food Item
            </button>
            <Link to="/food-management/foods" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
