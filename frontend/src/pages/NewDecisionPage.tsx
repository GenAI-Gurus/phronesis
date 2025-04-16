// src/pages/NewDecisionPage.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Placeholder page for creating a new decision journal entry.
 */
const NewDecisionPage: React.FC = () => (
  <Box maxWidth={600} mx="auto" mt={6}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>New Decision Journal</Typography>
      <Typography variant="body1" color="text.secondary">
        This is a placeholder. The decision journal form will be implemented here.
      </Typography>
    </Paper>
  </Box>
);

export default NewDecisionPage;
