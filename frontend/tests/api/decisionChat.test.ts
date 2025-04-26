import axios from 'axios';
import { 
  getDecisionById, 
  getOrCreateSession, 
  getSessionMessages, 
  postSessionMessage, 
  endSession, 
  listSessions, 
  getSessionSummary, 
  getDecisionSummary,
  chatSession,
  Session, 
  Message 
} from '../../src/api/decisionChat';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() }
}));
const mockedAxios = axios as any;

describe('decisionChat API layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDecisionById calls correct endpoint and returns data', async () => {
    const decision = { id: 'd1', title: 'Test', description: 'Desc', domain_tags: [], keywords: [] };
    mockedAxios.get.mockResolvedValueOnce({ data: decision });
    const result = await getDecisionById('d1');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/decisions/d1');
    expect(result).toEqual(decision);
  });

  it('getOrCreateSession returns existing session when found', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const existing: Session = { id: 's1', decision_id: 'd1', started_at: today + 'T00:00:00Z', status: 'active' };
    mockedAxios.get.mockResolvedValueOnce({ data: [existing] });
    const session = await getOrCreateSession('d1');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/sessions', { params: { decision_id: 'd1' } });
    expect(session).toEqual(existing);
  });

  it('getOrCreateSession creates new session when none exists', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const newSession: Session = { id: 's2', decision_id: 'd1', started_at: '2025-01-01T00:00:00Z', status: 'active' };
    mockedAxios.post.mockResolvedValueOnce({ data: newSession });
    const session = await getOrCreateSession('d1');
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/sessions', { decision_id: 'd1' });
    expect(session).toEqual(newSession);
  });

  it('getSessionMessages fetches messages', async () => {
    const msgs: Message[] = [{ id: 'm1', session_id: 's1', sender: 'user', content: 'Hello' }];
    mockedAxios.get.mockResolvedValueOnce({ data: msgs });
    const result = await getSessionMessages('s1');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/sessions/s1/messages');
    expect(result).toEqual(msgs);
  });

  it('postSessionMessage posts message and returns it', async () => {
    const msg: Message = { id: 'm2', session_id: 's1', sender: 'ai', content: 'Reply' };
    mockedAxios.post.mockResolvedValueOnce({ data: msg });
    const result = await postSessionMessage('s1', { sender: 'ai', content: 'Reply' });
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/sessions/s1/messages', { sender: 'ai', content: 'Reply' });
    expect(result).toEqual(msg);
  });

  it('endSession patches session status', async () => {
    const updated: Session = { id: 's1', decision_id: 'd1', started_at: '', completed_at: '2025-01-01T00:01:00Z', status: 'completed' };
    mockedAxios.patch.mockResolvedValueOnce({ data: updated });
    const result = await endSession('s1', 'summary');
    expect(mockedAxios.patch).toHaveBeenCalledWith('/api/v1/sessions/s1', { status: 'completed', summary: 'summary' });
    expect(result).toEqual(updated);
  });

  it('listSessions calls correct endpoint and returns data', async () => {
    const sessions: Session[] = [{ id: 's1', decision_id: 'd1', started_at: '2025-01-01T00:00:00Z', status: 'active' }];
    mockedAxios.get.mockResolvedValueOnce({ data: sessions });
    const result = await listSessions('d1');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/decisions/d1/sessions');
    expect(result).toEqual(sessions);
  });

  it('getSessionSummary calls correct endpoint and returns summary', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { summary: 'session summary' } });
    const result = await getSessionSummary('s1');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/decisions/sessions/s1/summary');
    expect(result).toBe('session summary');
  });

  it('getDecisionSummary calls correct endpoint and returns summary', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { summary: 'decision summary' } });
    const result = await getDecisionSummary('d1');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/decisions/d1/summary');
    expect(result).toBe('decision summary');
  });

  it('chatSession calls correct endpoint and returns data', async () => {
    const chatData = { reply: 'AI says hi', suggestions: ['Next'] };
    mockedAxios.post.mockResolvedValueOnce({ data: chatData });
    const messages = [{ role: 'user', content: 'Hello' }];
    const result = await chatSession('s1', messages);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/v1/decisions/sessions/s1/chat',
      { messages }
    );
    expect(result).toEqual(chatData);
  });
});
