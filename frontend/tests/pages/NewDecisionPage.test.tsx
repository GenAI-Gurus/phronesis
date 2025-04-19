import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import NewDecisionPage from '../../src/pages/NewDecisionPage';

// Mock fetch for API calls
beforeEach(() => {
  window.fetch = vi.fn();
});
afterEach(() => {
  vi.resetAllMocks();
});

describe('NewDecisionPage', () => {
  it('renders the form and submits successfully, displaying auto-tags', async () => {
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        title: 'Test Title',
        domain_tags: ['career'],
        sentiment_tag: 'positive',
        keywords: ['promotion', 'boss', 'work'],
      }),
    });
    render(<NewDecisionPage />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/context/i), { target: { value: 'Test context' } });
    fireEvent.change(screen.getByLabelText(/anticipated outcomes/i), { target: { value: 'Outcome' } });
    fireEvent.change(screen.getByLabelText(/values/i), { target: { value: 'integrity' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/ai-generated tags/i)).toBeInTheDocument();
      expect(screen.getByText(/career/i)).toBeInTheDocument();
      expect(screen.getByText(/positive/i)).toBeInTheDocument();
      expect(screen.getByText(/promotion/i)).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'API error' }),
    });
    render(<NewDecisionPage />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/context/i), { target: { value: 'Test context' } });
    fireEvent.change(screen.getByLabelText(/anticipated outcomes/i), { target: { value: 'Outcome' } });
    fireEvent.change(screen.getByLabelText(/values/i), { target: { value: 'integrity' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});
