// src/pages/ChallengesPage.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Placeholder page for user challenges and gamification.
 */
const ChallengesPage: React.FC = () => (
  <Box maxWidth={600} mx="auto" mt={6}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>Challenges</Typography>
      <Typography variant="body1" color="text.secondary">
        This is a placeholder. Gamification and daily/weekly challenges will be implemented here.
      </Typography>
    </Paper>
  </Box>
);

export default ChallengesPage;
