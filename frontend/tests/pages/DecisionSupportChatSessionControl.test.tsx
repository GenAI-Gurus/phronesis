import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DecisionSupportChatPage from '../../src/pages/DecisionSupportChatPage';
import {
  getDecisionById,
  getOrCreateSession,
  getSessionMessages,
  endSession,
  getSessionSummary
} from '../../src/api/decisionChat';

vi.mock('../../src/api/decisionChat');
vi.mock('@chatscope/chat-ui-kit-react', () => {
  const React = require('react');
  return {
    MainContainer: ({ children }: any) => <div>{children}</div>,
    ChatContainer: ({ children }: any) => <div>{children}</div>,
    MessageList: ({ children }: any) => <div data-testid="message-list">{children}</div>,
    Message: ({ model }: any) => <div>{model.message}</div>,
    MessageInput: ({ value, onChange, onSend, disabled }: any) => (
      <input
        data-testid="chat-input"
        value={value}
        onChange={e => onChange(e.currentTarget.value)}
        onKeyDown={e => e.key === 'Enter' && onSend(value)}
        disabled={disabled}
      />
    ),
    TypingIndicator: () => <div />
  };
});

describe('DecisionSupportChatPage Session Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDecisionById).mockResolvedValue({ id: 'd1', title: 'D', description: 'desc', domain_tags: [], keywords: [] });
    vi.mocked(getOrCreateSession).mockResolvedValue({ id: 's1', decision_id: 'd1', started_at: '2025-01-01T00:00:00Z', status: 'active' });
    vi.mocked(getSessionMessages).mockResolvedValue([]);
  });

  it('shows End Session button when active', async () => {
    render(
      <MemoryRouter initialEntries={["/decisions/d1/chat"]}>
        <Routes>
          <Route path="/decisions/:decisionId/chat" element={<DecisionSupportChatPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByTestId('end-session-btn')).toBeInTheDocument();
  });

  it('ends session on click and shows summary', async () => {
    vi.mocked(endSession).mockResolvedValue({ id: 's1', decision_id: 'd1', started_at: '', status: 'completed' });
    vi.mocked(getSessionSummary).mockResolvedValue('Ended summary');
    render(
      <MemoryRouter initialEntries={["/decisions/d1/chat"]}>
        <Routes>
          <Route path="/decisions/:decisionId/chat" element={<DecisionSupportChatPage />} />
        </Routes>
      </MemoryRouter>
    );
    const btn = await screen.findByTestId('end-session-btn');
    userEvent.click(btn);
    await waitFor(() => expect(getSessionSummary).toHaveBeenCalledWith('s1'));
    expect(screen.getByText('Ended summary')).toBeInTheDocument();
    // input disabled
    expect(screen.getByTestId('chat-input')).toBeDisabled();
  });
});
