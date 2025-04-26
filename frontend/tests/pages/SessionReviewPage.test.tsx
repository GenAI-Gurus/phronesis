import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SessionReviewPage from '../../src/pages/SessionReviewPage';
import { getSessionSummary, getSessionMessages } from '../../src/api/decisionChat';

vi.mock('../../src/api/decisionChat');

describe('SessionReviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading initially', () => {
    vi.mocked(getSessionSummary).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={["/decisions/d1/sessions/s1/review"]}>
        <Routes>
          <Route path="/decisions/:decisionId/sessions/:sessionId/review" element={<SessionReviewPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders summary and messages on success', async () => {
    vi.mocked(getSessionSummary).mockResolvedValue('Test summary');
    vi.mocked(getSessionMessages).mockResolvedValueOnce([
      { id: 'm1', sender: 'user', content: 'Hello' },
      { id: 'm2', sender: 'ai', content: 'World' }
    ]);
    render(
      <MemoryRouter initialEntries={["/decisions/d1/sessions/s1/review"]}>
        <Routes>
          <Route path="/decisions/:decisionId/sessions/:sessionId/review" element={<SessionReviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Session Review')).toBeInTheDocument();
    expect(screen.getByText('Test summary')).toBeInTheDocument();
    expect(screen.getByText(/You/)).toBeInTheDocument();
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/AI/)).toBeInTheDocument();
    expect(screen.getByText(/World/)).toBeInTheDocument();
    expect(screen.getByText('Back to Chat')).toBeInTheDocument();
  });

  it('shows error message on failure', async () => {
    vi.mocked(getSessionSummary).mockRejectedValue(new Error('fail'));
    vi.mocked(getSessionMessages).mockResolvedValue([]);
    render(
      <MemoryRouter initialEntries={["/decisions/d1/sessions/s1/review"]}>
        <Routes>
          <Route path="/decisions/:decisionId/sessions/:sessionId/review" element={<SessionReviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Failed to load session review')).toBeInTheDocument();
  });
});
