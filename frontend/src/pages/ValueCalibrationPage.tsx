// src/pages/ValueCalibrationPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Slider,
  Button,
  Alert,
  Stack,
  CircularProgress,
  Divider,
} from '@mui/material';
import { createValueCalibrationCheckin, listValueCalibrationCheckins, ValueCalibrationCheckin } from '../api/valueCalibration';

const VALUE_LIST = [
  'Courage',
  'Honesty',
  'Curiosity',
  'Empathy',
  'Resilience',
];

const min = 1;
const max = 10;

interface ValueCalibrationPageProps {
  initialValues?: { [key: string]: number };
}

const ValueCalibrationPage: React.FC<ValueCalibrationPageProps> = ({ initialValues }) => {
  const [values, setValues] = useState<{ [key: string]: number }>(
    initialValues || Object.fromEntries(VALUE_LIST.map((v) => [v, 5]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ValueCalibrationCheckin[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await listValueCalibrationCheckins();
      setHistory(data);
    } catch {
      setHistoryError('Failed to load check-in history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSliderChange = (name: string) => (_: Event, newValue: number | number[]) => {
    setValues((prev) => ({ ...prev, [name]: newValue as number }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    if (Object.values(values).some((v) => v < min || v > max)) {
      setError('All values must be rated between 1 and 10.');
      return;
    }
    setSubmitting(true);
    try {
      await createValueCalibrationCheckin(values);
      setSuccess(true);
      fetchHistory(); // refresh history
    } catch {
      setError('Failed to submit value calibration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" mb={2}>Value Calibration</Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Rate yourself on each value (1 = low, 10 = high). This helps track your personal growth.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {VALUE_LIST.map((value) => (
              <Box key={value}>
                <Typography gutterBottom>{value}</Typography>
                <Slider
                  value={values[value]}
                  min={min}
                  max={max}
                  step={1}
                  marks={[{ value: min, label: min }, { value: max, label: max }]}
                  onChange={handleSliderChange(value)}
                  valueLabelDisplay="auto"
                  disabled={submitting}
                  data-testid={`slider-${value}`}
                />
              </Box>
            ))}
            {error && <Alert severity="error" data-testid="form-error">{error}</Alert>}
            {success && <Alert severity="success">Check-in submitted!</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              data-testid="submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Check-in'}
            </Button>
          </Stack>
        </form>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" mb={2}>Check-in History</Typography>
        {historyLoading ? (
          <CircularProgress aria-label="Loading check-in history" />
        ) : historyError ? (
          <Alert severity="error">{historyError}</Alert>
        ) : !history || history.length === 0 ? (
          <Typography color="text.secondary">No previous check-ins.</Typography>
        ) : (
          <Stack spacing={2} mt={2}>
            {history.map((c) => {
              let snapshot: Record<string, number> = {};
              try { snapshot = JSON.parse(c.value_snapshot); } catch {}
              return (
                <Paper key={c.id} sx={{ p: 2, bgcolor: '#fafafa' }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(c.created_at).toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={2} mt={1}>
                    {VALUE_LIST.map((v) => (
                      <Box key={v}>
                        <Typography variant="caption">{v}</Typography>
                        <Typography variant="body2" fontWeight={600} data-testid={`history-value-${v}`}>
                          {snapshot[v] ?? '-'}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default ValueCalibrationPage;
