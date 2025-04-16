// src/pages/ValueCalibrationPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Slider,
  Button,
  Alert,
  Stack,
} from '@mui/material';

const VALUE_LIST = [
  'Courage',
  'Honesty',
  'Curiosity',
  'Empathy',
  'Resilience',
];

const min = 1;
const max = 10;

const ValueCalibrationPage: React.FC = () => {
  const [values, setValues] = useState<{ [key: string]: number }>(
    Object.fromEntries(VALUE_LIST.map((v) => [v, 5]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (name: string) => (_: Event, newValue: number | number[]) => {
    setValues((prev) => ({ ...prev, [name]: newValue as number }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    // Validate all values are set
    if (Object.values(values).some((v) => v < min || v > max)) {
      setError('All values must be rated between 1 and 10.');
      return;
    }
    setSubmitting(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccess(true);
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
      </Paper>
    </Box>
  );
};

export default ValueCalibrationPage;
