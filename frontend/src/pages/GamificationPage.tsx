import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Stack,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import {
  getBadges,
  getStreaks,
  getChallenges,
  completeChallenge,
  Badge,
  Streak,
  Challenge,
} from "../api/gamification";

const GamificationPage: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getBadges(), getStreaks(), getChallenges()])
      .then(([badgesRes, streaksRes, challengesRes]) => {
        setBadges(badgesRes);
        setStreaks(streaksRes);
        setChallenges(challengesRes);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || "Failed to load gamification data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCompleteChallenge = async (id: string) => {
    setActionLoading(id);
    try {
      await completeChallenge(id);
      // Refresh challenges
      const updated = await getChallenges();
      setChallenges(updated);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to complete challenge.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Gamification Progress
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Badges
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
  {badges.length === 0 && (
    <Grid item xs={12}>
      <Typography color="text.secondary">No badges earned yet.</Typography>
    </Grid>
  )}
  {badges.map((badge) => (
    <Grid item xs={12} sm={6} md={4} key={badge.id}>
      <Card variant="outlined" sx={{ bgcolor: "#f9fbe7" }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmojiEventsIcon color="warning" />
            <Typography fontWeight={600}>{badge.name}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {badge.description}
          </Typography>
          {badge.awarded_at && (
            <Chip label={`Awarded: ${badge.awarded_at.slice(0, 10)}`} size="small" sx={{ mt: 1 }} />
          )}
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Streaks
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
  {streaks.length === 0 && (
    <Grid item xs={12}>
      <Typography color="text.secondary">No streaks yet.</Typography>
    </Grid>
  )}
  {streaks.map((streak) => (
    <Grid item xs={12} sm={6} md={4} key={streak.id}>
      <Card variant="outlined" sx={{ bgcolor: "#fffde7" }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WhatshotIcon color="error" />
            <Typography fontWeight={600}>{streak.streak_count} days</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Last check-in: {streak.last_checkin.slice(0, 10)}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Challenges
          </Typography>
          <Grid container spacing={2}>
  {challenges.length === 0 && (
    <Grid item xs={12}>
      <Typography color="text.secondary">No challenges yet.</Typography>
    </Grid>
  )}
  {challenges.map((challenge) => (
    <Grid item xs={12} sm={6} md={4} key={challenge.id}>
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1}>
            {challenge.completed_at ? (
              <Tooltip title="Completed">
                <CheckCircleIcon color="success" />
              </Tooltip>
            ) : (
              <Tooltip title="Incomplete">
                <LockIcon color="disabled" />
              </Tooltip>
            )}
            <Typography fontWeight={600}>{challenge.name}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {challenge.description}
          </Typography>
          {challenge.completed_at ? (
            <Chip label={`Completed: ${challenge.completed_at.slice(0, 10)}`} size="small" sx={{ mt: 1 }} />
          ) : (
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
              disabled={!!actionLoading}
              onClick={() => handleCompleteChallenge(challenge.id)}
            >
              {actionLoading === challenge.id ? <CircularProgress size={18} /> : "Mark as Completed"}
            </Button>
          )}
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
        </>
      )}
    </Container>
  );
};

export default GamificationPage;
