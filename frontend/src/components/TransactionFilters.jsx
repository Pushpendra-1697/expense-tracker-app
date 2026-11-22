export default function TransactionFilters({ filters, onChange, accounts = [], categories = [] }) {
  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="panel grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="transaction-filters">
      <div>
        <label className="label">Search</label>
        <input
          className="input"
          placeholder="Note, category, amount"
          value={filters.search || ''}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>
      <div>
        <label className="label">Type</label>
        <select
          className="input"
          value={filters.type || ''}
          onChange={(e) => set('type', e.target.value)}
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div>
        <label className="label">Category</label>
        <select
          className="input"
          value={filters.category || ''}
          onChange={(e) => set('category', e.target.value)}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Account</label>
        <select
          className="input"
          value={filters.account || ''}
          onChange={(e) => set('account', e.target.value)}
        >
          <option value="">All</option>
          {accounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Start date</label>
        <input
          type="date"
          className="input"
          value={filters.startDate || ''}
          onChange={(e) => set('startDate', e.target.value)}
        />
      </div>
      <div>
        <label className="label">End date</label>
        <input
          type="date"
          className="input"
          value={filters.endDate || ''}
          onChange={(e) => set('endDate', e.target.value)}
        />
      </div>
      <div>
        <label className="label">Min amount</label>
        <input
          type="number"
          className="input"
          value={filters.minAmount || ''}
          onChange={(e) => set('minAmount', e.target.value)}
        />
      </div>
      <div>
        <label className="label">Max amount</label>
        <input
          type="number"
          className="input"
          value={filters.maxAmount || ''}
          onChange={(e) => set('maxAmount', e.target.value)}
        />
      </div>
    </div>
  );
}
