import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import TransactionFilters from '../components/TransactionFilters';

const defaultFilters = {
  page: 1,
  limit: 10,
  type: '',
  category: '',
  account: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  search: '',
};

export default function TransactionsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadMeta = useCallback(async () => {
    const [acc, cats] = await Promise.all([api.get('/accounts'), api.get('/categories')]);
    setAccounts(acc.data.data);
    setCategories(cats.data.data);
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const { data } = await api.get('/transactions', { params });
      setTransactions(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMeta().catch(() => {});
  }, [loadMeta]);

  useEffect(() => {
    const t = setTimeout(loadTransactions, filters.search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadTransactions, filters.search]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/transactions/${editing._id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      setEditing(null);
      setShowForm(false);
      await loadTransactions();
      await loadMeta();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tx) => {
    if (!window.confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${tx._id}`);
    await loadTransactions();
  };

  const exportCsv = async () => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([k, v]) => k !== 'page' && k !== 'limit' && v !== '')
    );
    const res = await api.get('/transactions/export/csv', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl text-ink-950">Transactions</h2>
          <p className="text-sm text-ink-700/60">Paginated history with filters</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={exportCsv}>
            Export CSV
          </button>
          <button
            type="button"
            className="btn-accent"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            Add Transaction
          </button>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        accounts={accounts}
        categories={categories}
      />

      {(showForm || editing) && (
        <div className="panel">
          <h3 className="mb-3 font-display text-xl">{editing ? 'Edit transaction' : 'New transaction'}</h3>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            initial={editing}
            onSubmit={handleSave}
            loading={saving}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {error && <ErrorState message={error} onRetry={loadTransactions} />}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <TransactionList
            transactions={transactions}
            onEdit={(tx) => {
              setEditing(tx);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-700/60">
              Page {pagination.page} of {pagination.pages} · {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-ghost"
                disabled={pagination.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn-ghost"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
