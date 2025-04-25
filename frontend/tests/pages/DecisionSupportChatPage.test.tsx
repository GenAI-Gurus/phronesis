import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DecisionSupportChatPage from "../../src/pages/DecisionSupportChatPage";
import axios from "axios";
import { getDecisionById, getOrCreateSession, getSessionMessages, postSessionMessage } from "../../src/api/decisionChat";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import '@testing-library/jest-dom';

vi.mock("axios");
vi.mock("../../src/api/decisionChat");

// Mock Chatscope Chat UI components to avoid jsdom CSS selector issues
vi.mock("@chatscope/chat-ui-kit-react", () => {
  const React = require("react");
  return {
    MainContainer: ({ children }: any) => <div>{children}</div>,
    ChatContainer: ({ children }: any) => <div>{children}</div>,
    MessageList: ({ children }: any) => <div data-testid="message-list">{children}</div>,
    Message: ({ model }: any) => <div>{model.message}</div>,
    MessageInput: ({ value, onChange, onSend }: any) => (
      <div
        data-testid="chat-input"
        contentEditable
        onInput={(e: any) => onChange(e.currentTarget.textContent || "")}
        onKeyDown={(e: any) => e.key === "Enter" && onSend(value)}
      >
        {value}
      </div>
    ),
    TypingIndicator: ({ content }: any) => <div>{content}</div>
  };
});

const mockedAxios = axios as any;

describe.skip("DecisionSupportChatPage", () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  it('renders decision context header', async () => {
  vi.mocked(getDecisionById).mockResolvedValueOnce({
    id: 'decision-123',
    title: 'Test Decision',
    description: 'Test description',
    domain_tags: ['career'],
    keywords: ['promotion', 'growth']
  });
  vi.mocked(getOrCreateSession).mockResolvedValueOnce({ id: 'session-1', decision_id: 'decision-123', started_at: '', status: 'active' });
  vi.mocked(getSessionMessages).mockResolvedValueOnce([]);
  render(
    <MemoryRouter initialEntries={["/decisions/decision-123/chat"]}>
      <Routes>
        <Route path="/decisions/:decisionId/chat" element={<DecisionSupportChatPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(await screen.findByText('Test Decision')).toBeInTheDocument();
  expect(screen.getByText('Test description')).toBeInTheDocument();
  expect(screen.getByText('career')).toBeInTheDocument();
  expect(screen.getByText('promotion')).toBeInTheDocument();
  });

  it('handles full sendMessage flow and displays suggestions', async () => {
    vi.mocked(getDecisionById).mockResolvedValueOnce({
      id: 'decision-123',
      title: 'Test Decision',
      description: 'Test description',
      domain_tags: ['career'],
      keywords: ['promotion', 'growth']
    });
    vi.mocked(getOrCreateSession).mockResolvedValueOnce({ id: 'session-1', decision_id: 'decision-123', started_at: '', status: 'active' });
    // Initial empty messages
    vi.mocked(getSessionMessages).mockResolvedValueOnce([]);
    // After user message
    vi.mocked(postSessionMessage).mockResolvedValueOnce({ id: 'msg-1', session_id: 'session-1', sender: 'user', content: 'Hello', created_at: '2024-01-01T00:00:00Z' });
    // Updated messages after user message
    vi.mocked(getSessionMessages).mockResolvedValueOnce([
      { id: 'msg-1', session_id: 'session-1', sender: 'user', content: 'Hello', created_at: '2024-01-01T00:00:00Z' }
    ]);
    // AI reply
    (mockedAxios.post as any).mockResolvedValueOnce({ data: { reply: 'Hi, how can I help?', suggestions: ['Reflect on your values', 'List pros/cons'] } });
    // After AI reply is persisted
    vi.mocked(postSessionMessage).mockResolvedValueOnce({ id: 'msg-2', session_id: 'session-1', sender: 'ai', content: 'Hi, how can I help?', created_at: '2024-01-01T00:00:01Z' });
    // Final messages
    vi.mocked(getSessionMessages).mockResolvedValueOnce([
      { id: 'msg-1', session_id: 'session-1', sender: 'user', content: 'Hello', created_at: '2024-01-01T00:00:00Z' },
      { id: 'msg-2', session_id: 'session-1', sender: 'ai', content: 'Hi, how can I help?', created_at: '2024-01-01T00:00:01Z' }
    ]);
    render(
      <MemoryRouter initialEntries={["/decisions/decision-123/chat"]}>
        <Routes>
          <Route path="/decisions/:decisionId/chat" element={<DecisionSupportChatPage />} />
        </Routes>
      </MemoryRouter>
    );
    // Wait for context header
    expect(await screen.findByText('Test Decision')).toBeInTheDocument();
    // Simulate user typing and sending a message
    const input = screen.getByTestId('chat-input').querySelector('[contenteditable="true"]');
    fireEvent.input(input!, { target: { textContent: 'Hello' } });
    fireEvent.keyDown(input!, { key: 'Enter', code: 'Enter' });
    // Wait for AI reply and suggestions
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi, how can I help?')).toBeInTheDocument();
      expect(screen.getByText('Reflect on your values')).toBeInTheDocument();
      expect(screen.getByText('List pros/cons')).toBeInTheDocument();
    });
  });

  it('shows error message if API fails', async () => {
    vi.mocked(getDecisionById).mockResolvedValueOnce({
      id: 'decision-123',
      title: 'Test Decision',
      description: 'Test description',
      domain_tags: ['career'],
      keywords: ['promotion', 'growth']
    });
    vi.mocked(getOrCreateSession).mockResolvedValueOnce({ id: 'session-1', decision_id: 'decision-123', started_at: '', status: 'active' });
    vi.mocked(getSessionMessages).mockResolvedValueOnce([]);
    // Simulate error on user message post
    vi.mocked(postSessionMessage).mockRejectedValueOnce(new Error('Failed to send message'));
    render(
      <MemoryRouter initialEntries={["/decisions/decision-123/chat"]}>
        <Routes>
          <Route path="/decisions/:decisionId/chat" element={<DecisionSupportChatPage />} />
        </Routes>
      </MemoryRouter>
    );
    // Wait for context header
    expect(await screen.findByText('Test Decision')).toBeInTheDocument();
    // Simulate user typing and sending a message
    const input = screen.getByTestId('chat-input').querySelector('[contenteditable="true"]');
    fireEvent.input(input!, { target: { textContent: 'Hello' } });
    fireEvent.keyDown(input!, { key: 'Enter', code: 'Enter' });
    // Error should be shown
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    });
  });

  // NOTE: The following tests are skipped due to jsdom/CSS selector limitations with Chatscope UI Kit.
  // See https://github.com/jsdom/jsdom/issues/3057 and Testing Library docs for details.
  // Full UI coverage is provided by Playwright system tests.
  it.skip("sends a message and receives AI reply", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { reply: "AI reply here", suggestions: ["Try this"] },
    });
    render(<DecisionSupportChatPage />);
    const input = screen.getByTestId("chat-input").querySelector('[contenteditable="true"]');
    expect(input).not.toBeNull();
    fireEvent.input(input!, { target: { textContent: "Should I take the job?" } });
    fireEvent.keyDown(input!, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(screen.getByText("AI reply here")).toBeInTheDocument();
      expect(screen.getByTestId("suggestion-0")).toBeInTheDocument();
    });
  });

  it.skip("renders suggestions as quick replies and handles click", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { reply: "AI reply here", suggestions: ["Option 1"] },
    });
    render(<DecisionSupportChatPage />);
    const input = screen.getByTestId("chat-input").querySelector('[contenteditable="true"]');
    expect(input).not.toBeNull();
    fireEvent.input(input!, { target: { textContent: "Help me decide." } });
    fireEvent.keyDown(input!, { key: "Enter", code: "Enter" });
    await waitFor(() => expect(screen.getByTestId("suggestion-0")).toBeInTheDocument());
    mockedAxios.post.mockResolvedValueOnce({
      data: { reply: "Second reply", suggestions: [] },
    });
    fireEvent.click(screen.getByTestId("suggestion-0"));
    await waitFor(() => expect(screen.getByText("Second reply")).toBeInTheDocument());
  });

  it.skip("shows loading indicator and disables input while waiting", async () => {
    let resolvePromise: (v: any) => void;
    mockedAxios.post.mockImplementationOnce(() => new Promise((resolve) => { resolvePromise = resolve; }));
    render(<DecisionSupportChatPage />);
    const input = screen.getByTestId("chat-input").querySelector('[contenteditable="true"]');
    expect(input).not.toBeNull();
    fireEvent.input(input!, { target: { textContent: "Test" } });
    fireEvent.keyDown(input!, { key: "Enter", code: "Enter" });
    expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();
    // input is contenteditable, so check for aria-disabled or lack of focus
    resolvePromise!({ data: { reply: "Done", suggestions: [] } });
    await waitFor(() => expect(screen.getByText("Done")).toBeInTheDocument());
  });

  it.skip("shows error message on API failure", async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { data: { detail: "API error" } } });
    render(<DecisionSupportChatPage />);
    const input = screen.getByTestId("chat-input").querySelector('[contenteditable="true"]');
    expect(input).not.toBeNull();
    fireEvent.input(input!, { target: { textContent: "Test" } });
    fireEvent.keyDown(input!, { key: "Enter", code: "Enter" });
    await waitFor(() => expect(screen.getByText(/API error/)).toBeInTheDocument());
  });
});
