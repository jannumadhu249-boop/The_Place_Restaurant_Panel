import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Power, User, KeyRound, LogOut, ChevronDown, Bell, CheckCircle } from 'lucide-react';

export default function Header({ onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setDropdownOpen(false);
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <header className="top-header">
      {/* Left: Store Operating Status */}
      <div className="header-left">
        <button
          className={`store-status-pill ${isOpen ? 'open' : 'closed'}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Click to toggle store accepting live orders"
        >
          <span className="pulse-dot"></span>
          <span>{isOpen ? 'Store Active (Accepting Orders)' : 'Store Paused (Offline)'}</span>
        </button>
      </div>

      {/* Right: Notifications & Profile Dropdown */}
      <div className="header-right">
        {/* Profile Dropdown */}
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="profile-trigger-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className="profile-avatar-sm">M</div>
            <div className="profile-info-sm">
              <div className="profile-name-sm">Marcus Vance</div>
              <div className="profile-role-sm">Store Manager</div>
            </div>
            <ChevronDown size={15} color="var(--text-muted)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header-block">
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Marcus Vance</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>marcus@spicegarden.com</div>
                <span className="badge badge-primary" style={{ marginTop: 6, fontSize: 10 }}>Branch Manager</span>
              </div>

              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>

              <Link
                to="/change-password"
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <KeyRound size={16} />
                <span>Change Password</span>
              </Link>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-item danger"
                onClick={handleSignOut}
              >
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
