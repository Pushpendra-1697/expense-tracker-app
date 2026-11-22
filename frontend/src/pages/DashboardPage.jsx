import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { formatCurrency } from '../utils/format';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [dash, acc, cats] = await Promise.all([
        api.get('/dashboard'),
        api.get('/accounts'),
        api.get('/categories'),
      ]);
      setData(dash.data.data);
      setAccounts(acc.data.data);
      setCategories(cats.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (payload) => {
    setSaving(true);
    try {
      await api.post('/transactions', payload);
      setShowForm(false);
      await load();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const chartData = [
    { name: 'Income', value: data.chart.income },
    { name: 'Expense', value: data.chart.expense },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Overview</p>
          <h2 className="font-display text-3xl text-ink-950 sm:text-4xl">Dashboard</h2>
          <p className="mt-1 text-sm text-ink-700/60">Your money at a glance</p>
        </div>
        <button type="button" className="btn-accent" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'Add Transaction'}
        </button>
      </div>

      {data.budgetWarning && (
        <div className="rounded-xl border border-coral-500/20 bg-coral-500/10 px-4 py-3 text-sm text-coral-500">
          {data.budgetWarning}
        </div>
      )}

      {showForm && (
        <div className="panel">
          <h3 className="mb-3 font-display text-xl">Quick add</h3>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSubmit={handleAdd}
            loading={saving}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Balance', value: data.totalBalance },
          { label: 'Income', value: data.totalIncome },
          { label: 'Expenses', value: data.totalExpenses },
          { label: 'Remaining budget', value: data.remainingBudget },
        ].map((card) => (
          <div key={card.label} className="panel">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-ink-950">{formatCurrency(card.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl">Monthly budget</h3>
            <Link to="/budgets" className="text-sm font-semibold text-mint-600">
              Manage
            </Link>
          </div>
          <p className="text-sm text-ink-700/70">
            {formatCurrency(data.monthlyBudget)} limit · {data.percentBudgetUsed}% used
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink-900/10">
            <div
              className={`h-full rounded-full transition-all ${
                data.percentBudgetUsed >= 90 ? 'bg-coral-500' : 'bg-mint-500'
              }`}
              style={{ width: `${Math.min(100, data.percentBudgetUsed)}%` }}
            />
          </div>
        </div>

        <div className="panel">
          <h3 className="mb-3 font-display text-xl">Income vs Expense</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Recent transactions</h3>
          <Link to="/transactions" className="text-sm font-semibold text-mint-600">
            View all
          </Link>
        </div>
        <TransactionList transactions={data.recentTransactions} />
      </div>
    </div>
  );
}
