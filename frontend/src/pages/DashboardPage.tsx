// src/pages/DashboardPage.tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserSummaryCard from '../components/dashboard/UserSummaryCard';
import RecentJournalsList, { JournalEntry } from '../components/dashboard/RecentJournalsList';
import QuickActions from '../components/dashboard/QuickActions';
import ProgressBadges, { Badge } from '../components/dashboard/ProgressBadges';

/**
 * DashboardPage displays the main user dashboard with summary, journals, actions, and badges.
 * Modular, responsive, and ready for backend integration.
 */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt');

  // TODO: Replace with real API calls
  const mockUser = { name: 'Alex Example', email: 'alex@example.com' };
  const mockJournals: JournalEntry[] = [
    { id: '1', title: 'Should I switch jobs?', created_at: '2025-04-13T10:00:00Z' },
    { id: '2', title: 'Buying a new car decision', created_at: '2025-04-10T15:30:00Z' }
  ];
  const mockBadges: Badge[] = [
    { id: 'b1', name: 'Reflector', description: 'Completed first reflection' },
    { id: 'b2', name: 'Streak Starter', description: 'Logged decisions 3 days in a row' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  if (!jwt) {
    return (
      <Box maxWidth={400} mx="auto" mt={6} textAlign="center">
        <Typography variant="h5" mb={2}>You are not logged in.</Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>Go to Login</Button>
      </Box>
    );
  }

  return (
    <Box maxWidth={800} mx="auto" mt={6}>
      <UserSummaryCard name={mockUser.name} email={mockUser.email} />
      <Box mt={3} mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Life Theme</Typography>
          <Button size="small" variant="outlined" onClick={() => navigate('/life-theme')}>View / Edit</Button>
        </Box>
        <Typography color="text.secondary" mt={1}>
          Define your guiding principle to help align your decisions and track your journey.
        </Typography>
      </Box>
      <QuickActions />
      <RecentJournalsList journals={mockJournals} />
      <ProgressBadges badges={mockBadges} />
      <Box mt={2} textAlign="center">
        <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
      </Box>
    </Box>
  );
};

export default DashboardPage;
