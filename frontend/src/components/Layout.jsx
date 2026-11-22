import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const links = [
  { to: '/', label: 'Dashboard', short: 'Home' },
  { to: '/transactions', label: 'Transactions', short: 'Txns' },
  { to: '/analytics', label: 'Analytics', short: 'Charts' },
  { to: '/accounts', label: 'Accounts', short: 'Wallets' },
  { to: '/budgets', label: 'Budgets', short: 'Budget' },
  { to: '/goals', label: 'Goals', short: 'Goals' },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-ghost !px-3 lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="text-lg">{menuOpen ? '✕' : '☰'}</span>
          </button>
          <div>
            <p className="font-display text-2xl tracking-tight text-ink-950 sm:text-3xl">Ledgerly</p>
            <p className="hidden text-xs text-ink-700/55 sm:block">Track spending. Grow savings.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-full bg-white/70 px-3 py-1.5 text-sm text-ink-700/80 sm:block">
            Hi, <span className="font-semibold text-ink-900">{user?.name?.split(' ')[0]}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className={`app-nav-desktop ${menuOpen ? 'is-open' : ''}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `nav-chip ${isActive ? 'is-active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="app-main page-enter">
        <Outlet />
      </main>

      <nav className="app-nav-mobile" aria-label="Mobile">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `mobile-tab ${isActive ? 'is-active' : ''}`}
          >
            <span>{link.short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
