import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionList from './TransactionList';

const sample = [
  {
    _id: '1',
    amount: 25,
    type: 'expense',
    category: 'Food',
    note: 'Lunch',
    date: '2026-07-01',
    account: { name: 'Cash' },
  },
  {
    _id: '2',
    amount: 2500,
    type: 'income',
    category: 'Salary',
    note: 'Monthly Salary',
    date: '2026-07-02',
    account: { name: 'Bank' },
  },
];

describe('TransactionList', () => {
  it('shows empty state when no transactions', () => {
    render(<TransactionList transactions={[]} />);
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it('renders transaction details', () => {
    render(<TransactionList transactions={sample} />);
    expect(screen.getByText(/Lunch/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Salary/i)).toBeInTheDocument();
    expect(screen.getByTestId('transaction-list').children).toHaveLength(2);
  });

  it('calls onEdit when edit is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TransactionList transactions={sample} onEdit={onEdit} />);
    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    expect(onEdit).toHaveBeenCalledWith(sample[0]);
  });
});
