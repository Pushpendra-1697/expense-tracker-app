import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, register } from '../store/authSlice';
import { validateRegister } from '../utils/validation';
import FormField from './FormField';
import PasswordInput from './PasswordInput';

export default function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const onChange = (e) => {
    dispatch(clearError());
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (touched[e.target.name] || Object.keys(touched).length) {
      setErrors(validateRegister(next));
    }
  };

  const onBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    setErrors(validateRegister({ ...form, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateRegister(form);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await dispatch(
      register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
    );
    if (register.fulfilled.match(result)) navigate('/');
  };

  return (
    <form onSubmit={onSubmit} className="auth-card space-y-4" noValidate>
      <div>
        <p className="eyebrow">Get started</p>
        <h1 className="font-display text-3xl text-ink-950 sm:text-4xl">Create account</h1>
        <p className="mt-2 text-sm text-ink-700/65">Track spending and grow savings in minutes</p>
      </div>

      {error && (
        <div className="banner-error" role="alert">
          {error}
        </div>
      )}

      <FormField label="Name" htmlFor="name" error={touched.name && errors.name} required>
        <input
          id="name"
          name="name"
          className={`input ${touched.name && errors.name ? 'input-invalid' : ''}`}
          value={form.name}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Your full name"
          aria-invalid={Boolean(touched.name && errors.name)}
        />
      </FormField>

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
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        error={touched.password && errors.password}
        hint="At least 6 characters"
        required
      >
        <PasswordInput
          id="password"
          name="password"
          value={form.password}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="new-password"
          className={touched.password && errors.password ? 'is-invalid' : ''}
          aria-invalid={Boolean(touched.password && errors.password)}
        />
      </FormField>

      <FormField
        label="Confirm password"
        htmlFor="confirmPassword"
        error={touched.confirmPassword && errors.confirmPassword}
        required
      >
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="new-password"
          placeholder="Re-enter password"
          className={touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}
          aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
        />
      </FormField>

      <button type="submit" className="btn-accent w-full !py-3" disabled={loading}>
        {loading ? 'Creating…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-ink-700/70">
        Already have an account?{' '}
        <Link className="font-semibold text-mint-600 hover:text-mint-500" to="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
