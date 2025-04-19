import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import JournalListPage from '../../src/pages/JournalListPage';

beforeEach(() => {
  window.fetch = vi.fn();
});
afterEach(() => {
  vi.resetAllMocks();
});

describe('JournalListPage', () => {
  it('renders a list of journal entries', async () => {
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          id: '1',
          title: 'Entry 1',
          created_at: '2025-04-19T08:00:00Z',
          domain_tags: ['career'],
          sentiment_tag: 'positive',
        },
        {
          id: '2',
          title: 'Entry 2',
          created_at: '2025-04-18T10:00:00Z',
          domain_tags: ['health'],
          sentiment_tag: 'neutral',
        },
      ]),
    });
    render(
      <MemoryRouter>
        <JournalListPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/entry 1/i)).toBeInTheDocument();
      expect(screen.getByText(/entry 2/i)).toBeInTheDocument();
      expect(screen.getByText(/career/i)).toBeInTheDocument();
      expect(screen.getByText(/health/i)).toBeInTheDocument();
      expect(screen.getByText(/positive/i)).toBeInTheDocument();
      expect(screen.getByText(/neutral/i)).toBeInTheDocument();
    });
  });

  it('shows empty state if no entries', async () => {
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ([]),
    });
    render(
      <MemoryRouter>
        <JournalListPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/no journal entries found/i)).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'API error' }),
    });
    render(
      <MemoryRouter>
        <JournalListPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});
