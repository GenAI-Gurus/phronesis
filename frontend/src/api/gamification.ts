import axios from "./client";

export interface Badge {
  id: string;
  name: string;
  description: string;
  awarded_at?: string;
}

export interface Streak {
  id: string;
  streak_count: number;
  last_checkin: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  completed_at?: string | null;
}

export async function getBadges(): Promise<Badge[]> {
  const res = await axios.get<Badge[]>("/gamification/badges");
  return res.data;
}

export async function getStreaks(): Promise<Streak[]> {
  const res = await axios.get<Streak[]>("/gamification/streaks");
  return res.data;
}

export async function getChallenges(): Promise<Challenge[]> {
  const res = await axios.get<Challenge[]>("/gamification/challenges");
  return res.data;
}

export async function completeChallenge(challengeId: string): Promise<Challenge> {
  const res = await axios.post<Challenge>(`/gamification/challenges/${challengeId}/complete`);
  return res.data;
}
