import { categoryIcon, formatCurrency, formatDate } from '../utils/format';
import EmptyState from './EmptyState';

export default function TransactionList({
  transactions = [],
  onEdit,
  onDelete,
  loading = false,
}) {
  if (!loading && transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add your first income or expense to see it here."
      />
    );
  }

  return (
    <ul className="space-y-2" data-testid="transaction-list">
      {transactions.map((tx) => (
        <li
          key={tx._id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-900/5 bg-white/80 px-4 py-3"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="text-xl" aria-hidden>
              {categoryIcon(tx.category)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink-900">
                {tx.category}
                {tx.note ? <span className="font-normal text-ink-700/60"> — {tx.note}</span> : null}
              </p>
              <p className="text-xs text-ink-700/60">
                {formatDate(tx.date)} · {tx.account?.name || 'Account'}
                {tx.isRecurring ? ' · Recurring' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-bold ${
                tx.type === 'income' ? 'text-mint-600' : 'text-coral-500'
              }`}
            >
              {tx.type === 'income' ? '+' : '-'}
              {formatCurrency(tx.amount)}
            </span>
            {(onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={() => onEdit(tx)}>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-1 text-xs text-coral-500"
                    onClick={() => onDelete(tx)}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
