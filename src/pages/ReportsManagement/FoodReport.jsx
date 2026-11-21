import React, { useMemo, useState } from 'react';
import {
  Pizza,
  Download,
  RefreshCw,
  Search,
  Filter,
  Utensils,
  ShoppingBag,
  IndianRupee,
  Trophy,
} from 'lucide-react';
import './Reports.css';
import ReportStatsCards from './ReportStatsCards';
import ReportPagination from './ReportPagination';

const SAMPLE_FOODS = [
  { id: 'F-101', name: 'Butter Chicken Special', category: 'Main Course', sold: 248, revenue: 4213.5, avgRating: 4.8, stock: 'In Stock' },
  { id: 'F-102', name: 'Paneer Butter Masala', category: 'Main Course', sold: 194, revenue: 2813.0, avgRating: 4.7, stock: 'In Stock' },
  { id: 'F-103', name: 'Garlic Butter Naan', category: 'Breads', sold: 420, revenue: 1470.0, avgRating: 4.9, stock: 'In Stock' },
  { id: 'F-104', name: 'Crispy Veg Spring Rolls', category: 'Starters', sold: 152, revenue: 1214.48, avgRating: 4.5, stock: 'Low Stock' },
  { id: 'F-105', name: 'Mango Lassi Chilled', category: 'Beverages', sold: 180, revenue: 898.2, avgRating: 4.6, stock: 'In Stock' },
  { id: 'F-106', name: 'Chicken Biryani Feast', category: 'Main Course', sold: 96, revenue: 1824.0, avgRating: 4.4, stock: 'Out of Stock' },
  { id: 'F-107', name: 'Gulab Jamun (2pc)', category: 'Desserts', sold: 134, revenue: 536.0, avgRating: 4.8, stock: 'In Stock' },
];

export default function FoodReport() {
  const [category, setCategory] = useState('All');
  const [stock, setStock] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('sold');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(SAMPLE_FOODS.map((f) => f.category)))],
    []
  );

  const filtered = useMemo(() => {
    let rows = SAMPLE_FOODS.filter((f) => {
      const catOk = category === 'All' || f.category === category;
      const stockOk = stock === 'All' || f.stock === stock;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return catOk && stockOk && searchOk;
    });

    rows = [...rows].sort((a, b) => {
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'rating') return b.avgRating - a.avgRating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.sold - a.sold;
    });
    return rows;
  }, [category, stock, search, sortBy]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, f) => ({
        sold: acc.sold + f.sold,
        revenue: acc.revenue + f.revenue,
        items: acc.items + 1
      }),
      { sold: 0, revenue: 0, items: 0 }
    );
  }, [filtered]);

  // Client-side pagination — clamps to the real page count when filters shrink the list
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stockBadge = (s) => {
    if (s === 'In Stock') return 'badge-success';
    if (s === 'Low Stock') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Pizza size={22} color="var(--primary)" /> Food Report
          </h1>
          <p className="page-desc">Menu performance by sales volume, revenue, ratings, and stock status</p>
        </div>
        <div className="report-actions">
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button type="button" className="btn btn-primary">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <ReportStatsCards
        cards={[
          { label: 'Menu Items', value: totals.items, hint: 'In current filter', icon: <Utensils size={18} />, tone: 'blue' },
          { label: 'Units Sold', value: totals.sold.toLocaleString(), hint: 'Across selected items', icon: <ShoppingBag size={18} />, tone: 'green' },
          { label: 'Food Revenue', value: `₹ ${totals.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, hint: 'Gross item sales', icon: <IndianRupee size={18} />, tone: 'amber' },
          {
            label: 'Top Seller',
            value: (
              <span className="report-stat-text" title={filtered[0]?.name || ''}>
                {filtered[0]?.name || '—'}
              </span>
            ),
            hint: filtered[0] ? `${filtered[0].sold} sold` : 'No items',
            icon: <Trophy size={18} />,
            tone: 'violet',
          },
        ]}
      />

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Menu Performance</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sort and filter by category or availability</p>
          </div>
        </div>

        <div className="report-filters">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Stock Status</label>
            <select className="form-select" value={stock} onChange={(e) => { setStock(e.target.value); setPage(1); }}>
              <option>All</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select className="form-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              <option value="sold">Units Sold</option>
              <option value="revenue">Revenue</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Food name or ID…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Food Name</th>
                <th>Category</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Avg Rating</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                    <Filter size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    No food items match the selected filters.
                  </td>
                </tr>
              ) : (
                pagedRows.map((f) => (
                  <tr key={f.id}>
                    <td><strong>{f.id}</strong></td>
                    <td>{f.name}</td>
                    <td>{f.category}</td>
                    <td>{f.sold.toLocaleString()}</td>
                    <td><strong>₹ {f.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td>{f.avgRating.toFixed(1)}</td>
                    <td><span className={`badge ${stockBadge(f.stock)}`}>{f.stock}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ReportPagination
          page={currentPage}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
