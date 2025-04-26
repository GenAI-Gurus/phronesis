import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DecisionRecapPage from '../../src/pages/DecisionRecapPage';
import { listSessions, getSessionSummary, getDecisionSummary } from '../../src/api/decisionChat';

vi.mock('../../src/api/decisionChat');

describe('DecisionRecapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    vi.mocked(getDecisionSummary).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={["/decisions/d1/summary"]}>
        <Routes>
          <Route path="/decisions/:decisionId/summary" element={<DecisionRecapPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders decision summary and session list on success', async () => {
    vi.mocked(getDecisionSummary).mockResolvedValue('Overall summary');
    vi.mocked(listSessions).mockResolvedValue([{ id: 's1', decision_id: 'd1', started_at: '2025-04-25T00:00:00Z', status: 'completed' }]);
    vi.mocked(getSessionSummary).mockResolvedValue('Session one summary');
    render(
      <MemoryRouter initialEntries={["/decisions/d1/summary"]}>
        <Routes>
          <Route path="/decisions/:decisionId/summary" element={<DecisionRecapPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('Decision Recap')).toBeInTheDocument();
    expect(screen.getByText('Overall summary')).toBeInTheDocument();
    expect(screen.getByText('Session 1 Summary')).toBeInTheDocument();
    expect(screen.getByText('Session one summary')).toBeInTheDocument();
  });

  it('shows error message on fetch failure', async () => {
    vi.mocked(getDecisionSummary).mockRejectedValue(new Error('fail'));
    render(
      <MemoryRouter initialEntries={["/decisions/d1/summary"]}>
        <Routes>
          <Route path="/decisions/:decisionId/summary" element={<DecisionRecapPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('Failed to load decision recap')).toBeInTheDocument();
  });
});
