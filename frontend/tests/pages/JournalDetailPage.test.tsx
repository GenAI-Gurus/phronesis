import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JournalDetailPage from '../../src/pages/JournalDetailPage';
import api from '../../src/api/client';

beforeEach(() => {
  vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
    if (key === 'jwt') return 'FAKE_TOKEN';
    return null;
  });

});
afterEach(() => {
  vi.resetAllMocks();
});

describe('JournalDetailPage', () => {
  it('renders entry details and AI tags', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        id: '1',
        title: 'Entry 1',
        created_at: '2025-04-19T08:00:00Z',
        context: 'Test context',
        anticipated_outcomes: 'Test outcome',
        values: ['integrity', 'growth'],
        domain_tags: ['career'],
        sentiment_tag: 'positive',
        keywords: ['promotion', 'boss', 'work'],
      }
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
    vi.spyOn(api, 'get').mockRejectedValue(new Error('Network Error'));
    render(
      <MemoryRouter initialEntries={["/journal/1"]}>
        <Routes>
          <Route path="/journal/:id" element={<JournalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
