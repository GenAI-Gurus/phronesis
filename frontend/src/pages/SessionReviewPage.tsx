import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { getSessionSummary, getSessionMessages } from '../api/decisionChat';

const SessionReviewPage: React.FC = () => {
  const { decisionId, sessionId } = useParams<{ decisionId: string; sessionId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!sessionId) return;
      setLoading(true);
      try {
        const sum = await getSessionSummary(sessionId);
        setSummary(sum);
        const msgs = await getSessionMessages(sessionId);
        setMessages(msgs);
      } catch (e: any) {
        setError('Failed to load session review');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [sessionId]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Box p={2}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box maxWidth={800} mx="auto" mt={4} p={2}>
      <Typography variant="h4" gutterBottom>Session Review</Typography>
      <Typography variant="subtitle1" gutterBottom>Summary:</Typography>
      <Typography paragraph>{summary}</Typography>
      <Typography variant="subtitle1" gutterBottom>Messages:</Typography>
      <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
        {messages.map(m => (
          <li key={m.id}>
            <Typography><b>{m.sender === 'user' ? 'You' : 'AI'}</b>: {m.content}</Typography>
          </li>
        ))}
      </Box>
      <Button variant="contained" onClick={() => navigate(`/decisions/${decisionId}/chat`)}>Back to Chat</Button>
    </Box>
  );
};

export default SessionReviewPage;
