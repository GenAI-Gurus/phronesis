import axios from 'axios';

export interface Session {
  id: string;
  decision_id: string;
  title?: string;
  started_at: string;
  completed_at?: string;
  status: string;
  summary?: string;
  insights?: string;
}

export interface Message {
  id?: string;
  session_id?: string;
  sender: 'user' | 'ai';
  content: string;
  created_at?: string;
}

// Fetch a decision by ID
export async function getDecisionById(decisionId: string) {
  const { data } = await axios.get(`/api/v1/decisions/${decisionId}`);
  return data;
}

// 1. Get or create a session for today for a given decision
export async function getOrCreateSession(decisionId: string): Promise<Session> {
  const { data: sessions } = await axios.get('/api/v1/sessions', { params: { decision_id: decisionId } });
  // Find session for today (pseudo-code, adjust for your backend's date logic)
  const today = new Date().toISOString().slice(0, 10);
  let session = sessions.find((s: Session) => s.started_at && s.started_at.slice(0, 10) === today && s.status !== 'completed');
  if (session) return session;
  // Create new session if none found
  const { data: newSession } = await axios.post('/api/v1/sessions', { decision_id: decisionId });
  return newSession;
}

// 2. Fetch all messages for a session
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const { data } = await axios.get(`/api/v1/sessions/${sessionId}/messages`);
  return data;
}

// 3. Post a message to a session
export async function postSessionMessage(sessionId: string, message: Message): Promise<Message> {
  const { data } = await axios.post(`/api/v1/sessions/${sessionId}/messages`, message);
  return data;
}

// 4. End/complete a session
export async function endSession(sessionId: string, summary?: string): Promise<Session> {
  const { data } = await axios.patch(`/api/v1/sessions/${sessionId}`, { status: 'completed', summary });
  return data;
}

// 5. List all sessions for a decision
export async function listSessions(decisionId: string): Promise<Session[]> {
  const { data } = await axios.get(`/api/v1/decisions/${decisionId}/sessions`);
  return data;
}

// 6. Get the summary of a session
export async function getSessionSummary(sessionId: string): Promise<string> {
  const { data } = await axios.get(`/api/v1/decisions/sessions/${sessionId}/summary`);
  return data.summary;
}

// 7. Get the summary of a decision
export async function getDecisionSummary(decisionId: string): Promise<string> {
  const { data } = await axios.get(`/api/v1/decisions/${decisionId}/summary`);
  return data.summary;
}

// 8. Chat endpoint for AI replies in a session
export async function chatSession(sessionId: string, messages: { role: string; content: string }[]): Promise<{ reply: string; suggestions?: string[] }> {
  const { data } = await axios.post(`/api/v1/decisions/sessions/${sessionId}/chat`, { messages });
  return data;
}
