import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/foods',  label: 'Đồ ăn',   icon: '🍜' },
  { to: '/drinks', label: 'Đồ uống', icon: '🧋' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Mở menu">
          <span /><span /><span />
        </button>
        <span className="mobile-header-title">🍽 Food Match Admin</span>
        <div className="sidebar-user-avatar mobile-avatar">
          {user?.username?.[0]?.toUpperCase()}
        </div>
      </header>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar${open ? ' is-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🍽</span>
          <div>
            <p className="sidebar-logo-label">Food Match</p>
            <p className="sidebar-logo-sub">Admin Panel</p>
          </div>
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Đóng">✕</button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="sidebar-user-avatar">{user?.username?.[0]?.toUpperCase()}</span>
            <span>{user?.username}</span>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}
