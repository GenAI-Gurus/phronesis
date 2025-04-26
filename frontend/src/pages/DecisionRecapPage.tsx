import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { listSessions, getSessionSummary, getDecisionSummary } from '../api/decisionChat';

const DecisionRecapPage: React.FC = () => {
  const { decisionId } = useParams<{ decisionId: string }>();
  const navigate = useNavigate();
  const [decisionSummary, setDecisionSummary] = useState<string>('');
  const [sessions, setSessions] = useState<Array<{ id: string; summary: string; started_at?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!decisionId) return;
      setLoading(true);
      try {
        const decSum = await getDecisionSummary(decisionId);
        setDecisionSummary(decSum);
        const sessList = await listSessions(decisionId);
        const detailed = await Promise.all(
          sessList.map(async s => ({
            id: s.id,
            summary: await getSessionSummary(s.id),
            started_at: s.started_at
          }))
        );
        setSessions(detailed);
      } catch (e: any) {
        setError('Failed to load decision recap');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [decisionId]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Box p={2}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box maxWidth={800} mx="auto" mt={4} p={2}>
      <Typography variant="h4" gutterBottom>Decision Recap</Typography>
      <Typography variant="subtitle1" gutterBottom>Decision Summary:</Typography>
      <Typography paragraph>{decisionSummary}</Typography>
      <Typography variant="subtitle1" gutterBottom>Sessions:</Typography>
      <List>
        {sessions.map((s, idx) => (
          <ListItem key={s.id} disablePadding>
            <ListItemButton onClick={() => navigate(`/decisions/${decisionId}/sessions/${s.id}/review`)}>
              <ListItemText primary={`Session ${idx + 1} Summary`} secondary={s.summary} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Button variant="contained" onClick={() => navigate(`/decisions/${decisionId}/chat`)}>Back to Chat</Button>
    </Box>
  );
};

export default DecisionRecapPage;
