import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, KeyRound, LogOut, ChevronDown, Menu } from 'lucide-react';

export default function Header({ onLogout, sidebarCollapsed = false, onToggleSidebar }) {
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('restaurant_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const userName = currentUser?.name || '';
  const userEmail = currentUser?.email || '';
  const userInitial = userName.charAt(0).toUpperCase() || '';

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant_user');
    setDropdownOpen(false);
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={18} />
        </button>

        <button
          className={`store-status-pill ${isOpen ? 'open' : 'closed'}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Click to toggle store accepting live orders"
        >
          <span className="pulse-dot"></span>
          <span>{isOpen ? 'Store Active (Accepting Orders)' : 'Store Paused (Offline)'}</span>
        </button>
      </div>

      <div className="header-right">
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="profile-trigger-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className="profile-avatar-sm">{userInitial}</div>
            <div className="profile-info-sm">
              <div className="profile-name-sm">{userName}</div>
              <div className="profile-role-sm">Store Manager</div>
            </div>
            <ChevronDown
              size={15}
              color="var(--text-muted)"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header-block">
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{userName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{userEmail}</div>
                <span className="badge badge-primary" style={{ marginTop: 6, fontSize: 10 }}>Restaurant Partner</span>
              </div>

              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <User size={16} />
                <span>My Profile</span>
              </Link>

              <Link to="/change-password" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <KeyRound size={16} />
                <span>Change Password</span>
              </Link>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item danger" onClick={handleSignOut}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
