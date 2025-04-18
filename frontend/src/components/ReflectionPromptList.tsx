import React from 'react';
import { Box, List, ListItem, ListItemText, Typography, CircularProgress, Alert } from '@mui/material';

interface Props {
  prompts: string[];
  loading?: boolean;
  error?: string | null;
}

export default function ReflectionPromptList({ prompts, loading, error }: Props) {
  if (loading) return <Box textAlign="center"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!prompts.length) return <Typography>No prompts generated yet.</Typography>;
  return (
    <List>
      {prompts.map((prompt, idx) => (
        <ListItem key={idx}>
          <ListItemText primary={prompt} />
        </ListItem>
      ))}
    </List>
  );
}
