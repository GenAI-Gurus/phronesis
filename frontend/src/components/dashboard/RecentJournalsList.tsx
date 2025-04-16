// src/components/dashboard/RecentJournalsList.tsx
import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Link } from '@mui/material';

export interface JournalEntry {
  id: string;
  title: string;
  created_at: string;
}

interface RecentJournalsListProps {
  journals: JournalEntry[];
}

/**
 * Lists recent decision journals with links.
 */
const RecentJournalsList: React.FC<RecentJournalsListProps> = ({ journals }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6" mb={1}>Recent Decisions</Typography>
      {journals.length === 0 ? (
        <Typography color="text.secondary">No decisions yet.</Typography>
      ) : (
        <List>
          {journals.map(journal => (
            <ListItem key={journal.id} disablePadding>
              <ListItemText
                primary={<Link href={`/journal/${journal.id}`}>{journal.title}</Link>}
                secondary={new Date(journal.created_at).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardContent>
  </Card>
);

export default RecentJournalsList;
