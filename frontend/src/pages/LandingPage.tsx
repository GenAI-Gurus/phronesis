import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh">
    <Typography variant="h2" color="primary" gutterBottom>Phronesis</Typography>
    <Typography variant="h5" gutterBottom>Welcome to your Decision Intelligence Platform</Typography>
    <Typography color="text.secondary" mb={4}>
      Journal, reflect, calibrate your values, and make better life decisions—powered by AI.
    </Typography>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Button component={Link} to="/register" variant="contained" color="primary" size="large">Get Started</Button>
      <Button component={Link} to="/login" variant="outlined" color="primary" size="large">Login</Button>
    </Stack>
  </Box>
);

export default LandingPage;
