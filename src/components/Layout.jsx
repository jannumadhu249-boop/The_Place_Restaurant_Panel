import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Network,
  Users,
  Shield,
  ShoppingCart,
  Clock,
  Tag,
  Wallet,
  Star,
  Megaphone,
  Store,
  LogOut
} from 'lucide-react';
import Header from './Header';

export default function Layout({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navLinks = [
    { section: 'Overview' },
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Order Management', icon: ShoppingCart },

    { section: 'Food Management' },
    { to: '/food-management/foods', label: 'Foods Menu', icon: UtensilsCrossed },
    { to: '/food-management/categories', label: 'Categories', icon: Layers },
    { to: '/food-management/sub-categories', label: 'Sub-Categories', icon: Network },

    { section: 'Staff & Roles' },
    { to: '/employee-management/employees', label: 'Employees', icon: Users },
    { to: '/employee-management/roles', label: 'Employee Roles', icon: Shield },

    { section: 'Marketing & Sales' },
    { to: '/happy-hours', label: 'Happy Hours', icon: Clock },
    { to: '/coupons', label: 'Coupons', icon: Tag },
    { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
    { to: '/reviews', label: 'Customer Reviews', icon: Star },
    { to: '/my-wallet', label: 'My Wallet', icon: Wallet },

    { section: 'Store Settings' },
    { to: '/restaurant', label: 'Restaurant Info', icon: Store }
  ];

  return (
    <div className="app-container">
      {/* Fixed Scrollable Sidebar */}
      <aside className="fixed-sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div className="brand-title">Spice Garden</div>
            <div className="brand-sub">Store Panel</div>
          </div>
        </div>

        <nav className="sidebar-menu">
          {navLinks.map((item, idx) => {
            if (item.section) {
              return <div key={idx} className="nav-section-title">{item.section}</div>;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ width: '100%', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', justifyContent: 'center' }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div> */}
      </aside>

      {/* Main Right Content */}
      <div className="main-wrapper">
        <Header onLogout={onLogout} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
