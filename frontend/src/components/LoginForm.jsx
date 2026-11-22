import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, login } from '../store/authSlice';
import { validateLogin } from '../utils/validation';
import FormField from './FormField';
import PasswordInput from './PasswordInput';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const onChange = (e) => {
    dispatch(clearError());
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (touched[e.target.name]) {
      setErrors(validateLogin(next));
    }
  };

  const onBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    setErrors(validateLogin({ ...form, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateLogin(form);
    setTouched({ email: true, password: true });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate('/');
  };

  return (
    <form onSubmit={onSubmit} className="auth-card space-y-5" data-testid="login-form" noValidate>
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="font-display text-3xl text-ink-950 sm:text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-ink-700/65">Access your Ledgerly workspace</p>
      </div>

      {error && (
        <div className="banner-error" role="alert">
          {error}
        </div>
      )}

      <FormField label="Email" htmlFor="email" error={touched.email && errors.email} required>
        <input
          id="email"
          name="email"
          type="email"
          className={`input ${touched.email && errors.email ? 'input-invalid' : ''}`}
          value={form.email}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={Boolean(touched.email && errors.email)}
          aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        error={touched.password && errors.password}
        required
      >
        <PasswordInput
          id="password"
          name="password"
          value={form.password}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="current-password"
          className={touched.password && errors.password ? 'is-invalid' : ''}
          aria-invalid={Boolean(touched.password && errors.password)}
          aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
        />
      </FormField>

      <button type="submit" className="btn-primary w-full !py-3" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-ink-700/70">
        New here?{' '}
        <Link className="font-semibold text-mint-600 hover:text-mint-500" to="/register">
          Create an account
        </Link>
      </p>
    </form>
  );
}
