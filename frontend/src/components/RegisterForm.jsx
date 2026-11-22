import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, register } from '../store/authSlice';

export default function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const onChange = (e) => {
    dispatch(clearError());
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) navigate('/');
  };

  return (
    <form onSubmit={onSubmit} className="panel mx-auto w-full max-w-md space-y-4">
      <div>
        <h1 className="font-display text-3xl text-ink-950">Create account</h1>
        <p className="mt-1 text-sm text-ink-700/60">Start tracking expenses in minutes</p>
      </div>

      {error && (
        <div className="rounded-xl bg-coral-500/10 px-3 py-2 text-sm text-coral-500" role="alert">
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input id="name" name="name" className="input" value={form.name} onChange={onChange} required />
      </div>
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
          minLength={6}
          required
        />
      </div>

      <button type="submit" className="btn-accent w-full" disabled={loading}>
        {loading ? 'Creating…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-ink-700/70">
        Already have an account?{' '}
        <Link className="font-semibold text-mint-600" to="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
