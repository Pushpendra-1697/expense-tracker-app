import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/format';

const COLORS = ['#14b8a6', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#64748b'];
const PERIODS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: '3months', label: '3 Months' },
  { id: 'year', label: 'Year' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('bar');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/analytics', { params: { period } });
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [period]);

  if (loading) return <LoadingState label="Computing analytics…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const hasData = data.monthlyIncome > 0 || data.monthlyExpenses > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl text-ink-950">Analytics</h2>
          <p className="text-sm text-ink-700/60">Computed from your real transactions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={period === p.id ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">Income</p>
          <p className="mt-2 font-display text-3xl text-mint-600">{formatCurrency(data.monthlyIncome)}</p>
        </div>
        <div className="panel">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">Expenses</p>
          <p className="mt-2 font-display text-3xl text-coral-500">
            {formatCurrency(data.monthlyExpenses)}
          </p>
        </div>
        <div className="panel">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">Net savings</p>
          <p className="mt-2 font-display text-3xl text-ink-950">{formatCurrency(data.netSavings)}</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState title="No data for this period" description="Add transactions to unlock charts." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel">
            <h3 className="mb-4 font-display text-xl">Category breakdown</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {data.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl">Spending trends</h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={chartType === 'bar' ? 'btn-primary !py-1 !px-3 text-xs' : 'btn-ghost !py-1 !px-3 text-xs'}
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </button>
                <button
                  type="button"
                  className={chartType === 'line' ? 'btn-primary !py-1 !px-3 text-xs' : 'btn-ghost !py-1 !px-3 text-xs'}
                  onClick={() => setChartType('line')}
                >
                  Line
                </button>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={data.trends}>
                    <XAxis dataKey="label" hide={data.trends.length > 8} />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="income" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={data.trends}>
                    <XAxis dataKey="label" hide={data.trends.length > 8} />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#14b8a6" strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
