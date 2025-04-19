import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { simulateFutureSelf } from "../api/futureSelf";

const FutureSelfSimulatorPage: React.FC = () => {
  const [decisionContext, setDecisionContext] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [valueInput, setValueInput] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [result, setResult] = useState<null | {
    future_projection: string;
    suggestions?: string[];
    ai_generated: boolean;
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddValue = () => {
    if (valueInput.trim() && !values.includes(valueInput.trim())) {
      setValues([...values, valueInput.trim()]);
      setValueInput("");
    }
  };

  const handleDeleteValue = (val: string) => {
    setValues(values.filter((v) => v !== val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const response = await simulateFutureSelf({
        decision_context: decisionContext,
        values: values.length ? values : undefined,
        time_horizon: timeHorizon || undefined,
      });
      setResult(response);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Future-Self Simulator
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        Enter your decision or dilemma. Optionally add values and a time horizon. Get an AI-powered projection of your likely future self.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Decision Context"
          value={decisionContext}
          onChange={(e) => setDecisionContext(e.target.value)}
          required
          fullWidth
          multiline
          minRows={3}
          margin="normal"
        />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 2 }}>
          <TextField
            label="Add Value"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddValue();
              }
            }}
            size="small"
          />
          <Button onClick={handleAddValue} variant="outlined" size="small">
            Add
          </Button>
          {values.map((val) => (
            <Chip
              key={val}
              label={val}
              onDelete={() => handleDeleteValue(val)}
              color="primary"
            />
          ))}
        </Stack>
        <TextField
          label="Time Horizon (e.g. 2 years)"
          value={timeHorizon}
          onChange={(e) => setTimeHorizon(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box sx={{ mt: 2, mb: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !decisionContext.trim()}
            fullWidth
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : "Simulate Future Self"}
          </Button>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {result && (
        <Box sx={{ mt: 4, p: 3, border: "1px solid #eee", borderRadius: 2, bgcolor: "#fafbfc" }}>
          <Typography variant="h6" gutterBottom>
            AI Projection
          </Typography>
          <Typography sx={{ mb: 2 }}>{result.future_projection}</Typography>
          {result.suggestions && result.suggestions.length > 0 && (
            <Box>
              <Typography variant="subtitle1">Suggestions:</Typography>
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default FutureSelfSimulatorPage;
