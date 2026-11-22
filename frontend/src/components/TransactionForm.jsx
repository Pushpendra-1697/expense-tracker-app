import { useEffect, useState } from 'react';
import { todayISO } from '../utils/format';

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
  const [error, setError] = useState('');

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
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!form.account) {
      setError('Please select an account');
      return;
    }
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount),
        recurrence: form.isRecurring ? { frequency: form.frequency } : undefined,
      });
      if (!initial) setForm({ ...empty, account: accounts[0]?._id || '' });
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-testid="transaction-form">
      {error && (
        <div className="rounded-xl bg-coral-500/10 px-3 py-2 text-sm text-coral-500" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            className="input"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="type">
            Type
          </label>
          <select id="type" name="type" className="input" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="input"
            value={form.category}
            onChange={handleChange}
          >
            {filteredCategories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="account">
            Account
          </label>
          <select
            id="account"
            name="account"
            className="input"
            value={form.account}
            onChange={handleChange}
            required
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="input"
            value={form.date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label" htmlFor="note">
            Note
          </label>
          <input id="note" name="note" className="input" value={form.note} onChange={handleChange} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isRecurring"
          checked={form.isRecurring}
          onChange={handleChange}
        />
        Recurring transaction
      </label>

      {form.isRecurring && (
        <div>
          <label className="label" htmlFor="frequency">
            Frequency
          </label>
          <select
            id="frequency"
            name="frequency"
            className="input"
            value={form.frequency}
            onChange={handleChange}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
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
