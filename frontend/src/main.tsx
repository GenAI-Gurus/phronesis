import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './routes/AppRouter';
import CssBaseline from '@mui/material/CssBaseline';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <AppRouter />
  </React.StrictMode>
);
