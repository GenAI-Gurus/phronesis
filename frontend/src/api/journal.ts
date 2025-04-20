// API client for Decision Journal endpoints
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  context?: string;
  anticipated_outcomes?: string;
  values?: string[];
  domain?: string;
  sentiment?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryCreate {
  title: string;
  context?: string;
  anticipated_outcomes?: string;
  values?: string[];
  domain?: string;
}

export interface JournalEntryUpdate {
  title?: string;
  context?: string;
  anticipated_outcomes?: string;
  values?: string[];
  domain?: string;
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  const resp = await axios.get(`${API_URL}/decisions/journal`, { withCredentials: true });
  return resp.data;
}

export async function createJournalEntry(payload: JournalEntryCreate): Promise<JournalEntry> {
  const resp = await axios.post(`${API_URL}/decisions/journal`, payload, { withCredentials: true });
  return resp.data;
}

export async function updateJournalEntry(id: string, payload: JournalEntryUpdate): Promise<JournalEntry> {
  const resp = await axios.patch(`${API_URL}/decisions/journal/${id}`, payload, { withCredentials: true });
  return resp.data;
}
