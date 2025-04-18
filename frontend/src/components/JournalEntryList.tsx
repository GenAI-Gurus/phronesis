import React from 'react';
import { JournalEntry } from '../api/journal';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface Props {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
}

export default function JournalEntryList({ entries, onEdit }: Props) {
  if (!entries.length) {
    return <Typography variant="body2">No journal entries yet.</Typography>;
  }
  return (
    <Box>
      <List>
        {entries.map((entry) => (
          <ListItem key={entry.id} alignItems="flex-start" divider>
            <ListItemText
              primary={entry.title}
              secondary={
                <>
                  {entry.context && <><b>Context:</b> {entry.context}<br /></>}
                  {entry.anticipated_outcomes && <><b>Outcomes:</b> {entry.anticipated_outcomes}<br /></>}
                  {entry.values && <><b>Values:</b> {entry.values.join(', ')}<br /></>}
                  {entry.domain && <><b>Domain:</b> {entry.domain}<br /></>}
                  <b>Created:</b> {new Date(entry.created_at).toLocaleString()}<br />
                  <b>Updated:</b> {new Date(entry.updated_at).toLocaleString()}
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => onEdit(entry)}>
                <EditIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
