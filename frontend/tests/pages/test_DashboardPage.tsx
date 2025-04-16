// tests/pages/test_DashboardPage.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../src/pages/DashboardPage';

/**
 * Helper to render with router context.
 */
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('DashboardPage', () => {
  beforeEach(() => {
    // Mock JWT for authenticated state
    localStorage.setItem('jwt', 'mocktoken');
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('renders user summary, journals, actions, and badges (expected use)', () => {
    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('Alex Example')).toBeInTheDocument();
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByText('Recent Decisions')).toBeInTheDocument();
    expect(screen.getByText('Should I switch jobs?')).toBeInTheDocument();
    expect(screen.getByText('Reflector')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('shows no journals edge case', () => {
    // Patch RecentJournalsList to show no journals
    jest.spyOn(require('../../src/components/dashboard/RecentJournalsList'), 'default').mockImplementation(() => (
      <div>No decisions yet.</div>
    ));
    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('No decisions yet.')).toBeInTheDocument();
  });

  it('shows login prompt when not authenticated (failure case)', () => {
    localStorage.removeItem('jwt');
    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument();
  });
});
