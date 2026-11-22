import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, login } from '../store/authSlice';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const onChange = (e) => {
    dispatch(clearError());
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate('/');
  };

  return (
    <form onSubmit={onSubmit} className="panel mx-auto w-full max-w-md space-y-4" data-testid="login-form">
      <div>
        <h1 className="font-display text-3xl text-ink-950">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-700/60">Sign in to your Ledgerly account</p>
      </div>

      {error && (
        <div className="rounded-xl bg-coral-500/10 px-3 py-2 text-sm text-coral-500" role="alert">
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          value={form.email}
          onChange={onChange}
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          value={form.password}
          onChange={onChange}
          required
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-ink-700/70">
        New here?{' '}
        <Link className="font-semibold text-mint-600" to="/register">
          Create an account
        </Link>
      </p>
    </form>
  );
}
