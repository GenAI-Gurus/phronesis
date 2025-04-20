import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Stack, CircularProgress, Alert, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Shows full details of a Decision Journal Entry, including AI-generated tags.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JournalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/decisions/journal/${id}`);
        if (!resp.ok) throw new Error((await resp.json()).detail || 'Failed to fetch entry');
        setEntry(await resp.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    return (
      <Box mt={8} textAlign="center">
        <Alert severity="warning">You must be logged in to view this journal entry.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/login')}>Go to Login</Button>
      </Box>
    );
  }
  if (loading) return <Box mt={8} textAlign="center"><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!entry) return <Typography mt={8} textAlign="center">Entry not found.</Typography>;

  return (
    <Box maxWidth={700} mx="auto" mt={6}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack direction="row" spacing={2} mb={2}>
          <Button onClick={() => navigate(-1)}>&larr; Back</Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(`/journal/${entry.id}/edit`)}>
            Edit
          </Button>
        </Stack>
        <Typography variant="h4" mb={2}>{entry.title}</Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>{new Date(entry.created_at || '').toLocaleString()}</Typography>
        <Typography variant="body1" mb={2}><b>Context:</b> {entry.context}</Typography>
        <Typography variant="body1" mb={2}><b>Anticipated Outcomes:</b> {entry.anticipated_outcomes}</Typography>
        <Typography variant="body1" mb={2}><b>Values:</b> {Array.isArray(entry.values) ? entry.values.join(', ') : entry.values}</Typography>
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>AI-Generated Tags</Typography>
          <Stack direction="row" spacing={1} mb={1}>
            <Typography variant="body2">Domain:</Typography>
            {Array.isArray(entry.domain_tags) && entry.domain_tags.map((tag: string) => (
              <Chip key={tag} label={tag} color="primary" size="small" />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} mb={1}>
            <Typography variant="body2">Sentiment:</Typography>
            <Chip label={entry.sentiment_tag || 'N/A'} color="secondary" size="small" />
          </Stack>
          <Stack direction="row" spacing={1} mb={1}>
            <Typography variant="body2">Keywords:</Typography>
            {Array.isArray(entry.keywords) && entry.keywords.map((kw: string) => (
              <Chip key={kw} label={kw} variant="outlined" size="small" />
            ))}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default JournalDetailPage;
