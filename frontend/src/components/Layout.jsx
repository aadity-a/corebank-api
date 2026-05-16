import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: '◈', label: 'Dashboard' },
  { to: '/account',      icon: '◉', label: 'Account' },
  { to: '/transactions', icon: '⇄', label: 'Transactions' },
  { to: '/transfer',     icon: '↗', label: 'Transfer' },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (isLight) document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  }, [isLight]);

  const handleSignOut = () => { signOut(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
    : '?';

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">A</div>
          <span className="logo-text">apnabank</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item--active' : ''}`}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {user?.role === 'ADMIN' && (
          <nav className="sidebar-nav" style={{ marginTop: 'auto', flexGrow: 0, paddingBottom: '20px' }}>
            <NavLink to="/admin" className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item--active' : ''}`}>
              <span className="nav-icon">★</span>
              <span className="nav-label">Admin Panel</span>
            </NavLink>
          </nav>
        )}

        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => setIsLight(!isLight)} style={{ marginBottom: '12px', width: '100%' }}>
            {isLight ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleSignOut} id="btn-signout">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
