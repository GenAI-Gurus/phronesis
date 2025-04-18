import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, CircularProgress, Snackbar } from '@mui/material';
import { listJournalEntries, createJournalEntry, updateJournalEntry, JournalEntry } from '../api/journal';
import JournalEntryForm from '../components/JournalEntryForm';
import JournalEntryList from '../components/JournalEntryList';

export default function DecisionJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await listJournalEntries();
      setEntries(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await createJournalEntry(values);
      setSnackbar({ open: true, message: 'Entry created!' });
      setOpen(false);
      fetchEntries();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.detail || 'Failed to create entry' });
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditEntry(entry);
    setOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editEntry) return;
    try {
      await updateJournalEntry(editEntry.id, values);
      setSnackbar({ open: true, message: 'Entry updated!' });
      setEditEntry(null);
      setOpen(false);
      fetchEntries();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.detail || 'Failed to update entry' });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditEntry(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Decision Journal</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <JournalEntryList entries={entries} onEdit={handleEdit} />
      )}
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={() => { setEditEntry(null); setOpen(true); }}>
          New Entry
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editEntry ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle>
        <DialogContent>
          <JournalEntryForm
            initial={editEntry || {}}
            onSubmit={editEntry ? handleUpdate : handleCreate}
            submitLabel={editEntry ? 'Update' : 'Create'}
          />
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
}
