import { useEffect, useState } from 'react';
import { todayISO } from '../utils/format';
import { validateTransaction } from '../utils/validation';
import FormField from './FormField';

const empty = {
  amount: '',
  type: 'expense',
  category: 'Food',
  account: '',
  note: '',
  date: todayISO(),
  isRecurring: false,
  frequency: 'monthly',
};

export default function TransactionForm({
  accounts = [],
  categories = [],
  initial,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        amount: initial.amount ?? '',
        type: initial.type || 'expense',
        category: initial.category || 'Food',
        account: initial.account?._id || initial.account || '',
        note: initial.note || '',
        date: initial.date ? String(initial.date).slice(0, 10) : todayISO(),
        isRecurring: Boolean(initial.isRecurring),
        frequency: initial.recurrence?.frequency || 'monthly',
      });
    } else if (accounts[0]) {
      setForm((prev) => ({ ...prev, account: accounts[0]._id }));
    }
  }, [initial, accounts]);

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'type') {
        const first = categories.find((c) => c.type === value);
        next.category = first?.name || (value === 'income' ? 'Salary' : 'Food');
      }
      if (touched[name] || Object.keys(touched).length) {
        setErrors(validateTransaction(next));
      }
      return next;
    });
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    setErrors(validateTransaction(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const nextErrors = validateTransaction(form);
    setTouched({
      amount: true,
      type: true,
      category: true,
      account: true,
      date: true,
      note: true,
      frequency: true,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError('Please fix the highlighted fields');
      return;
    }
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount),
        recurrence: form.isRecurring ? { frequency: form.frequency } : undefined,
      });
      if (!initial) setForm({ ...empty, account: accounts[0]?._id || '' });
      setTouched({});
      setErrors({});
    } catch (err) {
      setFormError(err.message || 'Failed to save transaction');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="transaction-form" noValidate>
      {formError && (
        <div className="banner-error" role="alert">
          {formError}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Amount" htmlFor="amount" error={touched.amount && errors.amount} required>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            className={`input ${touched.amount && errors.amount ? 'input-invalid' : ''}`}
            value={form.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0.00"
          />
        </FormField>

        <FormField label="Type" htmlFor="type" error={touched.type && errors.type} required>
          <select
            id="type"
            name="type"
            className={`input ${touched.type && errors.type ? 'input-invalid' : ''}`}
            value={form.type}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </FormField>

        <FormField
          label="Category"
          htmlFor="category"
          error={touched.category && errors.category}
          required
        >
          <select
            id="category"
            name="category"
            className={`input ${touched.category && errors.category ? 'input-invalid' : ''}`}
            value={form.category}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            {filteredCategories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Account" htmlFor="account" error={touched.account && errors.account} required>
          <select
            id="account"
            name="account"
            className={`input ${touched.account && errors.account ? 'input-invalid' : ''}`}
            value={form.account}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.type})
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Date" htmlFor="date" error={touched.date && errors.date} required>
          <input
            id="date"
            name="date"
            type="date"
            className={`input ${touched.date && errors.date ? 'input-invalid' : ''}`}
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormField>

        <FormField label="Note" htmlFor="note" error={touched.note && errors.note}>
          <input
            id="note"
            name="note"
            className={`input ${touched.note && errors.note ? 'input-invalid' : ''}`}
            value={form.note}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Optional note"
            maxLength={500}
          />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-800">
        <input
          type="checkbox"
          name="isRecurring"
          checked={form.isRecurring}
          onChange={handleChange}
          className="h-4 w-4 accent-mint-600"
        />
        Recurring transaction
      </label>

      {form.isRecurring && (
        <FormField
          label="Frequency"
          htmlFor="frequency"
          error={touched.frequency && errors.frequency}
          required
        >
          <select
            id="frequency"
            name="frequency"
            className={`input ${touched.frequency && errors.frequency ? 'input-invalid' : ''}`}
            value={form.frequency}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </FormField>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update' : 'Add Transaction'}
        </button>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
