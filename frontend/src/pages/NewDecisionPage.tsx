// src/pages/NewDecisionPage.tsx
import React, { useState } from 'react';
import api from '../api/client';
import { Box, Typography, Paper, TextField, Button, Chip, Stack, Alert } from '@mui/material';

/**
 * Decision Journal Entry creation form with AI-generated auto-tag display.
 * Submits to backend and displays tags (domain, sentiment, keywords) after creation.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NewDecisionPage: React.FC = () => {
  const [form, setForm] = useState({
    title: '',
    context: '',
    anticipated_outcomes: '',
    values: '',
  });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await api.post('/decisions/journal', {
        ...form,
        values: form.values.split(',').map(v => v.trim()).filter(Boolean),
      });
      setResult(resp.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    return (
      <Box mt={8} textAlign="center">
        <Alert severity="warning">You must be logged in to create a journal entry.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/login')}>Go to Login</Button>
      </Box>
    );
  }

  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" mb={2}>New Decision Journal</Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Context"
              name="context"
              value={form.context}
              onChange={handleChange}
              required
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Anticipated Outcomes"
              name="anticipated_outcomes"
              value={form.anticipated_outcomes}
              onChange={handleChange}
              required
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Values (comma-separated)"
              name="values"
              value={form.values}
              onChange={handleChange}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </Stack>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {result && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>AI-Generated Tags</Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              The following tags were generated automatically by AI based on your entry.
            </Typography>
            <Stack direction="row" spacing={1} mb={1}>
              <Typography variant="body2">Domain:</Typography>
              {Array.isArray(result.domain_tags) && result.domain_tags.map((tag: string) => (
                <Chip key={tag} label={tag} color="primary" size="small" />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} mb={1}>
              <Typography variant="body2">Sentiment:</Typography>
              <Chip label={result.sentiment_tag || 'N/A'} color="secondary" size="small" />
            </Stack>
            <Stack direction="row" spacing={1} mb={1}>
              <Typography variant="body2">Keywords:</Typography>
              {Array.isArray(result.keywords) && result.keywords.map((kw: string) => (
                <Chip key={kw} label={kw} variant="outlined" size="small" />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default NewDecisionPage;
