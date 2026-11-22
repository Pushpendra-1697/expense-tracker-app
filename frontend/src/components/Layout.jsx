import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/goals', label: 'Goals' },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">Ledgerly</p>
          <p className="text-sm text-ink-700/60">Track spending. Grow savings.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-700/70 sm:inline">Hi, {user?.name?.split(' ')[0]}</span>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-ink-900 text-white'
                  : 'bg-white/60 text-ink-700 hover:bg-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
