// src/components/dashboard/UserSummaryCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';

interface UserSummaryCardProps {
  name: string;
  email: string;
}

/**
 * Displays the user's name and email in a summary card.
 */
const UserSummaryCard: React.FC<UserSummaryCardProps> = ({ name, email }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar>{name[0]}</Avatar>
        <Box>
          <Typography variant="h6">{name}</Typography>
          <Typography variant="body2" color="text.secondary">{email}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default UserSummaryCard;
