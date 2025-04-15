// src/pages/DashboardPage.tsx
import React from 'react';
import { Box, Typography, Button, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt');

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  if (!jwt) {
    return (
      <Box maxWidth={400} mx="auto" mt={6} textAlign="center">
        <Typography variant="h5" mb={2}>You are not logged in.</Typography>
        <MuiLink component={Link} to="/login">Go to Login</MuiLink>
      </Box>
    );
  }

  return (
    <Box maxWidth={600} mx="auto" mt={6} textAlign="center">
      <Typography variant="h4" mb={2}>Welcome to your Dashboard!</Typography>
      <Typography variant="body1" mb={4}>You are authenticated.</Typography>
      <Button variant="outlined" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
};

export default DashboardPage;
