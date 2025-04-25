import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message as ChatUIMessage,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";

import { getOrCreateSession, getSessionMessages, postSessionMessage, endSession, getDecisionById, Session } from '../api/decisionChat';
import { useParams } from 'react-router-dom';

const DecisionSupportChatPage: React.FC = () => {
  // Accept decisionId from route params (or as a prop if you prefer)
  const { decisionId } = useParams<{ decisionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
        // Fetch decision context
        const dec = await getDecisionById(decisionId);
        setDecision(dec);
        // Fetch or create session and messages
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


  const sendMessage = async (content: string) => {
    if (!content.trim() || !session) return;
    setError(null);
    setInput('');
    try {
      // 1. Persist user message to backend
      const userMsg = await postSessionMessage(session.id, { sender: 'user', content });
      // 2. Fetch latest messages (including the new user message)
      const updatedMessages = await getSessionMessages(session.id);
      setMessages(updatedMessages);
      // 3. Call AI chat endpoint with full message history
      const response = await axios.post('/api/decision-support/chat', {
        messages: updatedMessages.map(m => ({ role: m.sender, content: m.content })),
      });
      const aiReply = response.data.reply;
      // 4. Persist AI reply to backend
      const aiMsg = await postSessionMessage(session.id, { sender: 'ai', content: aiReply });
      // 5. Fetch all messages again (for audit/replay correctness)
      const finalMessages = await getSessionMessages(session.id);
      setMessages(finalMessages);
      // 6. Handle suggestions
      setSuggestions(response.data.suggestions || []);
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollToBottom();
      }, 50);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to send message or get AI reply.');
    }
  };



  const handleSend = (val: string) => {
    if (val.trim() && !loading) {
      sendMessage(val);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      {/* Decision context header */}
      {decision && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{decision.title}</h3>
          <div style={{ color: '#555', marginBottom: 4 }}>{decision.description}</div>
          {decision.domain_tags && decision.domain_tags.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <b>Domain:</b> {decision.domain_tags.map((tag: string) => (
                <span key={tag} style={{ marginRight: 8 }}>{tag}</span>
              ))}
            </div>
          )}
          {decision.keywords && decision.keywords.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <b>Keywords:</b> {decision.keywords.map((kw: string) => (
                <span key={kw} style={{ marginRight: 8 }}>{kw}</span>
              ))}
            </div>
          )}
        </div>
      )}
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
