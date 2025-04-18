import React, { useState } from 'react';
import { Box, Typography, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { listJournalEntries, JournalEntry } from '../api/journal';
import { generateReflectionPrompts } from '../api/reflection';
import ReflectionPromptList from '../components/ReflectionPromptList';

export default function ReflectionPromptPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string>('');
  const [prompts, setPrompts] = useState<string[]>([]);
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
    try {
      const resp = await generateReflectionPrompts(selectedEntry);
      setPrompts(resp.prompts);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate prompts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Reflection Prompts</Typography>
      <FormControl fullWidth margin="normal" disabled={entryLoading || loading}>
        <InputLabel id="entry-select-label">Select Journal Entry</InputLabel>
        <Select
          labelId="entry-select-label"
          value={selectedEntry}
          label="Select Journal Entry"
          onChange={e => setSelectedEntry(e.target.value)}
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
      >
        Generate Prompts
      </Button>
      <Box mt={3}>
        <ReflectionPromptList prompts={prompts} loading={loading} error={error} />
      </Box>
    </Box>
  );
}
