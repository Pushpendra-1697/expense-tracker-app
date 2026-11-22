import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatCurrency } from '../utils/format';

export default function BudgetsPage() {
  const [status, setStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [overallLimit, setOverallLimit] = useState(0);
  const [catBudget, setCatBudget] = useState({ category: 'Food', limit: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [budgetRes, catRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/categories', { params: { type: 'expense' } }),
      ]);
      setStatus(budgetRes.data.data);
      setOverallLimit(budgetRes.data.data.overallLimit || 0);
      setCategories(catRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveOverall = async (e) => {
    e.preventDefault();
    await api.put('/budgets', { overallLimit: Number(overallLimit) || 0 });
    await load();
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    const existing = (status?.categoryBudgets || []).map((c) => ({
      category: c.category,
      limit: c.limit,
    }));
    const idx = existing.findIndex((c) => c.category === catBudget.category);
    const next = { category: catBudget.category, limit: Number(catBudget.limit) || 0 };
    if (idx >= 0) existing[idx] = next;
    else existing.push(next);
    await api.put('/budgets', { categoryBudgets: existing, overallLimit: Number(overallLimit) || 0 });
    setCatBudget({ category: 'Food', limit: '' });
    await load();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-ink-950">Budgets</h2>
        <p className="text-sm text-ink-700/60">Monthly overall and per-category limits</p>
      </div>

      {status?.warning && (
        <div className="rounded-xl border border-coral-500/20 bg-coral-500/10 px-4 py-3 text-sm text-coral-500">
          {status.warning}
        </div>
      )}

      <div className="panel">
        <h3 className="font-display text-xl">Overall monthly budget</h3>
        <p className="mt-1 text-sm text-ink-700/60">
          Spent {formatCurrency(status.spent)} of {formatCurrency(status.overallLimit)} (
          {status.percentUsed}%)
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink-900/10">
          <div
            className={`h-full rounded-full ${status.percentUsed >= 90 ? 'bg-coral-500' : 'bg-mint-500'}`}
            style={{ width: `${Math.min(100, status.percentUsed)}%` }}
          />
        </div>
        <form onSubmit={saveOverall} className="mt-4 flex flex-wrap gap-2">
          <input
            type="number"
            min="0"
            className="input max-w-xs"
            value={overallLimit}
            onChange={(e) => setOverallLimit(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Save budget
          </button>
        </form>
      </div>

      <div className="panel space-y-4">
        <h3 className="font-display text-xl">Category budgets</h3>
        <form onSubmit={saveCategory} className="grid gap-3 sm:grid-cols-3">
          <select
            className="input"
            value={catBudget.category}
            onChange={(e) => setCatBudget({ ...catBudget, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="input"
            placeholder="Limit"
            value={catBudget.limit}
            onChange={(e) => setCatBudget({ ...catBudget, limit: e.target.value })}
            required
          />
          <button type="submit" className="btn-accent">
            Set category budget
          </button>
        </form>

        <div className="space-y-3">
          {(status.categoryBudgets || []).map((c) => (
            <div key={c.category}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">{c.category}</span>
                <span>
                  {formatCurrency(c.spent)} / {formatCurrency(c.limit)} ({c.percentUsed}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-900/10">
                <div
                  className={`h-full rounded-full ${c.percentUsed >= 90 ? 'bg-coral-500' : 'bg-mint-500'}`}
                  style={{ width: `${Math.min(100, c.percentUsed)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
