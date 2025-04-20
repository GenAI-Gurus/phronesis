import axios from "./client";

export interface ValueCalibrationCheckin {
  checkin_date: string;
  value_snapshot: Record<string, number>;
}

export async function getValueCalibrationCheckins(): Promise<ValueCalibrationCheckin[]> {
  const response = await axios.get<ValueCalibrationCheckin[]>(
    "/api/value-calibration/checkins"
  );
  return response.data;
}

export interface DecisionJournalEntry {
  created_at: string;
}

export async function getDecisionJournalEntries(): Promise<DecisionJournalEntry[]> {
  const response = await axios.get<DecisionJournalEntry[]>(
    "/api/decisions/journal"
  );
  return response.data;
}
