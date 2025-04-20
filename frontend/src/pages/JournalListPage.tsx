import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Stack, CircularProgress, Alert, List, ListItem, ListItemButton, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * Lists all Decision Journal Entries for the logged-in user.
 * Shows title, date, domain_tags, sentiment_tag, and navigates to detail view.
 */
const JournalListPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/decisions/journal');
        if (!resp.ok) throw new Error((await resp.json()).detail || 'Failed to fetch journal entries');
        setEntries(await resp.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      navigate('/login');
    }
  }, [navigate]);

  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    return (
      <Box mt={8} textAlign="center">
        <Alert severity="warning">You must be logged in to view your journal.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/login')}>Go to Login</Button>
      </Box>
    );
  }
  if (loading) return <Box mt={8} textAlign="center"><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!entries.length) return (
    <Box mt={8} textAlign="center">
      <Typography>No journal entries found.</Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/journal/new')}>+ Create New Entry</Button>
    </Box>
  );

  return (
    <Box maxWidth={700} mx="auto" mt={6}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" mb={2}>Decision Journal Entries</Typography>
        <Box mb={2}>
          <Button variant="contained" color="primary" onClick={() => navigate('/journal/new')}>
            + Create New Entry
          </Button>
        </Box>
        <List>
          {entries.map(entry => (
            <ListItem key={entry.id} disablePadding>
              <ListItemButton onClick={() => navigate(`/journal/${entry.id}`)}>
                <ListItemText
                  primary={entry.title}
                  secondary={new Date(entry.created_at || '').toLocaleString()}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  {Array.isArray(entry.domain_tags) && entry.domain_tags.map((tag: string) => (
                    <Chip key={tag} label={tag} color="primary" size="small" />
                  ))}
                  <Chip label={entry.sentiment_tag || 'N/A'} color="secondary" size="small" />
                </Stack>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default JournalListPage;
