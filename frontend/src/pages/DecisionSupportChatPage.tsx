import React, { useState, useRef } from 'react';
import axios from 'axios';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  Avatar,
} from "@chatscope/chat-ui-kit-react";


interface Message {
  role: 'user' | 'ai';
  content: string;
}

const API_URL = '/api/decision-support/chat';

const DecisionSupportChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatRef = useRef<any>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(API_URL, {
        messages: [...messages, { role: 'user', content }],
      });
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: response.data.reply },
      ]);
      setSuggestions(response.data.suggestions || []);
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollToBottom();
      }, 50);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to get AI response.');
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
      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={loading ? <TypingIndicator content="AI is thinking..." /> : undefined}
            ref={chatRef}
          >
            {messages.length === 0 && (
              <Message model={{
                message: "Start the conversation by describing your decision or dilemma.",
                sentTime: "just now",
                sender: "AI"
              }} />
            )}
            {messages.map((msg, idx) => (
              <Message
                key={idx}
                model={{
                  message: msg.content,
                  sentTime: "just now",
                  sender: msg.role === 'user' ? 'You' : 'AI',
                  direction: msg.role === 'user' ? 'outgoing' : 'incoming',
                }}
                avatarPosition={msg.role === 'user' ? 'tr' : 'tl'}
                avatar={msg.role === 'user' ? <Avatar name="You" /> : <Avatar name="AI" />}
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
