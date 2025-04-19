import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import {
  getValueCalibrationCheckins,
  getDecisionJournalEntries,
  ValueCalibrationCheckin,
  DecisionJournalEntry,
} from "../api/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const ProgressVisualizationPage: React.FC = () => {
  const [checkins, setCheckins] = useState<ValueCalibrationCheckin[]>([]);
  const [journalEntries, setJournalEntries] = useState<DecisionJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getValueCalibrationCheckins(),
      getDecisionJournalEntries(),
    ])
      .then(([checkinsRes, journalRes]) => {
        setCheckins(checkinsRes);
        setJournalEntries(journalRes);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.detail || "Failed to load progress data."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Prepare value trends data for chart
  const valueKeys = Array.from(
    new Set(
      checkins.flatMap((c) => Object.keys(c.value_snapshot || {}))
    )
  );
  const valueTrendData = checkins.map((c) => {
    const entry: any = { date: c.checkin_date };
    valueKeys.forEach((k) => {
      entry[k] = c.value_snapshot[k] ?? null;
    });
    return entry;
  });

  // Prepare journal frequency data (by week)
  const journalFreqData = (() => {
    const weekCounts: Record<string, number> = {};
    journalEntries.forEach((e) => {
      const week = e.created_at.slice(0, 7); // YYYY-MM
      weekCounts[week] = (weekCounts[week] || 0) + 1;
    });
    return Object.entries(weekCounts).map(([week, count]) => ({ week, count }));
  })();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Progress Visualization
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        Track your value trends and decision-making activity over time.
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 5 }}>
            <Typography variant="h6" gutterBottom>
              Value Trends
            </Typography>
            {valueTrendData.length > 1 && valueKeys.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={valueTrendData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  {valueKeys.map((k, idx) => (
                    <Line key={k} type="monotone" dataKey={k} stroke={['#1976d2', '#d32f2f', '#388e3c', '#fbc02d', '#7b1fa2'][idx % 5]} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary">Not enough value check-ins to display trends.</Typography>
            )}
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Decision Journal Activity
            </Typography>
            {journalFreqData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={journalFreqData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary">No journal entries yet.</Typography>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};

export default ProgressVisualizationPage;
