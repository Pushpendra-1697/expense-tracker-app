import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function AuthPage({ mode = 'login' }) {
  const { token } = useSelector((state) => state.auth);
  if (token) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(244,63,94,0.18),transparent_35%)]" />
      <div className="relative w-full">
        <div className="mb-8 text-center">
          <h1 className="font-display text-5xl text-ink-950 sm:text-6xl">Ledgerly</h1>
          <p className="mt-2 text-ink-700/70">Expense management that stays out of your way</p>
        </div>
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
