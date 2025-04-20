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

  const [journals, setJournals] = React.useState<JournalEntry[]>([]);
  const [journalsError, setJournalsError] = React.useState<string | null>(null);
  const [loadingJournals, setLoadingJournals] = React.useState(true);

  React.useEffect(() => {
    setLoadingJournals(true);
    setJournalsError(null);
    import('../api/client').then(({ default: api }) => {
      api.get('/decisions/journal')
        .then((resp) => setJournals(resp.data))
        .catch((err) => setJournalsError(err?.response?.data?.detail || err.message))
        .finally(() => setLoadingJournals(false));
    });
  }, []);

  // TODO: Replace with real user info and badges from backend
  const mockUser = { name: 'User', email: '' };
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
      {loadingJournals ? (
        <Typography color="text.secondary">Loading journals...</Typography>
      ) : journalsError ? (
        <Typography color="error">{journalsError}</Typography>
      ) : journals.length === 0 ? (
        <Box textAlign="center" my={2}>
          <Typography>No journal entries yet.</Typography>
          <Button sx={{ mt: 1 }} variant="contained" onClick={() => navigate('/journal/new')}>+ Create New Entry</Button>
        </Box>
      ) : (
        <RecentJournalsList journals={journals} />
      )}
      <ProgressBadges badges={mockBadges} />
      <Box mt={2} textAlign="center">
        <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
      </Box>
    </Box>
  );
};

export default DashboardPage;
