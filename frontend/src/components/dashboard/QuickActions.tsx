// src/components/dashboard/QuickActions.tsx
import React from 'react';
import { Card, CardContent, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * Displays quick action buttons for dashboard navigation.
 */
const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/journal/new')}>New Decision</Button>
          <Button variant="outlined" onClick={() => navigate('/value-calibration')}>Value Calibration</Button>
          <Button variant="outlined" onClick={() => navigate('/reflection')}>Reflection</Button>
          <Button variant="outlined" onClick={() => navigate('/challenges')}>Challenges</Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
