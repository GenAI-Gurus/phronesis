// src/pages/ReflectionPage.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Placeholder page for reflection prompts and responses.
 */
const ReflectionPage: React.FC = () => (
  <Box maxWidth={600} mx="auto" mt={6}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>Reflection</Typography>
      <Typography variant="body1" color="text.secondary">
        This is a placeholder. Reflection prompts and responses will be implemented here.
      </Typography>
    </Paper>
  </Box>
);

export default ReflectionPage;
