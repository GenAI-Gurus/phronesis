import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DecisionSupportChatPage from '../../src/pages/DecisionSupportChatPage';
import {
  getDecisionById,
  getOrCreateSession,
  getSessionMessages,
  listSessions,
  getSessionSummary,
  getDecisionSummary,
} from '../../src/api/decisionChat';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

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

describe('DecisionSupportChatPage Rich Text & System Note Support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDecisionById).mockResolvedValue({ id: 'd1', title: 'Test', description: 'Desc' });
    vi.mocked(getOrCreateSession).mockResolvedValue({ id: 's1', decision_id: 'd1', started_at: '2025-01-01T00:00:00Z', status: 'active' });
    vi.mocked(listSessions).mockResolvedValue([]);
    vi.mocked(getSessionSummary).mockResolvedValue('');
    vi.mocked(getDecisionSummary).mockResolvedValue('');
  });

  it('renders markdown in user messages', async () => {
    vi.mocked(getSessionMessages).mockResolvedValue([{ id: 'm1', session_id: 's1', sender: 'user', content: '**bold** text' }]);
    render(
      <MemoryRouter initialEntries={["/decisions/d1/chat"]}>
        <Routes>
          <Route path="/decisions/:decisionId/chat" element={<DecisionSupportChatPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('bold')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
    const container = screen.getByText('bold').parentElement;
    expect(container?.innerHTML).toContain('<strong>bold</strong>');
  });

  it('renders system notes correctly', async () => {
    vi.mocked(getSessionMessages).mockResolvedValue([{ id: 'm2', session_id: 's1', sender: 'system', content: '_note_' }]);
    render(
      <MemoryRouter initialEntries={["/decisions/d1/chat"]}>
        <Routes>
          <Route path="/decisions/:decisionId/chat" element={<DecisionSupportChatPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('note')).toBeInTheDocument();
  });
});
