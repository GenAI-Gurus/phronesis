import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DecisionSupportChatPage from '../../../src/pages/DecisionSupportChatPage';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(async (_url, { messages }) => {
    const last = messages[messages.length - 1];
    return {
      data: {
        reply: `AI: I see you said '${last.content}'. How can I help you think this through?`,
        suggestions: ["Clarify your goals", "Consider possible outcomes"]
      }
    };
  }),
}));

describe('DecisionSupportChatPage', () => {
  it('renders input and send button', () => {
    render(<DecisionSupportChatPage />);
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-btn')).toBeInTheDocument();
  });

  it('sends a message and receives AI reply', async () => {
    render(<DecisionSupportChatPage />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Should I take the job?' } });
    fireEvent.click(screen.getByTestId('send-btn'));
    await waitFor(() => {
      expect(screen.getByText(/AI: I see you said/)).toBeInTheDocument();
    });
  });

  it('shows suggestions as chips', async () => {
    render(<DecisionSupportChatPage />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Help me decide.' } });
    fireEvent.click(screen.getByTestId('send-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('suggestion-0')).toBeInTheDocument();
    });
  });

  it('handles empty input', () => {
    render(<DecisionSupportChatPage />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(screen.queryByText(/AI:/)).not.toBeInTheDocument();
  });
});
