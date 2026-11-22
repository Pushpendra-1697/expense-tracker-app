import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/format';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [goalsRes, catsRes] = await Promise.all([
        api.get('/goals'),
        api.get('/categories'),
      ]);
      setGoals(goalsRes.data.data);
      setCategories(catsRes.data.data.filter((c) => c.isCustom));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/goals', {
      ...form,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
    });
    setForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
    await load();
  };

  const addProgress = async (goal, amount) => {
    await api.put(`/goals/${goal._id}`, {
      currentAmount: Number(goal.currentAmount) + Number(amount),
    });
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await api.delete(`/goals/${id}`);
    await load();
  };

  const createCategory = async (e) => {
    e.preventDefault();
    await api.post('/categories', newCategory);
    setNewCategory({ name: '', type: 'expense' });
    await load();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-ink-950">Savings Goals</h2>
        <p className="text-sm text-ink-700/60">Name a target and watch progress grow</p>
      </div>

      <form onSubmit={create} className="panel grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="input"
          placeholder="Goal name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          className="input"
          placeholder="Target amount"
          value={form.targetAmount}
          onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
          required
        />
        <input
          type="number"
          className="input"
          placeholder="Saved so far"
          value={form.currentAmount}
          onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
        />
        <input
          type="date"
          className="input"
          value={form.targetDate}
          onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          required
        />
        <button type="submit" className="btn-primary">
          Add goal
        </button>
      </form>

      {goals.length === 0 ? (
        <EmptyState title="No savings goals" description="Create a goal like New Laptop — $1,500." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => (
            <div key={g._id} className="panel">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-2xl">{g.name}</h3>
                  <p className="text-sm text-ink-700/60">Target date {formatDate(g.targetDate)}</p>
                </div>
                <button type="button" className="text-xs text-coral-500" onClick={() => remove(g._id)}>
                  Delete
                </button>
              </div>
              <p className="mt-3 text-sm">
                Target {formatCurrency(g.targetAmount)} / Saved {formatCurrency(g.currentAmount)} /
                Progress {g.progress}%
              </p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink-900/10">
                <div
                  className="h-full rounded-full bg-mint-500"
                  style={{ width: `${Math.min(100, g.progress)}%` }}
                />
              </div>
              <button
                type="button"
                className="btn-ghost mt-3"
                onClick={() => {
                  const amount = window.prompt('Add amount saved');
                  if (amount) addProgress(g, amount);
                }}
              >
                Add savings
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        <h3 className="mb-3 font-display text-xl">Custom categories</h3>
        <form onSubmit={createCategory} className="flex flex-wrap gap-2">
          <input
            className="input max-w-xs"
            placeholder="Category name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            required
          />
          <select
            className="input max-w-[140px]"
            value={newCategory.type}
            onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <button type="submit" className="btn-accent">
            Add category
          </button>
        </form>
        <ul className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c._id} className="rounded-full bg-ink-900/5 px-3 py-1 text-sm">
              {c.name} ({c.type})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
