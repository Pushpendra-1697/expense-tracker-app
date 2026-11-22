import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function AuthPage({ mode = 'login' }) {
  const { token } = useSelector((state) => state.auth);
  if (token) return <Navigate to="/" replace />;

  return (
    <div className="auth-shell">
      <div className="auth-visual" aria-hidden>
        <div className="auth-orb auth-orb-a" />
        <div className="auth-orb auth-orb-b" />
        <div className="auth-visual-content">
          <p className="font-display text-4xl text-white sm:text-5xl lg:text-6xl">Ledgerly</p>
          <p className="mt-4 max-w-sm text-base text-white/80">
            A calm, modern home for your income, expenses, budgets, and savings goals.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            <li className="auth-feature">Live dashboards & analytics</li>
            <li className="auth-feature">Budgets with smart warnings</li>
            <li className="auth-feature">Multi-account wallets</li>
          </ul>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="mb-6 text-center lg:hidden">
          <p className="font-display text-4xl text-ink-950">Ledgerly</p>
          <p className="mt-1 text-sm text-ink-700/65">Expense management that stays out of your way</p>
        </div>
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
