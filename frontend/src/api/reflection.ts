// API client for Reflection Prompt Generator
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface ReflectionPromptResponse {
  prompts: string[];
  ai_generated: boolean;
}

export async function generateReflectionPrompts(entry_id: string): Promise<ReflectionPromptResponse> {
  const resp = await axios.post(`${API_URL}/reflection/prompts/generate`, { entry_id }, { withCredentials: true });
  return resp.data;
}
