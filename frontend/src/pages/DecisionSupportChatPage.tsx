import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
// import axios from 'axios'; // removed, using chatSession helper
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message as ChatUIMessage,
  TypingIndicator,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";

import { 
  getOrCreateSession, 
  getSessionMessages, 
  postSessionMessage, 
  endSession, 
  getDecisionById, 
  Session, 
  listSessions, 
  getSessionSummary, 
  getDecisionSummary,
  chatSession // <--- added import
} from '../api/decisionChat';
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
  const [prevSummary, setPrevSummary] = useState<any[]>([]);
  const [decisionSummary, setDecisionSummary] = useState<any>(null);
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
        // Fetch all sessions
        const allSessions = await listSessions(decisionId);
        const prevSessions = allSessions.filter(s => s.id !== sess.id && s.status === 'completed');
        if (prevSessions.length > 0) {
          // Populate summaries
          const summaries = await Promise.all(prevSessions.map(s => getSessionSummary(s.id)));
          setPrevSummary(summaries);
          const decisionSum = await getDecisionSummary(decisionId);
          setDecisionSummary(decisionSum);
        }
        // Fetch messages
        const msgs = await getSessionMessages(sess.id);
        if (msgs.length === 0) {
          // Initial AI greeting
          const { reply: aiReply, suggestions: aiSuggestions } = await chatSession(
            sess.id,
            []
          );
          // Persist AI message
          await postSessionMessage(sess.id, { sender: 'ai', content: aiReply });
          // Re-fetch messages
          const updatedMsgs = await getSessionMessages(sess.id);
          setMessages(updatedMsgs);
          setSuggestions(aiSuggestions || []);
        } else {
          setMessages(msgs);
        }
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
      const { reply: aiReply, suggestions: aiSuggestions } = await chatSession(
        session.id,
        updatedMessages.map(m => ({ role: m.sender, content: m.content }))
      );
      // 4. Persist AI reply to backend
      const aiMsg = await postSessionMessage(session.id, { sender: 'ai', content: aiReply });
      // 5. Fetch all messages again (for audit/replay correctness)
      const finalMessages = await getSessionMessages(session.id);
      setMessages(finalMessages);
      // 6. Handle suggestions
      setSuggestions(aiSuggestions || []);
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollToBottom();
      }, 50);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to send message or get AI reply.');
    }
  };

  // Handle manual session end
  const handleEndClick = async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const updated = await endSession(session.id);
      setSession(updated);
      const summaryText = await getSessionSummary(session.id);
      setPrevSummary(prev => [...prev, summaryText]);
    } catch (err: any) {
      setError('Failed to end session.');
    } finally {
      setLoading(false);
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
      {/* Session header */}
      {session && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <span>Session date: {new Date(session.started_at).toLocaleDateString()}</span>
          <span>Status: {session.status}</span>
          {session.status === 'active' && (
            <button
              onClick={handleEndClick}
              disabled={loading}
              data-testid="end-session-btn"
              style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 4 }}
            >
              End Session
            </button>
          )}
        </div>
      )}
      {/* Previous session summaries */}
      {prevSummary.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4>Previous Sessions:</h4>
          {prevSummary.map((summary, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <b>Session {idx + 1}:</b> {summary}
            </div>
          ))}
        </div>
      )}
      {/* Decision summary */}
      {decisionSummary && (
        <div style={{ marginBottom: 16 }}>
          <h4>Decision Summary:</h4>
          <div>{decisionSummary}</div>
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
                position: 'single'
              }} />
            )}
            {messages.map((msg, idx) => (
              <ChatUIMessage
                key={idx}
                model={{
                  message: (<ReactMarkdown>{msg.content}</ReactMarkdown>) as any,
                  sentTime: msg.created_at || "just now",
                  sender: msg.sender === 'user' ? 'You' : msg.sender === 'system' ? 'System' : 'AI',
                  direction: msg.sender === 'user' ? 'outgoing' : 'incoming',
                  position: 'normal'
                }}
              />
            ))}
          </MessageList>
          {/* Native send controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <MessageInput
              style={{ flex: 1, minWidth: 0 }}
              placeholder="Type your message..."
              value={input}
              onChange={setInput}
              onSend={handleSend}
              attachButton={false}
              disabled={loading || session?.status !== 'active'}
              data-testid="chat-input"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || session?.status !== 'active'}
              data-testid="send-button"
              style={{ padding: '8px 16px', borderRadius: 4, border: 'none', backgroundColor: '#1976d2', color: '#fff', cursor: 'pointer' }}
            >Send</button>
          </div>
        </ChatContainer>
      </MainContainer>
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
    </div>
  );
};

export default DecisionSupportChatPage;
