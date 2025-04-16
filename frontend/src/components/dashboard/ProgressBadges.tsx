// src/components/dashboard/ProgressBadges.tsx
import React from 'react';
import { Card, CardContent, Typography, Chip, Stack } from '@mui/material';

export interface Badge {
  id: string;
  name: string;
  description: string;
}

interface ProgressBadgesProps {
  badges: Badge[];
}

/**
 * Displays earned badges as chips.
 */
const ProgressBadges: React.FC<ProgressBadgesProps> = ({ badges }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6" mb={1}>Badges</Typography>
      {badges.length === 0 ? (
        <Typography color="text.secondary">No badges earned yet.</Typography>
      ) : (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {badges.map(badge => (
            <Chip key={badge.id} label={badge.name} title={badge.description} color="success" />
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default ProgressBadges;
