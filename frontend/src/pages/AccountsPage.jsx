import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatCurrency } from '../utils/format';

const TYPES = ['Cash', 'Bank Account', 'Credit Card', 'Wallet', 'Savings'];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [combined, setCombined] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', type: 'Cash', balance: 0 });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/accounts');
      setAccounts(data.data);
      setCombined(data.combinedBalance);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/accounts', { ...form, balance: Number(form.balance) || 0 });
    setForm({ name: '', type: 'Cash', balance: 0 });
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete account');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-ink-950">Accounts & Wallets</h2>
        <p className="text-sm text-ink-700/60">
          Combined balance: <strong>{formatCurrency(combined)}</strong>
        </p>
      </div>

      <form onSubmit={create} className="panel grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Type</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Opening balance</label>
          <input
            type="number"
            className="input"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full">
            Add account
          </button>
        </div>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <div key={a._id} className="panel">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-700/50">{a.type}</p>
                <h3 className="font-display text-2xl text-ink-950">{a.name}</h3>
              </div>
              <button type="button" className="text-xs text-coral-500" onClick={() => remove(a._id)}>
                Delete
              </button>
            </div>
            <p className="mt-4 text-2xl font-semibold text-mint-600">{formatCurrency(a.balance)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
