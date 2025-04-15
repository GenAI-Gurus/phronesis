/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPage from '../LoginPage';
import { MemoryRouter } from 'react-router-dom';
// Mock useNavigate only
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock api client
vi.mock('../../api/client', () => ({
  __esModule: true,
  default: { post: vi.fn() },
}));
import api from '../../api/client';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form', () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation error for empty fields', async () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      const errorAlert = screen.getByTestId('form-error');
      expect(errorAlert.textContent).toMatch(/Email and password are required/);
    });
  });

  it('shows success message and redirects after successful login', async () => {
    (api.post as any).mockResolvedValue({ data: { access_token: 'mocktoken' } });
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'longenoughpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/login successful/i)).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('jwt')).toBe('mocktoken'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('shows error message on API failure', async () => {
    (api.post as any).mockRejectedValue({ response: { data: { detail: 'Invalid credentials' } } });
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'longenoughpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
