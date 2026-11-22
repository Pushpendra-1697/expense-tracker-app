import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import LoginForm from './LoginForm';

const renderLogin = () => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: null, token: null, loading: false, error: null },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </Provider>
  );
};

describe('LoginForm', () => {
  it('renders email and password fields with show/hide toggle', () => {
    renderLogin();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(document.getElementById('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows typing credentials and toggling password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();
    const email = screen.getByRole('textbox', { name: /email/i });
    const password = document.getElementById('password');
    await user.type(email, 'demo@example.com');
    await user.type(password, 'password123');
    expect(email).toHaveValue('demo@example.com');
    expect(password).toHaveValue('password123');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(password).toHaveAttribute('type', 'text');
  });

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
