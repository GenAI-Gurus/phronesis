import axios from "./client";

export interface LifeTheme {
  id: string;
  theme_text: string;
  created_at: string;
  updated_at: string;
}

export async function getLifeTheme(): Promise<LifeTheme | null> {
  const res = await axios.get<LifeTheme | null>("/life-theme");
  return res.data;
}

export async function setLifeTheme(theme_text: string): Promise<LifeTheme> {
  const res = await axios.post<LifeTheme>("/life-theme", { theme_text });
  return res.data;
}
