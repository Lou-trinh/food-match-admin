import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/foods',  label: 'Đồ ăn',   icon: '🍜' },
  { to: '/drinks', label: 'Đồ uống', icon: '🧋' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🍽</span>
          <div>
            <p className="sidebar-logo-label">Food Match</p>
            <p className="sidebar-logo-sub">Admin Panel</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
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
