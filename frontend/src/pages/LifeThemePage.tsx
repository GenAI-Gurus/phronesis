import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import { getLifeTheme, setLifeTheme, LifeTheme } from "../api/lifeTheme";

const LifeThemePage: React.FC = () => {
  const [theme, setTheme] = useState<LifeTheme | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getLifeTheme()
      .then((t) => {
        setTheme(t);
        setInput(t?.theme_text || "");
      })
      .catch(() => setTheme(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await setLifeTheme(input.trim());
      setTheme(res);
      setEditMode(false);
      setSuccess("Life theme saved.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error saving theme.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Life Theme
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        Define your guiding principle or life theme. This helps track your journey and align your decisions.
      </Typography>
      <Box sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Your Current Life Theme
                </Typography>
                {theme && !editMode && (
                  <>
                    <Typography variant="h6">{theme.theme_text}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last updated: {theme.updated_at.slice(0, 10)}
                    </Typography>
                    <Button onClick={() => setEditMode(true)} variant="outlined">
                      Edit
                    </Button>
                  </>
                )}
                {(!theme || editMode) && (
                  <>
                    <TextField
                      label="Life Theme"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      autoFocus
                      disabled={saving}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !input.trim()}
                      >
                        {saving ? <CircularProgress size={20} /> : "Save"}
                      </Button>
                      {editMode && (
                        <Button onClick={() => setEditMode(false)} disabled={saving}>
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default LifeThemePage;
