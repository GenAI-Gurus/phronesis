import React from 'react';

// Debug: Log the API URL at runtime
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
import ReactDOM from 'react-dom/client';
import AppRouter from './routes/AppRouter';
import CssBaseline from '@mui/material/CssBaseline';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <AppRouter />
  </React.StrictMode>
);
