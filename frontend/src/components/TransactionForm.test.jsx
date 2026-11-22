import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from './TransactionForm';

const accounts = [{ _id: 'a1', name: 'Cash', type: 'Cash' }];
const categories = [
  { _id: 'c1', name: 'Food', type: 'expense' },
  { _id: 'c2', name: 'Salary', type: 'income' },
];

describe('TransactionForm', () => {
  it('renders required fields', () => {
    render(
      <TransactionForm accounts={accounts} categories={categories} onSubmit={async () => {}} />
    );
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
  });

  it('validates amount before submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TransactionForm accounts={accounts} categories={categories} onSubmit={onSubmit} />);
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '0');
    fireEvent.submit(screen.getByTestId('transaction-form'));
    expect(await screen.findByText(/greater than 0/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid transaction payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TransactionForm accounts={accounts} categories={categories} onSubmit={onSubmit} />);
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '42.5');
    await user.type(screen.getByLabelText(/note/i), 'Coffee');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0].amount).toBe(42.5);
    expect(onSubmit.mock.calls[0][0].note).toBe('Coffee');
  });
});
