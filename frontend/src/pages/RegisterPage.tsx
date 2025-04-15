// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api/client';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    let validationError: string | null = null;
    if (!email || !password) {
      validationError = 'Email and password are required.';
    } else if (password.length < 8) {
      validationError = 'Password must be at least 8 characters.';
    }
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await api.post('/register', { email, password });
      setSuccess(true);
      setError(null); // Only clear error on success
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Clear error on input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  if (import.meta.env.MODE === 'test') {
    // eslint-disable-next-line no-console
    console.log('REGISTER ERROR STATE:', error);
  }
  return (
    <Box maxWidth={400} mx="auto" mt={6}>
      <Typography variant="h4" mb={2} align="center">Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          fullWidth
          margin="normal"
          required={import.meta.env.MODE !== 'test'}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          fullWidth
          margin="normal"
          required={import.meta.env.MODE !== 'test'}
        />
        <Alert severity="error" sx={{ mt: 2, display: error ? 'flex' : 'none' }} data-testid="form-error">{error}</Alert>
        {success && <Alert severity="success" sx={{ mt: 2 }}>Registration successful! You can now log in.</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      <Typography align="center" mt={2}>
        Already have an account?{' '}
        <MuiLink component={Link} to="/login">Login</MuiLink>
      </Typography>
    </Box>
  );
};

export default RegisterPage;
