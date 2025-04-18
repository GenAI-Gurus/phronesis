import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReflectionPromptPage from '../ReflectionPromptPage';
import * as journalApi from '../../api/journal';
import * as reflectionApi from '../../api/reflection';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../api/journal');
vi.mock('../../api/reflection');

const mockEntries = [
  {
    id: '1',
    user_id: 'u1',
    title: 'Test Entry',
    context: 'Some context',
    anticipated_outcomes: 'Some outcome',
    values: ['courage'],
    domain: 'career',
    sentiment: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockPrompts = {
  prompts: [
    'Why did you make this decision?',
    'What values did it touch?',
    'How do you feel now?'
  ],
  ai_generated: true
};

describe('ReflectionPromptPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders journal entries and generates prompts', async () => {
    (journalApi.listJournalEntries as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
    (reflectionApi.generateReflectionPrompts as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockPrompts);
    render(<ReflectionPromptPage />);
    const select = screen.getByLabelText('Select Journal Entry');
    await userEvent.click(select);
    const options = await screen.findAllByRole('option');
    const entryOption = options.find(opt => opt.textContent === 'Test Entry');
    expect(entryOption).toBeDefined();
    await userEvent.click(entryOption!);
    const button = screen.getByText('Generate Prompts');
    await userEvent.click(button);
    await waitFor(() => expect(screen.getByText('Why did you make this decision?')).toBeInTheDocument());
  });

  it('shows error if API fails', async () => {
    (journalApi.listJournalEntries as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
    (reflectionApi.generateReflectionPrompts as unknown as ReturnType<typeof vi.fn>).mockRejectedValue({ response: { data: { detail: 'API Error' } } });
    render(<ReflectionPromptPage />);
    const select = screen.getByLabelText('Select Journal Entry');
    await userEvent.click(select);
    const options = await screen.findAllByRole('option');
    const entryOption = options.find(opt => opt.textContent === 'Test Entry');
    expect(entryOption).toBeDefined();
    await userEvent.click(entryOption!);
    const button = screen.getByText('Generate Prompts');
    await userEvent.click(button);
    await waitFor(() => expect(screen.getByText('API Error')).toBeInTheDocument());
  });

  it('shows empty state if no entries', async () => {
    (journalApi.listJournalEntries as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<ReflectionPromptPage />);
    const select = screen.getByLabelText('Select Journal Entry');
    await userEvent.click(select);
    const options = screen.queryAllByRole('option');
    expect(options.length).toBe(0);
  });
});
