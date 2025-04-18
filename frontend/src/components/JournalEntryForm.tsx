import React, { useState } from 'react';
import { TextField, Button, Box, Stack } from '@mui/material';
import { JournalEntryCreate, JournalEntryUpdate, JournalEntry } from '../api/journal';

interface Props {
  initial?: Partial<JournalEntry>;
  onSubmit: (values: JournalEntryCreate | JournalEntryUpdate) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export default function JournalEntryForm({ initial = {}, onSubmit, submitLabel = 'Save', loading }: Props) {
  const [values, setValues] = useState<Partial<JournalEntryCreate | JournalEntryUpdate>>({ ...initial });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value.split(',').map((v) => v.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.title || values.title.trim() === '') {
      setError('Title is required');
      return;
    }
    try {
      await onSubmit(values as JournalEntryCreate | JournalEntryUpdate);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save entry');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          name="title"
          label="Title"
          value={values.title || ''}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <TextField
          name="context"
          label="Context"
          value={values.context || ''}
          onChange={handleChange}
          multiline
          minRows={2}
          disabled={loading}
        />
        <TextField
          name="anticipated_outcomes"
          label="Anticipated Outcomes"
          value={values.anticipated_outcomes || ''}
          onChange={handleChange}
          multiline
          minRows={2}
          disabled={loading}
        />
        <TextField
          name="values"
          label="Values (comma-separated)"
          value={Array.isArray(values.values) ? values.values.join(', ') : values.values || ''}
          onChange={handleArrayChange}
          disabled={loading}
        />
        <TextField
          name="domain"
          label="Domain (e.g., career, health)"
          value={values.domain || ''}
          onChange={handleChange}
          disabled={loading}
        />
        {error && <Box color="error.main">{error}</Box>}
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
