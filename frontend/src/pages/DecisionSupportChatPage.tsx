import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

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
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

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
      setTimeout(scrollToBottom, 50);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to get AI response.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      sendMessage(input);
    }
  };

  const handleSuggestionClick = (text: string) => {
    if (!loading) {
      sendMessage(text);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Paper elevation={3} sx={{ p: 3, minHeight: 500, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" mb={2}>Decision Support Chat</Typography>
        <Box
          ref={chatRef}
          sx={{ flex: 1, overflowY: 'auto', mb: 2, maxHeight: 350, border: '1px solid #eee', borderRadius: 1, p: 2 }}
          data-testid="chat-history"
        >
          {messages.length === 0 && (
            <Typography color="text.secondary">Start the conversation by describing your decision or dilemma.</Typography>
          )}
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 2,
                textAlign: msg.role === 'user' ? 'right' : 'left',
              }}
            >
              <Paper
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 1,
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                  color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                {msg.content}
              </Paper>
            </Box>
          ))}
          {loading && (
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="caption" ml={1}>AI is thinking...</Typography>
            </Box>
          )}
        </Box>
        {error && <Typography color="error" mb={1} data-testid="chat-error">{error}</Typography>}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            disabled={loading}
            data-testid="chat-input"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            disabled={!input.trim() || loading}
            data-testid="send-btn"
          >
            Send
          </Button>
        </form>
        {suggestions.length > 0 && (
          <Stack direction="row" spacing={1} mt={2}>
            {suggestions.map((s, i) => (
              <Chip
                key={i}
                label={s}
                onClick={() => handleSuggestionClick(s)}
                color="secondary"
                variant="outlined"
                disabled={loading}
                data-testid={`suggestion-${i}`}
              />
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default DecisionSupportChatPage;
