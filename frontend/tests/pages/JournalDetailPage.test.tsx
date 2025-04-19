import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JournalDetailPage from '../../src/pages/JournalDetailPage';

beforeEach(() => {
  window.fetch = vi.fn();
});
afterEach(() => {
  vi.resetAllMocks();
});

describe('JournalDetailPage', () => {
  it('renders entry details and AI tags', async () => {
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '1',
        title: 'Entry 1',
        created_at: '2025-04-19T08:00:00Z',
        context: 'Test context',
        anticipated_outcomes: 'Test outcome',
        values: ['integrity', 'growth'],
        domain_tags: ['career'],
        sentiment_tag: 'positive',
        keywords: ['promotion', 'boss', 'work'],
      }),
    });
    render(
      <MemoryRouter initialEntries={["/journal/1"]}>
        <Routes>
          <Route path="/journal/:id" element={<JournalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/entry 1/i)).toBeInTheDocument();
      expect(screen.getByText(/test context/i)).toBeInTheDocument();
      expect(screen.getByText(/test outcome/i)).toBeInTheDocument();
      expect(screen.getByText(/integrity/i)).toBeInTheDocument();
      expect(screen.getByText(/growth/i)).toBeInTheDocument();
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
    render(
      <MemoryRouter initialEntries={["/journal/1"]}>
        <Routes>
          <Route path="/journal/:id" element={<JournalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});
