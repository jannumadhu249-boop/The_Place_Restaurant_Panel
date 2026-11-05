import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Network,
  Users,
  Shield,
  ShoppingCart,
  Wallet,
  Star,
  FileBarChart,
  Receipt,
  ArrowLeftRight,
  Pizza,
  Armchair,
  ShoppingBag,
  LayoutGrid,
  UserCheck,
  MapPin,
} from 'lucide-react';
import Header from './Header';

export default function Layout({ onLogout }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant_user');
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { section: 'Overview' },
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Order Management', icon: ShoppingCart },

    { section: 'Service Options' },
    { to: '/service/dine-in', label: 'Dine-in', icon: Armchair },
    { to: '/service/takeaway', label: 'Takeaway', icon: ShoppingBag },
    { to: '/service/tables', label: 'Tables', icon: LayoutGrid },
    { to: '/service/floor-sections', label: 'Floor Sections', icon: MapPin },
    { to: '/service/captains', label: 'Captains & Servers', icon: UserCheck },

    { section: 'Billing' },
    { to: '/billing', label: 'Billing', icon: Receipt },

    { section: 'Food Management' },
    { to: '/food-management/foods', label: 'Foods Menu', icon: UtensilsCrossed },
    { to: '/food-management/categories', label: 'Categories', icon: Layers },
    { to: '/food-management/sub-categories', label: 'Sub-Categories', icon: Network },

    { section: 'Marketing & Sales' },
    { to: '/reviews', label: 'Customer Reviews', icon: Star },
    { to: '/my-wallet', label: 'My Wallet', icon: Wallet },

    { section: 'Reports Management' },
    { to: '/reports/order', label: 'Order Report', icon: FileBarChart },
    { to: '/reports/tax', label: 'Tax Report', icon: Receipt },
    { to: '/reports/transaction', label: 'Transaction Report', icon: ArrowLeftRight },
    { to: '/reports/food', label: 'Food Report', icon: Pizza },

    { section: 'Staff & Roles' },
    { to: '/employee-management/employees', label: 'Employees', icon: Users },
    { to: '/employee-management/roles', label: 'Employee Roles', icon: Shield },
  ];

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`fixed-sidebar ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon">
            <UtensilsCrossed size={22} />
          </div>
          {!sidebarCollapsed && (
            <div className="brand-text">
              <div className="brand-title">The Place</div>
              <div className="brand-sub">Store Panel</div>
            </div>
          )}
        </div>

        <nav className="sidebar-menu">
          {navLinks.map((item, idx) => {
            if (item.section) {
              if (sidebarCollapsed) return null;
              return <div key={idx} className="nav-section-title">{item.section}</div>;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={17} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="main-wrapper">
        <Header
          onLogout={onLogout}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
