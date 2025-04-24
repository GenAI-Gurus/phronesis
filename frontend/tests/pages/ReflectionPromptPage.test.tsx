import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import ReflectionPromptPage from '../../src/pages/ReflectionPromptPage';

// Mock API modules
vi.mock('../../src/api/journal', () => ({
  listJournalEntries: vi.fn(),
}));
vi.mock('../../src/api/reflection', () => ({
  generateReflectionPrompts: vi.fn(),
}));

import { listJournalEntries as realListJournalEntries } from '../../src/api/journal';
import { generateReflectionPrompts as realGenerateReflectionPrompts } from '../../src/api/reflection';

const listJournalEntries = vi.mocked(realListJournalEntries);
const generateReflectionPrompts = vi.mocked(realGenerateReflectionPrompts);

describe('ReflectionPromptPage', () => {
  beforeEach(() => {
  vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
    if (key === 'jwt') return 'FAKE_TOKEN';
    return null;
  });
    vi.clearAllMocks();
  });

  it('shows empty state if no entries', async () => {
    listJournalEntries.mockResolvedValueOnce([]);
    render(<ReflectionPromptPage />);
    await waitFor(() => {
      expect(screen.getByText(/no journal entries/i)).toBeInTheDocument();
    });
    // Do NOT try to select dropdown or interact with it in this test.
  });

  it('shows error if entries fail to load', async () => {
    listJournalEntries.mockRejectedValueOnce(new Error('fail'));
    render(<ReflectionPromptPage />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load journal entries/i)).toBeInTheDocument();
    });
    // Do NOT try to select dropdown or interact with it in this test.
  });
  it('generates and displays AI prompts', async () => {
    listJournalEntries.mockResolvedValueOnce([
      { id: '1', title: 'Entry 1', user_id: 'u1', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    ]);
    generateReflectionPrompts.mockResolvedValueOnce({
      prompts: ['Prompt 1', 'Prompt 2'],
      ai_generated: true,
    });
    render(<ReflectionPromptPage />);
    const select = await screen.findByLabelText(/select journal entry/i);
    fireEvent.mouseDown(select);
    const option = await screen.findByRole('option', { name: 'Entry 1' });
    fireEvent.click(option);
    fireEvent.click(screen.getByRole('button', { name: /generate prompts/i }));
    await waitFor(() => {
      expect(screen.getByText(/ai-generated prompts/i)).toBeInTheDocument();
      expect(screen.getByText('Prompt 1')).toBeInTheDocument();
      expect(screen.getByText('Prompt 2')).toBeInTheDocument();
    });
  });
  
  it('shows fallback prompt label if ai_generated is false', async () => {
    listJournalEntries.mockResolvedValueOnce([
      { id: '1', title: 'Entry 1', user_id: 'u1', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    ]);
    generateReflectionPrompts.mockResolvedValueOnce({
      prompts: ['Fallback 1'],
      ai_generated: false,
    });
    render(<ReflectionPromptPage />);
    const select = await screen.findByLabelText(/select journal entry/i);
    fireEvent.mouseDown(select);
    const option = await screen.findByRole('option', { name: 'Entry 1' });
    fireEvent.click(option);
    fireEvent.click(screen.getByRole('button', { name: /generate prompts/i }));
    await waitFor(() => {
      expect(screen.getByText(/fallback prompts/i)).toBeInTheDocument();
      expect(screen.getByText('Fallback 1')).toBeInTheDocument();
    });
  });
  
  it('shows error if prompt generation fails', async () => {
    listJournalEntries.mockResolvedValueOnce([
      { id: '1', title: 'Entry 1', user_id: 'u1', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    ]);
    generateReflectionPrompts.mockRejectedValueOnce({ response: { data: { detail: 'API error' } } });
    render(<ReflectionPromptPage />);
    const select = await screen.findByLabelText(/select journal entry/i);
    fireEvent.mouseDown(select);
    const option = await screen.findByRole('option', { name: 'Entry 1' });
    fireEvent.click(option);
    fireEvent.click(screen.getByRole('button', { name: /generate prompts/i }));
    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});
