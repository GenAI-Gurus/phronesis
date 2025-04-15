// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Clear error on input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', { email, password });
      setSuccess(true);
      setError(null); // Only clear error on success
      setEmail('');
      setPassword('');
      localStorage.setItem('jwt', resp.data.access_token);
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={6}>
      <Typography variant="h4" mb={2} align="center">Login</Typography>
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
        {success && <Alert severity="success" sx={{ mt: 2 }}>Login successful! Redirecting...</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        <Typography align="center" mt={2}>
          Don&apos;t have an account?{' '}
          <MuiLink component={Link} to="/register">Register</MuiLink>
        </Typography>
      </form>
    </Box>
  );
};

export default LoginPage;
