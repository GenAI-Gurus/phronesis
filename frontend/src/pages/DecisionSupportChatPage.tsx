import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message as ChatUIMessage,
  MessageInput,
  TypingIndicator,
  Avatar,
} from "@chatscope/chat-ui-kit-react";

import { getOrCreateSession, getSessionMessages, postSessionMessage, endSession, Session, Message as ChatMessage } from '../api/decisionChat';
import { useParams } from 'react-router-dom';

const DecisionSupportChatPage: React.FC = () => {
  // Accept decisionId from route params (or as a prop if you prefer)
  const { decisionId } = useParams<{ decisionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    async function initSessionAndMessages() {
      setLoading(true);
      setError(null);
      try {
        if (!decisionId) return;
        const sess = await getOrCreateSession(decisionId);
        setSession(sess);
        const msgs = await getSessionMessages(sess.id);
        setMessages(msgs);
      } catch (e: any) {
        setError('Failed to load chat session or messages.');
      } finally {
        setLoading(false);
      }
    }
    initSessionAndMessages();
  }, [decisionId]);

  async function handleEndSession() {
    if (!session) return;
    setSending(true);
    try {
      const updated = await endSession(session.id);
      setSession(updated);
    } catch {
      setError('Failed to end session.');
    } finally {
      setSending(false);
    }
  }

  async function handleStartNewSession() {
    setLoading(true);
    try {
      if (!decisionId) return;
      const newSession = await getOrCreateSession(decisionId);
      setSession(newSession);
      const msgs = await getSessionMessages(newSession.id);
      setMessages(msgs);
    } catch {
      setError('Failed to start new session.');
    } finally {
      setLoading(false);
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session) return;
    setSending(true);
    setError(null);
    setInput('');
    try {
      // 1. Persist user message to backend
      const userMsg = await postSessionMessage(session.id, { sender: 'user', content });
      setMessages((prev) => [...prev, userMsg]);
      // 2. Call AI chat endpoint
      const response = await axios.post('/api/decision-support/chat', {
        messages: [...messages, { sender: 'user', content }],
      });
      const aiReply = response.data.reply;
      // 3. Persist AI reply to backend
      const aiMsg = await postSessionMessage(session.id, { sender: 'ai', content: aiReply });
      setMessages((prev) => [...prev, aiMsg]);
      // 4. Handle suggestions
      setSuggestions(response.data.suggestions || []);
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollToBottom();
      }, 50);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to send message or get AI reply.');
    } finally {
      setSending(false);
    }
  };

  const handleSend = (val: string) => {
    if (val.trim() && !loading) {
      sendMessage(val);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={loading ? <TypingIndicator content="AI is thinking..." /> : undefined}
            ref={chatRef}
          >
            {messages.length === 0 && (
              <ChatUIMessage model={{
                message: "Start the conversation by describing your decision or dilemma.",
                sentTime: "just now",
                sender: "AI",
                direction: "incoming",
              }} />
            )}
            {messages.map((msg, idx) => (
              <ChatUIMessage
                key={idx}
                model={{
                  message: msg.content,
                  sentTime: msg.created_at || "just now",
                  sender: msg.sender === 'user' ? 'You' : 'AI',
                  direction: msg.sender === 'user' ? 'outgoing' : 'incoming',
                }}
              />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type your message..."
            value={input}
            onChange={setInput}
            onSend={handleSend}
            attachButton={false}
            disabled={loading}
            data-testid="chat-input"
          />
          {error && (
            <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
          )}
          {suggestions.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid #aaa', cursor: 'pointer', background: '#f5f5f5' }}
                  onClick={() => handleSend(s)}
                  disabled={loading}
                  data-testid={`suggestion-${i}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default DecisionSupportChatPage;
