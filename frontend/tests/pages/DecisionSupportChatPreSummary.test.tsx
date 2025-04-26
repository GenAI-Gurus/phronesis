import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DecisionSupportChatPage from '../../src/pages/DecisionSupportChatPage';
import {
  getDecisionById,
  getOrCreateSession,
  getSessionMessages,
  listSessions,
  getSessionSummary,
  getDecisionSummary
} from '../../src/api/decisionChat';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Stub axios for chat HTTP
vi.mock('axios');
// Mock API layer functions
vi.mock('../../src/api/decisionChat');

// Mock Chatscope components
vi.mock('@chatscope/chat-ui-kit-react', () => {
  const React = require('react');
  return {
    MainContainer: ({ children }: any) => <div>{children}</div>,
    ChatContainer: ({ children }: any) => <div>{children}</div>,
    MessageList: ({ children }: any) => <div data-testid="message-list">{children}</div>,
    Message: ({ model }: any) => <div>{model.message}</div>,
    TypingIndicator: () => <div />,  
    MessageInput: ({ value, onChange, onSend, disabled }: any) => (
      <input
        data-testid="chat-input"
        value={value}
        onChange={(e: any) => onChange(e.currentTarget.value)}
        onKeyDown={(e: any) => e.key === 'Enter' && onSend(value)}
        disabled={disabled}
      />
    ),
  };
});

describe('DecisionSupportChatPage Pre-Chat Summaries', () => {
  beforeEach(() => {
    // Base decision and session
    vi.mocked(getDecisionById).mockResolvedValue({ id: 'd1', title: 'Test Decision', description: 'Test Desc', domain_tags: ['tag'], keywords: ['kw'] });
    vi.mocked(getOrCreateSession).mockResolvedValue({ id: 's2', decision_id: 'd1', started_at: '2025-04-26T09:00:00Z', status: 'active' });
    // Two sessions: one completed yesterday, one today
    vi.mocked(listSessions).mockResolvedValue([
      { id: 's1', decision_id: 'd1', started_at: '2025-04-25T09:00:00Z', status: 'completed' },
      { id: 's2', decision_id: 'd1', started_at: '2025-04-26T09:00:00Z', status: 'active' }
    ]);
    vi.mocked(getSessionSummary).mockResolvedValue('Previous session summary');
    vi.mocked(getDecisionSummary).mockResolvedValue('Overall decision summary');
    // No messages in current session
    vi.mocked(getSessionMessages).mockResolvedValue([]);
  });

  it('renders previous session and decision summaries before chat', async () => {
    render(
      <MemoryRouter initialEntries={["/decisions/d1/chat"]}>
        <Routes>
          <Route path="/decisions/:decisionId/chat" element={<DecisionSupportChatPage />} />
        </Routes>
      </MemoryRouter>
    );
    // Await for previous summaries
    expect(await screen.findByText('Previous Sessions:')).toBeInTheDocument();
    expect(screen.getByText('Session 1:')).toBeInTheDocument();
    expect(screen.getByText('Previous session summary')).toBeInTheDocument();
    expect(screen.getByText('Decision Summary:')).toBeInTheDocument();
    expect(screen.getByText('Overall decision summary')).toBeInTheDocument();
  });
});
