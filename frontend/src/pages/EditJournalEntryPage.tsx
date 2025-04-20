import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Edit form for Decision Journal Entry. On submit, updates entry and displays updated tags.
 */
const EditJournalEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    title: '',
    context: '',
    anticipated_outcomes: '',
    values: '',
  });
  const [original, setOriginal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/decisions/journal/${id}`);
        if (!resp.ok) throw new Error((await resp.json()).detail || 'Failed to fetch entry');
        const data = await resp.json();
        setOriginal(data);
        setForm({
          title: data.title || '',
          context: data.context || '',
          anticipated_outcomes: data.anticipated_outcomes || '',
          values: Array.isArray(data.values) ? data.values.join(', ') : data.values || '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch(`/api/decisions/journal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          context: form.context,
          anticipated_outcomes: form.anticipated_outcomes,
          values: form.values.split(',').map(v => v.trim()).filter(Boolean),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || 'Unknown error');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box mt={8} textAlign="center"><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!original) return null;

  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>&larr; Back</Button>
        <Typography variant="h4" mb={2}>Edit Decision Journal Entry</Typography>
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
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {result && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>AI-Generated Tags (Updated)</Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tags have been updated by AI based on your changes.
            </Typography>
            <Stack direction="row" spacing={1} mb={1}>
              <Typography variant="body2">Domain:</Typography>
              {Array.isArray(result.domain_tags) && result.domain_tags.map((tag: string) => (
                <Button key={tag} variant="outlined" size="small">{tag}</Button>
              ))}
            </Stack>
            <Stack direction="row" spacing={1} mb={1}>
              <Typography variant="body2">Sentiment:</Typography>
              <Button variant="outlined" size="small">{result.sentiment_tag || 'N/A'}</Button>
            </Stack>
            <Stack direction="row" spacing={1} mb={1}>
              <Typography variant="body2">Keywords:</Typography>
              {Array.isArray(result.keywords) && result.keywords.map((kw: string) => (
                <Button key={kw} variant="outlined" size="small">{kw}</Button>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EditJournalEntryPage;
