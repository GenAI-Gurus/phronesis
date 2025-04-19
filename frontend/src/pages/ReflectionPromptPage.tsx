import React, { useState } from 'react';
import { Box, Typography, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { listJournalEntries, JournalEntry } from '../api/journal';
import { generateReflectionPrompts } from '../api/reflection';
import ReflectionPromptList from '../components/ReflectionPromptList';

export default function ReflectionPromptPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string>('');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [aiGenerated, setAiGenerated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryLoading, setEntryLoading] = useState(false);

  React.useEffect(() => {
    setEntryLoading(true);
    listJournalEntries()
      .then(setEntries)
      .catch(() => setError('Failed to load journal entries'))
      .finally(() => setEntryLoading(false));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPrompts([]);
    setAiGenerated(null);
    try {
      const resp = await generateReflectionPrompts(selectedEntry);
      setPrompts(resp.prompts);
      setAiGenerated(!!resp.ai_generated);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate prompts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Reflection Prompts</Typography>
      {entryLoading ? (
        <Box my={4} textAlign="center"><span role="status" aria-live="polite">Loading entries...</span></Box>
      ) : entries.length === 0 ? (
        <Typography color="text.secondary" mt={3}>No journal entries available. Create a decision journal entry first.</Typography>
      ) : (
        <>
          <FormControl fullWidth margin="normal" disabled={entryLoading || loading}>
            <InputLabel id="entry-select-label">Select Journal Entry</InputLabel>
            <Select
              labelId="entry-select-label"
              value={selectedEntry}
              label="Select Journal Entry"
              onChange={e => setSelectedEntry(e.target.value)}
              inputProps={{ 'aria-label': 'Select Journal Entry' }}
            >
              {entries.map(entry => (
                <MenuItem value={entry.id} key={entry.id}>{entry.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedEntry || loading}
            onClick={handleGenerate}
            sx={{ mt: 2 }}
            aria-label="Generate Prompts"
          >
            {loading ? 'Generating...' : 'Generate Prompts'}
          </Button>
        </>
      )}
      {error && <Typography color="error" mt={2}>{error}</Typography>}
      {prompts.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle1" color="text.secondary" mb={1}>
            {aiGenerated == null ? '' : aiGenerated ? 'AI-generated prompts' : 'Fallback prompts (static)'}
          </Typography>
          <ReflectionPromptList prompts={prompts} loading={loading} error={error} />
        </Box>
      )}
    </Box>
  );
}

